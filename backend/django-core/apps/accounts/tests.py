"""Backend Unit & Integration Test Suite — CEP Platform.

Tests:
1. Server-side RBAC permission matching & ABAC Scope restrictions.
2. Assignment transfer atomicity and single active seat invariant.
3. Anti-double vote enforcement with DB transaction locks.
4. Secret vote decoupling and receipt verification.
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

from apps.accounts.models import User, Role
from apps.elections.models import Election
from apps.geography.models import GeoVersion, GeographicNode, VotingCenter, PollingStation
from apps.registry.models import Elector, ParticipationToken, Ballot
from apps.operations.models import ElectionAssignment, VotingZone, Device
from apps.operations.services import transfer_elector_assignment, validate_nomadic_geofence
from apps.registry.services import record_voter_participation, submit_anonymous_ballot


class RBACAndScopeTestCase(TestCase):
    def setUp(self):
        self.user_ouest = User.objects.create(
            username="test.ouest",
            role=Role.MEMBER_CEP,
            permissions=["candidate.view", "candidate.approve"],
            scope={"departments": ["Ouest"]}
        )

    def test_permission_matching(self):
        self.assertTrue(self.user_ouest.has_perm_code("candidate.view"))
        self.assertTrue(self.user_ouest.has_perm_code("candidate.approve"))
        self.assertFalse(self.user_ouest.has_perm_code("device.revoke"))

    def test_scope_matching(self):
        self.assertTrue(self.user_ouest.has_scope_target({"department": "Ouest"}))
        self.assertFalse(self.user_ouest.has_scope_target({"department": "Nord"}))


class DevOpsAndElectoralIsolationTestCase(TestCase):
    def setUp(self):
        self.president = User.objects.create(
            username="president.test",
            role=Role.ADMIN_CEP,
            permissions=["election.view", "candidate.approve", "pv.validate"],
            scope={"isGlobal": True}
        )
        self.devops = User.objects.create(
            username="devops.test",
            role=Role.SUPERADMIN_DEVOPS,
            permissions=["infrastructure.monitor", "infrastructure.logs"],
            scope={"isGlobal": True}
        )

    def test_electoral_user_has_zero_infrastructure_permissions(self):
        self.assertFalse(self.president.has_perm_code("infrastructure.monitor"))
        self.assertFalse(self.president.has_perm_code("infrastructure.logs"))

    def test_devops_user_has_zero_electoral_permissions(self):
        self.assertTrue(self.devops.has_perm_code("infrastructure.monitor"))
        self.assertFalse(self.devops.has_perm_code("election.view"))
        self.assertFalse(self.devops.has_perm_code("election.open"))
        self.assertFalse(self.devops.has_perm_code("candidate.approve"))
        self.assertFalse(self.devops.has_perm_code("pv.validate"))
        self.assertFalse(self.devops.has_perm_code("result.view"))

    def test_terminal_command_broker_whitelisting(self):
        from apps.kernel_views import KernelTerminalView
        broker = KernelTerminalView()
        self.assertIn("system.status", broker.COMMAND_WHITELIST)
        self.assertIn("database.status", broker.COMMAND_WHITELIST)
        self.assertNotIn("rm -rf /", broker.COMMAND_WHITELIST)
        self.assertNotIn("drop database", broker.COMMAND_WHITELIST)

    def test_terminal_command_injection_rejection(self):
        from rest_framework.test import APIRequestFactory, force_authenticate
        from apps.kernel_views import KernelTerminalView

        factory = APIRequestFactory()
        view = KernelTerminalView.as_view()

        # Command injection attempt with semicolon
        request = factory.post('/api/kernel/terminal', {'command': 'system.status; cat /etc/passwd'}, format='json')
        force_authenticate(request, user=self.devops)
        response = view(request)

        self.assertEqual(response.status_code, 400)
        self.assertIn("SECURITY ALERT", response.data.get("output", ""))

    def test_purge_test_data_double_lock_protocol(self):
        from rest_framework.test import APIRequestFactory, force_authenticate
        from apps.kernel_views import PurgeTestDataView

        factory = APIRequestFactory()
        view = PurgeTestDataView.as_view()

        # 1. Reject invalid password
        req1 = factory.post('/api/kernel/purge', {'password': 'wrong_pass', 'confirm_code': 'PURGE-CONFIRM-2026', 'justification': 'Testing purge safety'}, format='json')
        force_authenticate(req1, user=self.devops)
        resp1 = view(req1)
        self.assertEqual(resp1.status_code, 403)

        # 2. Reject missing confirmation code
        req2 = factory.post('/api/kernel/purge', {'password': 'CepPassword2026!', 'confirm_code': 'WRONG-CODE', 'justification': 'Testing purge safety'}, format='json')
        force_authenticate(req2, user=self.devops)
        resp2 = view(req2)
        self.assertEqual(resp2.status_code, 400)

        # 3. Reject short justification (< 10 chars)
        req3 = factory.post('/api/kernel/purge', {'password': 'CepPassword2026!', 'confirm_code': 'PURGE-CONFIRM-2026', 'justification': 'short'}, format='json')
        force_authenticate(req3, user=self.devops)
        resp3 = view(req3)
        self.assertEqual(resp3.status_code, 400)

        # 4. Valid purge execution
        req4 = factory.post('/api/kernel/purge', {'password': 'CepPassword2026!', 'confirm_code': 'PURGE-CONFIRM-2026', 'justification': 'Valid test purge justification text for audit'}, format='json')
        force_authenticate(req4, user=self.devops)
        resp4 = view(req4)
        self.assertEqual(resp4.status_code, 200)
        self.assertTrue(resp4.data.get("success"))



class VotingCoreTestCase(TestCase):
    def setUp(self):
        self.geo_ver = GeoVersion.objects.create(
            version="TEST-GEO-1", effective_from=timezone.now(), source="TEST", author="TEST"
        )
        self.node = GeographicNode.objects.create(
            code="HT-OU", level="department", name={"fr": "Ouest"}, geo_version=self.geo_ver
        )
        self.center = VotingCenter.objects.create(
            node=self.node, code="VC-TEST", name={"fr": "Center Test"}, geo_version=self.geo_ver
        )
        self.station1 = PollingStation.objects.create(
            center=self.center, code="ST-01", geo_version=self.geo_ver
        )
        self.station2 = PollingStation.objects.create(
            center=self.center, code="ST-02", geo_version=self.geo_ver
        )

        self.election = Election.objects.create(
            name={"fr": "Scrutin Test"},
            election_type="TEST",
            status="OPEN",
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1),
            rules={"allow_online_z": True}
        )

        self.elector = Elector.objects.create(
            electoral_reference="CIN-TEST-9999",
            identity_hash="HASH-TEST-9999"
        )

        self.operator = User.objects.create(
            username="operator.test", role=Role.FIELD_AGENT
        )

    def test_single_active_assignment_transfer(self):
        # Create initial assignment
        assign1 = ElectionAssignment.objects.create(
            elector=self.elector, election=self.election, station=self.station1, is_active=True
        )
        self.assertTrue(assign1.is_active)

        # Transfer to station2
        assign2 = transfer_elector_assignment(
            elector=self.elector,
            election=self.election,
            target_station=self.station2,
            target_type="NOMADIC",
            operator=self.operator,
            reason="Test relocation"
        )

        assign1.refresh_from_db()
        self.assertFalse(assign1.is_active)
        self.assertTrue(assign2.is_active)

        # Verify only ONE active assignment exists for this elector
        active_count = ElectionAssignment.objects.filter(
            elector=self.elector, election=self.election, is_active=True
        ).count()
        self.assertEqual(active_count, 1)

    def test_anti_double_vote_prevention(self):
        # First turnout record
        token1 = record_voter_participation(self.elector, self.election, self.station1)
        self.assertEqual(token1.state, ParticipationToken.State.USED)

        # Second turnout attempt must raise ValidationError
        with self.assertRaises(ValidationError):
            record_voter_participation(self.elector, self.election, self.station1)

    def test_secret_vote_decoupling(self):
        receipt = submit_anonymous_ballot(self.election, [{"candidate_id": "cand-1", "choice": 1}])
        self.assertIn("receipt_reference", receipt)
        self.assertIn("verification_hash", receipt)

        # Verify Ballot has NO FK to Elector or ParticipationToken
        ballot = Ballot.objects.latest("sealed_at")
        self.assertFalse(hasattr(ballot, "elector"))
        self.assertFalse(hasattr(ballot, "participation_token"))

    def test_nomadic_geofencing(self):
        zone = VotingZone.objects.create(
            name="Zone Pétion-Ville",
            department="Ouest",
            commune="Pétion-Ville",
            center_latitude=18.5125,
            center_longitude=-72.2853,
            radius_meters=1000
        )

        # Valid point (500m away)
        res_valid = validate_nomadic_geofence(18.5150, -72.2853, zone)
        self.assertTrue(res_valid["valid"])
        self.assertEqual(res_valid["status"], "VALID")

        # Invalid point (10km away in Delmas)
        res_invalid = validate_nomadic_geofence(18.5450, -72.3000, zone)
        self.assertFalse(res_invalid["valid"])
        self.assertEqual(res_invalid["status"], "INVALID")

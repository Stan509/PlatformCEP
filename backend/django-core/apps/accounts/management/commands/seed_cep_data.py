"""Management command to seed initial CEP election demo & test dataset into Django DB.
"""
import uuid
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, Role
from apps.geography.models import GeoVersion, GeographicNode, VotingCenter, PollingStation
from apps.elections.models import Election
from apps.candidates.models import Party, Candidate, Mandataire, Mandate
from apps.registry.models import Elector
from apps.operations.models import ElectionAssignment, Device, VotingZone


class Command(BaseCommand):
    help = "Seeds initial CEP database with personas, election, nodes, candidates, and assignments."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting CEP Database Seeding..."))

        # 1. Geo Version & Nodes
        geo_ver, _ = GeoVersion.objects.get_or_create(
            version="GEO-2026-V1",
            defaults={
                "effective_from": timezone.now(),
                "source": "IHSI / CEP 2026",
                "author": "Direction Logistique CEP",
                "notes": "Découpage territorial officiel 2026"
            }
        )

        node_ouest, _ = GeographicNode.objects.get_or_create(
            code="HT-OU",
            geo_version=geo_ver,
            defaults={"level": "department", "name": {"ht": "Lwès", "fr": "Ouest"}}
        )

        node_nord, _ = GeographicNode.objects.get_or_create(
            code="HT-ND",
            geo_version=geo_ver,
            defaults={"level": "department", "name": {"ht": "Nò", "fr": "Nord"}}
        )

        center_pap, _ = VotingCenter.objects.get_or_create(
            node=node_ouest,
            code="VC-PAP-01",
            defaults={"name": {"fr": "Lycée Alexandre Pétion"}, "geo_version": geo_ver}
        )

        station_pap_1, _ = PollingStation.objects.get_or_create(
            center=center_pap,
            code="ST-PAP-001",
            defaults={"name": {"fr": "Bureau #1 - Lycée A. Pétion"}, "capacity": 450, "geo_version": geo_ver}
        )

        center_cap, _ = VotingCenter.objects.get_or_create(
            node=node_nord,
            code="VC-CAP-01",
            defaults={"name": {"fr": "École Nationale Toussaint Louverture"}, "geo_version": geo_ver}
        )

        station_cap_1, _ = PollingStation.objects.get_or_create(
            center=center_cap,
            code="ST-CAP-001",
            defaults={"name": {"fr": "Bureau #1 - Cap-Haïtien"}, "capacity": 500, "geo_version": geo_ver}
        )

        # 2. Election 2026
        election, _ = Election.objects.get_or_create(
            id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
            defaults={
                "name": {"fr": "Élections Générales Haïti 2026", "ht": "Eleksyon Jeneral Ayiti 2026"},
                "election_type": "GENERAL_2026",
                "status": "OPEN",
                "start_date": timezone.now(),
                "end_date": timezone.now() + timezone.timedelta(days=30),
                "rules": {"allow_online_z": True, "allow_nomadic": True}
            }
        )

        # 3. Seed Official CEP Institutional Personas
        personas = [
            {
                "username": "jacques.desrosiers",
                "role": Role.ADMIN_CEP,
                "first_name": "Jacques",
                "last_name": "Desrosiers",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "patrick.saint.hilaire",
                "role": Role.ADMIN_CEP,
                "first_name": "Patrick",
                "last_name": "Saint-Hilaire",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "magalie.georges",
                "role": Role.ADMIN_CEP,
                "first_name": "Rose Magalie Thérèse",
                "last_name": "Georges",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "florence.mathieu",
                "role": Role.ADMIN_CEP,
                "first_name": "Marie Florence",
                "last_name": "Mathieu",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "yves.marie.edouard",
                "role": Role.ADMIN_CEP,
                "first_name": "Yves Marie",
                "last_name": "Édouard",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "schnaida.adely",
                "role": Role.ADMIN_CEP,
                "first_name": "Schnaida",
                "last_name": "Adely",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "president.cep",
                "role": Role.ADMIN_CEP,
                "first_name": "Jacques",
                "last_name": "Desrosiers",
                "perms": ["*.*", "system.superadmin"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "directeur.exec",
                "role": Role.ADMIN_CEP,
                "first_name": "Me. Max Delva",
                "last_name": "Guillaume",
                "perms": ["dashboard.view", "myScope.view", "election.view", "election.update", "station.view", "device.view", "user.view", "audit.view"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "ops.cep",
                "role": Role.ADMIN_CEP,
                "first_name": "Ing. Fritz",
                "last_name": "Bernard",
                "perms": ["dashboard.view", "myScope.view", "station.view", "station.create", "station.assign", "station.transfer", "device.view", "device.register", "device.revoke", "incident.view", "incident.resolve"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "legal.cep",
                "role": Role.ADMIN_CEP,
                "first_name": "Me. Rose",
                "last_name": "Lhérisson",
                "perms": ["dashboard.view", "myScope.view", "candidate.view", "candidate.approve", "candidate.reject", "party.view", "mandate.view", "mandate.approve", "pv.view", "pv.review", "incident.view", "incident.resolve"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "it.cep",
                "role": Role.ADMIN_CEP,
                "first_name": "Col. Jacques",
                "last_name": "Roche",
                "perms": ["dashboard.view", "myScope.view", "elector.view", "elector.search", "elector.assign", "device.view", "device.revoke", "audit.view", "audit.export", "user.view"],
                "scope": {"isGlobal": True}
            },
            {
                "username": "bed.ouest",
                "role": Role.BED,
                "first_name": "Directeur BED",
                "last_name": "Ouest",
                "perms": ["dashboard.view", "myScope.view", "station.view", "device.view", "candidate.view", "pv.view", "pv.review", "pv.validate", "incident.view", "incident.create"],
                "scope": {"departments": ["Ouest"], "elections": ["GENERAL_2026"]}
            },
            {
                "username": "bed.nord",
                "role": Role.BED,
                "first_name": "Directeur BED",
                "last_name": "Nord",
                "perms": ["dashboard.view", "myScope.view", "station.view", "device.view", "candidate.view", "pv.view", "pv.review", "pv.validate", "incident.view", "incident.create"],
                "scope": {"departments": ["Nord"], "elections": ["GENERAL_2026"]}
            },
            {
                "username": "sup.terrain",
                "role": Role.SUPERVISOR,
                "first_name": "Superviseur",
                "last_name": "Port-au-Prince",
                "perms": ["dashboard.view", "myScope.view", "station.view", "elector.search", "incident.view", "incident.create"],
                "scope": {"departments": ["Ouest"], "communes": ["Port-au-Prince"]}
            }
        ]


        for p in personas:
            user, created = User.objects.get_or_create(
                username=p["username"],
                defaults={
                    "role": p["role"],
                    "first_name": p["first_name"],
                    "last_name": p["last_name"],
                    "permissions": p["perms"],
                    "scope": p["scope"],
                    "is_staff": True
                }
            )
            if created:
                user.set_password("CEP_Secret_2026!")
                user.save()

        # 4. Candidates & Parties
        party_rdnp, _ = Party.objects.get_or_create(
            acronym="RDNP",
            defaults={"name": {"fr": "Rassemblement des Démocrates Nationaux Progressistes"}}
        )

        party_pitit, _ = Party.objects.get_or_create(
            acronym="PITIT",
            defaults={"name": {"fr": "Pitit Dessalines"}}
        )

        Candidate.objects.get_or_create(
            election=election,
            ballot_index=1,
            defaults={
                "first_name": "Mirlande",
                "last_name": "Manigat",
                "post": "PRESIDENT",
                "party": party_rdnp,
                "status": "APPROVED"
            }
        )

        Candidate.objects.get_or_create(
            election=election,
            ballot_index=2,
            defaults={
                "first_name": "Moïse",
                "last_name": "Jean-Charles",
                "post": "PRESIDENT",
                "party": party_pitit,
                "status": "APPROVED"
            }
        )

        # 5. Devices
        Device.objects.get_or_create(
            device_id="BIOPAD-PAP-01",
            defaults={
                "serial_number": "SN-BIO-9901",
                "device_model": "Biopad V3 Pro",
                "assigned_station": station_pap_1,
                "status": "ACTIVE"
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded CEP database!"))

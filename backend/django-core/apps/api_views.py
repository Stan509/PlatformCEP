"""Central CEP REST API Views & ViewSets — RBAC & ABAC Scope Protected.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.core.exceptions import ValidationError

from apps.accounts.models import User
from apps.accounts.rbac import HasGranularPermissionAndScope, make_permission_class
from apps.accounts.serializers import ProfileSerializer

from apps.elections.models import Election, TerritoryRule
from apps.registry.models import Elector, ParticipationToken, Ballot
from apps.registry.services import record_voter_participation, submit_anonymous_ballot
from apps.geography.models import PollingStation, GeographicNode
from apps.operations.models import ElectionAssignment, Device, PollingSession, ProcessingRecord, VotingZone
from apps.operations.services import transfer_elector_assignment, validate_nomadic_geofence
from apps.candidates.models import Candidate, Party, Mandataire, Mandate
from apps.incidents.models import Incident
from apps.audit.models import AuditEvent
from apps.audit.services import log_audit_event


# ---------------------------------------------------------------------------
# 1. ELECTIONS
# ---------------------------------------------------------------------------
class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all().order_by("-start_date")
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class ElectionSerializer(serializers.ModelSerializer):
            class Meta:
                model = Election
                fields = "__all__"
        return ElectionSerializer

    @action(detail=True, methods=["post"], permission_classes=[make_permission_class("election.open")])
    def open_election(self, request, pk=None):
        election = self.get_object()
        election.status = "OPEN"
        election.save()
        log_audit_event(request.user.username, "election.open", str(election.id), request.user.role)
        return Response({"status": "OPEN", "election_id": str(election.id)})

    @action(detail=True, methods=["post"], permission_classes=[make_permission_class("election.close")])
    def close_election(self, request, pk=None):
        election = self.get_object()
        election.status = "CLOSED"
        election.save()
        log_audit_event(request.user.username, "election.close", str(election.id), request.user.role)
        return Response({"status": "CLOSED", "election_id": str(election.id)})


# ---------------------------------------------------------------------------
# 2. ELECTORS & ASSIGNMENTS
# ---------------------------------------------------------------------------
class ElectorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Elector.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class ElectorSerializer(serializers.ModelSerializer):
            class Meta:
                model = Elector
                fields = ["id", "electoral_reference", "registration_status", "eligibility_status", "created_at"]
        return ElectorSerializer


class AssignmentTransferView(APIView):
    permission_classes = [make_permission_class("elector.assign")]

    def post(self, request):
        elector_id = request.data.get("elector_id")
        election_id = request.data.get("election_id")
        station_id = request.data.get("station_id")
        target_type = request.data.get("target_type", "FIXED")
        reason = request.data.get("reason", "Administrative transfer")

        try:
            elector = Elector.objects.get(id=elector_id)
            election = Election.objects.get(id=election_id)
            station = PollingStation.objects.get(id=station_id)
        except Exception as exc:
            return Response({"error": f"Invalid reference IDs: {str(exc)}"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_assign = transfer_elector_assignment(
                elector=elector,
                election=election,
                target_station=station,
                target_type=target_type,
                operator=request.user,
                reason=reason
            )
            return Response({
                "assignment_id": str(new_assign.id),
                "elector_ref": elector.electoral_reference,
                "station_code": station.code,
                "target_type": target_type,
                "status": "ACTIVE"
            }, status=status.HTTP_200_OK)
        except ValidationError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# 3. CANDIDATES & PARTIES
# ---------------------------------------------------------------------------
class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class CandidateSerializer(serializers.ModelSerializer):
            display_name = serializers.ReadOnlyField()
            class Meta:
                model = Candidate
                fields = "__all__"
        return CandidateSerializer

    @action(detail=True, methods=["post"], permission_classes=[make_permission_class("candidate.approve")])
    def approve(self, request, pk=None):
        candidate = self.get_object()
        candidate.status = "APPROVED"
        candidate.save()
        log_audit_event(request.user.username, "candidate.approve", candidate.display_name, request.user.role)
        return Response({"status": "APPROVED", "candidate_id": str(candidate.id)})


class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class PartySerializer(serializers.ModelSerializer):
            class Meta:
                model = Party
                fields = "__all__"
        return PartySerializer


# ---------------------------------------------------------------------------
# 4. MANDATAIRES & MANDATES
# ---------------------------------------------------------------------------
class MandateViewSet(viewsets.ModelViewSet):
    queryset = Mandate.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class MandateSerializer(serializers.ModelSerializer):
            class Meta:
                model = Mandate
                fields = "__all__"
        return MandateSerializer

    @action(detail=True, methods=["post"], permission_classes=[make_permission_class("mandate.approve")])
    def approve(self, request, pk=None):
        mandate = self.get_object()
        mandate.status = "ACTIVE"
        mandate.badge_code = f"BADGE-{mandate.id.hex[:8].upper()}"
        mandate.save()
        log_audit_event(request.user.username, "mandate.approve", str(mandate.id), request.user.role)
        return Response({"status": "ACTIVE", "badge_code": mandate.badge_code})


# ---------------------------------------------------------------------------
# 5. STATIONS & DEVICES
# ---------------------------------------------------------------------------
class PollingStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PollingStation.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class StationSerializer(serializers.ModelSerializer):
            class Meta:
                model = PollingStation
                fields = "__all__"
        return StationSerializer


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from rest_framework import serializers
        class DeviceSerializer(serializers.ModelSerializer):
            class Meta:
                model = Device
                fields = "__all__"
        return DeviceSerializer

    @action(detail=True, methods=["post"], permission_classes=[make_permission_class("device.revoke")])
    def revoke(self, request, pk=None):
        device = self.get_object()
        device.status = "REVOKED"
        device.save()
        log_audit_event(request.user.username, "device.revoke", device.device_id, request.user.role)
        return Response({"status": "REVOKED", "device_id": device.device_id})


# ---------------------------------------------------------------------------
# 6. PARTICIPATION & VOTING CORE
# ---------------------------------------------------------------------------
class RecordParticipationView(APIView):
    permission_classes = [make_permission_class("participation.view")]

    def post(self, request):
        elector_id = request.data.get("elector_id")
        election_id = request.data.get("election_id")
        station_id = request.data.get("station_id")

        try:
            elector = Elector.objects.get(id=elector_id)
            election = Election.objects.get(id=election_id)
            station = PollingStation.objects.get(id=station_id)

            token = record_voter_participation(elector, election, station)
            return Response({
                "status": "RECORDED",
                "token_id": str(token.id),
                "state": token.state
            }, status=status.HTTP_200_OK)
        except ValidationError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubmitBallotView(APIView):
    permission_classes = [permissions.AllowAny]  # Public vote submission

    def post(self, request):
        election_id = request.data.get("election_id")
        options = request.data.get("options", [])

        try:
            election = Election.objects.get(id=election_id)
            receipt_info = submit_anonymous_ballot(election, options)
            return Response(receipt_info, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# 7. COMMAND CENTER & AUDIT
# ---------------------------------------------------------------------------
class CommandCenterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_elections = Election.objects.filter(status="OPEN").count()
        total_stations = PollingStation.objects.count()
        active_devices = Device.objects.filter(status="ACTIVE").count()
        open_incidents = Incident.objects.filter(status="OPEN").count()
        turnout_total = ParticipationToken.objects.filter(state="USED").count()

        return Response({
            "active_elections": active_elections,
            "total_stations": total_stations,
            "active_devices": active_devices,
            "open_incidents": open_incidents,
            "total_turnout": turnout_total,
            "system_health": "OPTIMAL"
        })


class AuditLogView(APIView):
    permission_classes = [make_permission_class("audit.view")]

    def get(self, request):
        events = AuditEvent.objects.all().order_by("-occurred_at")[:100]
        data = [{
            "id": str(e.id),
            "actor": e.actor_ref,
            "role": e.actor_role,
            "action": e.action,
            "object": e.object_ref,
            "occurred_at": e.occurred_at.isoformat(),
            "event_hash": e.event_hash
        } for e in events]
        return Response(data)

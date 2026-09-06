"""Domain Services — Operations, Assignment Transfers & Nomadic Geofencing.
"""
import math
from typing import Dict, Any
from django.db import transaction
from django.core.exceptions import ValidationError

from apps.operations.models import ElectionAssignment, ElectionAssignmentHistory, VotingZone
from apps.geography.models import PollingStation
from apps.registry.models import Elector
from apps.elections.models import Election
from apps.accounts.models import User
from apps.audit.services import log_audit_event


@transaction.atomic
def transfer_elector_assignment(
    elector: Elector,
    election: Election,
    target_station: PollingStation,
    target_type: str,
    operator: User,
    reason: str
) -> ElectionAssignment:
    """Performs atomic transfer of an elector's active assignment.

    Invariants:
    1. An elector possesses exactly ONE active assignment per election.
    2. Total national eligible count remains constant.
    3. Operation is transactionally logged in assignment history and audit trail.
    """
    if target_type == "ONLINE-Z" and not election.rules.get("allow_online_z", False):
        raise ValidationError("Voting modality ONLINE-Z is disabled for this election by CEP policy.")

    # Select active assignment with lock
    current_assignment = ElectionAssignment.objects.select_for_update().filter(
        elector=elector,
        election=election,
        is_active=True
    ).first()

    source_station = current_assignment.station if current_assignment else target_station
    source_type = current_assignment.station_type if current_assignment else "FIXED"

    if current_assignment:
        current_assignment.is_active = False
        current_assignment.save()

    # Create new active assignment
    new_assignment = ElectionAssignment.objects.create(
        elector=elector,
        election=election,
        station=target_station,
        station_type=target_type,
        is_active=True
    )

    # Log assignment history
    ElectionAssignmentHistory.objects.create(
        election=election,
        elector=elector,
        source_station=source_station,
        target_station=target_station,
        source_type=source_type,
        target_type=target_type,
        reason=reason,
        operator=operator,
        audit_hash=f"TRANSFER-{new_assignment.id}"
    )

    # Log Audit Event
    log_audit_event(
        actor_ref=operator.username,
        actor_role=operator.role,
        action="elector.assign.transfer",
        object_ref=str(elector.electoral_reference),
        previous_value={"station": str(source_station.code), "type": source_type},
        new_value={"station": str(target_station.code), "type": target_type},
        reason=reason
    )

    return new_assignment


def validate_nomadic_geofence(
    latitude: float,
    longitude: float,
    voting_zone: VotingZone
) -> Dict[str, Any]:
    """Validates whether GPS coordinates fall within nomadic zone boundaries using Haversine calculation."""
    if not voting_zone.center_latitude or not voting_zone.center_longitude:
        return {"status": "UNKNOWN", "valid": False, "distance_meters": None}

    # Haversine formula
    R = 6371000  # meters
    phi1 = math.radians(latitude)
    phi2 = math.radians(voting_zone.center_latitude)
    delta_phi = math.radians(voting_zone.center_latitude - latitude)
    delta_lambda = math.radians(voting_zone.center_longitude - longitude)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    is_valid = distance <= voting_zone.radius_meters
    status = "VALID" if is_valid else "INVALID"

    return {
        "status": status,
        "valid": is_valid,
        "distance_meters": round(distance, 2),
        "allowed_radius_meters": voting_zone.radius_meters
    }

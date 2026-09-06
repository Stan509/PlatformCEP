"""Domain Services — Registry, Anti-Double Vote & Anonymous Ballot Sealing.
"""
import uuid
import hashlib
from typing import Dict, Any, List
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.registry.models import Elector, ParticipationToken, Ballot, RecordedVote
from apps.elections.models import Election
from apps.geography.models import PollingStation
from apps.audit.services import log_audit_event


@transaction.atomic
def record_voter_participation(
    elector: Elector,
    election: Election,
    station: PollingStation
) -> ParticipationToken:
    """Enforces single voter participation per election (anti-double vote).

    Invariants:
    1. Maximum ONE participation token per elector per election.
    2. Atomic DB check-and-set with pessimistic locking (`select_for_update`).
    3. Contains NO choice of ballot (Identity/Turnout decoupled from Vote).
    """
    # Check existing token under atomic lock
    existing_token = ParticipationToken.objects.select_for_update().filter(
        election=election,
        elector=elector
    ).first()

    if existing_token:
        raise ValidationError(f"Double voting prevented! Participation already recorded for elector {elector.electoral_reference}.")

    token_secret = hashlib.sha256(f"{elector.id}:{election.id}:{timezone.now().isoformat()}".encode("utf-8")).hexdigest()

    token = ParticipationToken.objects.create(
        token=token_secret,
        election=election,
        elector=elector,
        issuing_station=station,
        state=ParticipationToken.State.USED,
        used_at=timezone.now(),
        anti_replay_hash=hashlib.sha256(token_secret.encode("utf-8")).hexdigest()
    )

    log_audit_event(
        actor_ref="SYSTEM_POLLING_STATION",
        action="participation.record",
        object_ref=str(elector.electoral_reference),
        context=f"Station {station.code}"
    )

    return token


@transaction.atomic
def submit_anonymous_ballot(
    election: Election,
    options: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Seals an anonymous ballot into the ballot box.

    Invariants:
    1. Zero Foreign Keys to `Elector` or `ParticipationToken`.
    2. Voter identity cannot be derived or reconstructed from Ballot table.
    3. Returns a verification receipt hash for voter inclusion check.
    """
    ballot = Ballot.objects.create(
        election=election,
        options=options
    )

    receipt_ref = f"REC-{uuid.uuid4().hex[:12].upper()}"
    verification_hash = hashlib.sha256(f"{ballot.id}:{receipt_ref}".encode("utf-8")).hexdigest()

    receipt = RecordedVote.objects.create(
        receipt_reference=receipt_ref,
        election=election,
        ballot=ballot,
        verification_hash=verification_hash
    )

    log_audit_event(
        actor_ref="ANONYMOUS_BALLOT_BOX",
        action="ballot.seal",
        object_ref=receipt_ref
    )

    return {
        "receipt_reference": receipt_ref,
        "verification_hash": verification_hash,
        "sealed_at": ballot.sealed_at.isoformat()
    }

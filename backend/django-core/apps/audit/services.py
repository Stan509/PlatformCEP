"""Audit Trail Service — tamper-evident hash chaining for append-only events.
"""
import hashlib
import json
import uuid
from typing import Any
from django.utils import timezone
from apps.audit.models import AuditEvent


def calculate_event_hash(
    actor_ref: str,
    action: str,
    object_ref: str,
    occurred_at_str: str,
    previous_hash: str | None
) -> str:
    """Calculates SHA-256 hash chaining previous_hash + current event data."""
    raw_payload = f"{actor_ref}:{action}:{object_ref}:{occurred_at_str}:{previous_hash or ''}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()


def log_audit_event(
    actor_ref: str,
    action: str,
    object_ref: str = "",
    actor_role: str = "",
    device_id: str = "",
    context: str = "",
    previous_value: Any = None,
    new_value: Any = None,
    reason: str = ""
) -> AuditEvent:
    """Logs an immutable AuditEvent into the tamper-evident chain."""
    last_event = AuditEvent.objects.order_by("-occurred_at").first()
    previous_hash = last_event.event_hash if last_event else "GENESIS_HASH_CEP_2026"

    now_str = timezone.now().isoformat()
    event_hash = calculate_event_hash(actor_ref, action, object_ref, now_str, previous_hash)

    event = AuditEvent.objects.create(
        actor_ref=actor_ref,
        actor_role=actor_role,
        device_id=device_id,
        action=action,
        context=context,
        object_ref=object_ref,
        previous_value=previous_value,
        new_value=new_value,
        reason=reason,
        previous_hash=previous_hash,
        event_hash=event_hash,
        transaction_id=str(uuid.uuid4())[:8]
    )
    return event

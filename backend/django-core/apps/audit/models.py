"""Domaine : audit immuable (tamper-evident, chaîné par hash).

Principe (Document Maître §37) :
  Event N     → hash(Event N)
  Event N+1   → hash(Event N+1 + previous_hash)

Stockage séparé des journaux d'audit. Les administrateurs de l'application ne
doivent pas pouvoir effacer silencieusement les traces.

Immuabilité garantie côté ORM : un `AuditEvent` ne peut être ni modifié ni
supprimé (uniquement créé). Les hashs/signatures sont produits par le core Rust
(`@cep/crypto-core`) — Phase 3.
"""
import uuid

from django.core.exceptions import ValidationError
from django.db import models


class AuditEvent(models.Model):
    """Événement d'audit — immuable, chaîné par hash."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor_ref = models.CharField(max_length=128)  # identifiant, jamais identité civile
    actor_role = models.CharField(max_length=32, blank=True)
    device_id = models.CharField(max_length=128, blank=True)
    action = models.CharField(max_length=128, db_index=True)
    context = models.CharField(max_length=128, blank=True)
    object_ref = models.CharField(max_length=128, blank=True)
    previous_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    reason = models.TextField(blank=True)
    transaction_id = models.CharField(max_length=64, blank=True)
    # Chaîne tamper-evident :
    event_hash = models.CharField(max_length=64, db_index=True)
    previous_hash = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    signature = models.CharField(max_length=256, blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["occurred_at"]
        indexes = [models.Index(fields=["actor_ref", "occurred_at"])]

    def save(self, *args, **kwargs) -> None:
        if not self._state.adding:
            raise ValidationError("AuditEvent is immutable and cannot be modified.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs) -> None:
        raise ValidationError("AuditEvent is immutable and cannot be deleted.")

    def __str__(self) -> str:
        return f"{self.action} #{self.id}"

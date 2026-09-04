"""Domaine : opérations électorales (centres, bureaux, agents, PV, tabulation).

Gère l'ouverture/fermeture des bureaux, la session de vote et la réception de
procès-verbaux. Ne contient JAMAIS le contenu individuel du bulletin.
"""
import uuid

from django.db import models


class PollingSession(models.Model):
    """Session d'un bureau de vote pour un scrutin (ouverture → clôture)."""

    class Status(models.TextChoices):
        PREPARED = "PREPARED", "Préparée"
        OPEN = "OPEN", "Ouverte"
        CLOSED = "CLOSED", "Fermée"
        TABULATED = "TABULATED", "Dépouillée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    election = models.ForeignKey("elections.Election", on_delete=models.PROTECT, related_name="polling_sessions")
    station = models.ForeignKey("geography.PollingStation", on_delete=models.PROTECT, related_name="sessions")
    agent = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="sessions")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PREPARED)
    opened_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    ballots_cast = models.PositiveIntegerField(default=0)  # comptage opérationnel, pas de contenu
    pv_received = models.BooleanField(default=False)  # procès-verbal transmis

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["election", "station"], name="uniq_session_per_station",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.station} @ {self.election} ({self.status})"


class ProcessingRecord(models.Model):
    """Procès-verbal (PV) reçu — validation & détection d'anomalies."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(PollingSession, on_delete=models.PROTECT, related_name="processing_records")
    received_at = models.DateTimeField(auto_now_add=True)
    payload_hash = models.CharField(max_length=64)
    signature = models.CharField(max_length=256, blank=True)
    validated = models.BooleanField(default=False)
    anomaly_flags = models.JSONField(default=list)  # doublon, incohérence, signature

    def __str__(self) -> str:
        return f"PV {self.id} (validated={self.validated})"

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


class VotingZone(models.Model):
    """Géozone autorisée pour les bureaux nomades (GPS / polygones)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)
    department = models.CharField(max_length=64)
    commune = models.CharField(max_length=64)
    center_latitude = models.FloatField(null=True, blank=True)
    center_longitude = models.FloatField(null=True, blank=True)
    radius_meters = models.PositiveIntegerField(default=5000)
    polygon_geojson = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Zone {self.name} ({self.commune})"


class ElectionAssignment(models.Model):
    """Affectation active unique d'un électeur à un bureau pour un scrutin."""

    class StationType(models.TextChoices):
        FIXED = "FIXED", "Fixe"
        NOMADIC = "NOMADIC", "Nomade"
        VIRTUAL = "VIRTUAL", "Virtuel (Online-Z)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    election = models.ForeignKey("elections.Election", on_delete=models.CASCADE, related_name="assignments")
    elector = models.ForeignKey("registry.Elector", on_delete=models.CASCADE, related_name="assignments")
    station = models.ForeignKey("geography.PollingStation", on_delete=models.PROTECT, related_name="elector_assignments")
    station_type = models.CharField(max_length=16, choices=StationType.choices, default=StationType.FIXED)
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["election", "elector"], condition=models.Q(is_active=True), name="uniq_active_elector_assignment_per_election"),
        ]

    def __str__(self) -> str:
        return f"{self.elector} → {self.station} ({self.station_type})"


class ElectionAssignmentHistory(models.Model):
    """Historique immuable des transferts d'affectation d'électeur (Audit Trail)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    election = models.ForeignKey("elections.Election", on_delete=models.CASCADE, related_name="assignment_history")
    elector = models.ForeignKey("registry.Elector", on_delete=models.CASCADE, related_name="assignment_history")
    source_station = models.ForeignKey("geography.PollingStation", on_delete=models.PROTECT, related_name="transfers_from")
    target_station = models.ForeignKey("geography.PollingStation", on_delete=models.PROTECT, related_name="transfers_to")
    source_type = models.CharField(max_length=16)
    target_type = models.CharField(max_length=16)
    reason = models.CharField(max_length=256)
    operator = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="executed_transfers")
    transferred_at = models.DateTimeField(auto_now_add=True)
    audit_hash = models.CharField(max_length=64)

    class Meta:
        ordering = ["-transferred_at"]


class Device(models.Model):
    """Registre des terminaux biométriques (Biopads, Tablettes bureau, PWA)."""

    class Status(models.TextChoices):
        REGISTERED = "REGISTERED", "Enregistré"
        ACTIVE = "ACTIVE", "Actif"
        SUSPENDED = "SUSPENDED", "Suspendu"
        REVOKED = "REVOKED", "Révoqué"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_id = models.CharField(max_length=64, unique=True)
    device_model = models.CharField(max_length=64)
    serial_number = models.CharField(max_length=64, unique=True)
    assigned_station = models.ForeignKey("geography.PollingStation", on_delete=models.SET_NULL, null=True, blank=True, related_name="devices")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.REGISTERED)
    last_seen_at = models.DateTimeField(auto_now=True)
    battery_level = models.PositiveIntegerField(default=100)
    app_version = models.CharField(max_length=32, default="1.0.0")

    def __str__(self) -> str:
        return f"{self.device_id} ({self.status})"


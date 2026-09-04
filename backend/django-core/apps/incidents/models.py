"""Domaine : gestion des incidents (workflow, escalade, résolution).

Catégories : appareil, réseau, alimentation, identité, éligibilité, sécurité,
matériel, logiciel, bureau inaccessible, opérationnel, anomalie de sync,
incident électoral.
Workflow : Créé → Classifié → Assigné → Investigué → Résolu → Vérifié → Archivé.
"""
import uuid

from django.db import models


class IncidentCategory(models.TextChoices):
    DEVICE = "device", "Appareil"
    NETWORK = "network", "Réseau"
    POWER = "power", "Alimentation"
    IDENTITY = "identity", "Identité"
    ELIGIBILITY = "eligibility", "Éligibilité"
    SECURITY = "security", "Sécurité"
    HARDWARE = "hardware", "Matériel"
    SOFTWARE = "software", "Logiciel"
    STATION_INACCESSIBLE = "station_inaccessible", "Bureau inaccessible"
    OPERATIONAL = "operational", "Opérationnel"
    SYNC_ANOMALY = "sync_anomaly", "Anomalie de synchronisation"
    ELECTORAL = "electoral", "Incident électoral"


class IncidentSeverity(models.TextChoices):
    LOW = "LOW", "Faible"
    MEDIUM = "MEDIUM", "Moyenne"
    HIGH = "HIGH", "Élevée"
    CRITICAL = "CRITICAL", "Critique"


class IncidentStatus(models.TextChoices):
    OPEN = "OPEN", "Créé"
    CLASSIFIED = "CLASSIFIED", "Classifié"
    ASSIGNED = "ASSIGNED", "Assigné"
    INVESTIGATING = "INVESTIGATING", "Investigué"
    RESOLVED = "RESOLVED", "Résolu"
    VERIFIED = "VERIFIED", "Vérifié"
    ARCHIVED = "ARCHIVED", "Archivé"


class Incident(models.Model):
    """Incident électoral — workflow + traçabilité."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=32, choices=IncidentCategory.choices)
    severity = models.CharField(max_length=16, choices=IncidentSeverity.choices, default=IncidentSeverity.MEDIUM)
    status = models.CharField(max_length=16, choices=IncidentStatus.choices, default=IncidentStatus.OPEN)
    device_id = models.CharField(max_length=128, blank=True)
    reported_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="reported_incidents",
    )
    assigned_to = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_incidents",
    )
    description = models.TextField()
    event_log = models.JSONField(default=list)  # journal d'événements de l'incident
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-reported_at"]

    def __str__(self) -> str:
        return f"{self.category} #{self.id} ({self.status})"

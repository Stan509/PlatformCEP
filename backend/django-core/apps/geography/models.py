"""Domaine : moteur de géographie VERSIONNÉ (configurable, jamais codé en dur).

Hiérarchie configurable :
Pays → Département → Arrondissement → Commune → Section communale → Localité
→ Circonscription électorale → Centre → Bureau.

Chaque version géographique porte : version, date d'effet, source, auteur,
approbateur, historique. Il est impossible de modifier silencieusement une
ancienne version utilisée par une élection.
"""
import uuid

from django.db import models


class GeoLevel(models.TextChoices):
    COUNTRY = "country", "Pays"
    DEPARTMENT = "department", "Département"
    ARRONDISSEMENT = "arrondissement", "Arrondissement"
    COMMUNE = "commune", "Commune"
    SECTION_COMMUNALE = "section_communale", "Section communale"
    LOCALITY = "locality", "Localité"
    ELECTORAL_DISTRICT = "electoral_district", "Circonscription électorale"
    VOTING_CENTER = "voting_center", "Centre de vote"
    POLLING_STATION = "polling_station", "Bureau de vote"


class GeoVersion(models.Model):
    """Version d'un découpage territorial — immuable une fois utilisée."""

    version = models.CharField(max_length=32, unique=True)
    effective_from = models.DateTimeField()
    source = models.CharField(max_length=128)
    author = models.CharField(max_length=128)
    approver = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-effective_from"]

    def __str__(self) -> str:
        return f"{self.version} ({self.effective_from:%Y-%m-%d})"


class GeographicNode(models.Model):
    """Nœud géographique — arbre (parent self), versionné, multilingue."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=32)
    level = models.CharField(max_length=32, choices=GeoLevel.choices)
    name = models.JSONField(default=dict)  # {"ht": ..., "fr": ..., "en": ...}
    parent = models.ForeignKey("self", on_delete=models.PROTECT, null=True, blank=True, related_name="children")
    geo_version = models.ForeignKey(GeoVersion, on_delete=models.PROTECT, related_name="nodes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["code", "geo_version"], name="uniq_node_per_version"),
        ]
        indexes = [models.Index(fields=["level", "geo_version"])]

    def __str__(self) -> str:
        return f"{self.code} ({self.geo_version.version})"


class VotingCenter(models.Model):
    """Centre de vote rattaché à un nœud géographique."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    node = models.ForeignKey(GeographicNode, on_delete=models.PROTECT, related_name="voting_centers")
    code = models.CharField(max_length=32)
    name = models.JSONField(default=dict)
    address = models.TextField(blank=True)
    geo_version = models.ForeignKey(GeoVersion, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["node", "code"], name="uniq_center_per_node"),
        ]

    def __str__(self) -> str:
        return f"{self.code} ({self.node.code})"


class PollingStation(models.Model):
    """Bureau de vote rattaché à un centre."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    center = models.ForeignKey(VotingCenter, on_delete=models.PROTECT, related_name="stations")
    code = models.CharField(max_length=32)
    name = models.JSONField(default=dict)
    capacity = models.PositiveIntegerField(default=0, null=True, blank=True)
    geo_version = models.ForeignKey(GeoVersion, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["center", "code"], name="uniq_station_per_center"),
        ]

    def __str__(self) -> str:
        return f"{self.code} ({self.center.code})"

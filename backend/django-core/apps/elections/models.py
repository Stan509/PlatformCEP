"""Domaine : gestion des élections — moteur 100% configurable.

Aucune règle électorale (ex. `Sénat = département`) n'est codée en dur.
Chaque scrutin est une entité configurable : territoire, éligibilité, vote,
décompte, publication. Les transitions critiques exigent des permissions
élevées et, si configuré, une double approbation.
"""
import uuid

from django.db import models
from django.utils import timezone


class ElectionStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    CONFIGURATION = "CONFIGURATION", "Configuration"
    REGISTRATION = "REGISTRATION", "Enregistrement"
    CANDIDATE_VALIDATION = "CANDIDATE_VALIDATION", "Validation des candidatures"
    READY = "READY", "Prêt"
    OPEN = "OPEN", "Ouverte"
    SUSPENDED = "SUSPENDED", "Suspendue"
    CLOSED = "CLOSED", "Fermée"
    TABULATION = "TABULATION", "Tabulation"
    PROVISIONAL_RESULTS = "PROVISIONAL_RESULTS", "Résultats provisoires"
    FINAL_VALIDATION = "FINAL_VALIDATION", "Validation finale"
    FINAL_RESULTS = "FINAL_RESULTS", "Résultats définitifs"
    ARCHIVED = "ARCHIVED", "Archivée"


class Election(models.Model):
    """Un scrutin — moteur entièrement configurable par le CEP."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.JSONField(default=dict)  # {"ht": ..., "fr": ..., "en": ...}
    election_type = models.CharField(max_length=32)
    status = models.CharField(max_length=32, choices=ElectionStatus.choices, default=ElectionStatus.DRAFT)
    legal_configuration = models.CharField(max_length=128, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    # Règles du scrutin — jamais codées en dur (territoire/éligibilité/vote/décompte/publication).
    rules = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gt=models.F("start_date")),
                name="election_end_after_start",
            ),
        ]
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return f"{self.election_type} {self.pk} ({self.status})"

    def is_open(self) -> bool:
        return self.status in (ElectionStatus.OPEN, ElectionStatus.SUSPENDED) and \
            self.start_date <= timezone.now() <= self.end_date


class TerritoryRule(models.Model):
    """Règle territoire ↔ poste — configurable, jamais codée en dur.

    Exemple : `post="senator", scope="department", assign="department"`.
    """

    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name="territory_rules")
    post = models.CharField(max_length=32)
    scope = models.CharField(max_length=32)
    assign = models.CharField(max_length=32)
    ordering = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["election", "post"], name="uniq_territory_rule_per_post"),
        ]
        ordering = ["ordering"]

    def __str__(self) -> str:
        return f"{self.post} → {self.scope} (assign {self.assign})"

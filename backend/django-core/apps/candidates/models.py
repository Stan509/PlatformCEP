"""Domaine : candidats & partis — neutralité absolue.

Chaque candidat est présenté de manière VISUELLEMENT IDENTIQUE au public.
Aucune couleur ou mise en avant ne favorise un candidat ou un parti.
`ballot_index` = ordre officiel du bulletin (configuré, jamais par popularité).
Workflow : DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PUBLISHED / REJECTED / WITHDRAWN.
"""
import uuid

from django.db import models


class PartyStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Actif"
    SUSPENDED = "SUSPENDED", "Suspendu"
    REVOKED = "REVOKED", "Révoqué"


class Party(models.Model):
    """Parti politique."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    acronym = models.CharField(max_length=16, unique=True)
    name = models.JSONField(default=dict)  # {"ht","fr","en"}
    legal_reference = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=16, choices=PartyStatus.choices, default=PartyStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.acronym


class CandidateStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    SUBMITTED = "SUBMITTED", "Soumise"
    UNDER_REVIEW = "UNDER_REVIEW", "En revue"
    APPROVED = "APPROVED", "Approuvée"
    REJECTED = "REJECTED", "Rejetée"
    PUBLISHED = "PUBLISHED", "Publiée"
    WITHDRAWN = "WITHDRAWN", "Retirée"


class Candidate(models.Model):
    """Candidat — relié à un scrutin, un poste et un territoire configuré."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    election = models.ForeignKey("elections.Election", on_delete=models.CASCADE, related_name="candidates")
    party = models.ForeignKey(Party, on_delete=models.PROTECT, related_name="candidates", null=True, blank=True)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    post = models.CharField(max_length=64)
    territory_node = models.ForeignKey(
        "geography.GeographicNode", on_delete=models.PROTECT, null=True, blank=True,
    )
    # Ordre officiel du bulletin — jamais par popularité, jamais par classement arbitraire.
    ballot_index = models.PositiveIntegerField()
    status = models.CharField(max_length=16, choices=CandidateStatus.choices, default=CandidateStatus.DRAFT)
    photo_key = models.CharField(max_length=128, blank=True)  # clé d'objet, pas de binaire
    documents = models.JSONField(default=list)  # clés de documents autorisés
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["election", "post", "territory_node", "ballot_index"],
                name="uniq_candidate_ballot_slot",
            ),
        ]
        ordering = ["ballot_index"]

    @property
    def display_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __str__(self) -> str:
        return self.display_name

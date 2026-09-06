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


class RepresentedType(models.TextChoices):
    PARTY = "PARTY", "Parti politique"
    CANDIDATE = "CANDIDATE", "Candidat indépendant"


class MandateMode(models.TextChoices):
    PHYSICAL = "PHYSICAL", "Bureau physique"
    ONLINE = "ONLINE", "Surveillance en ligne"
    BOTH = "BOTH", "Hybride (Physique + En ligne)"


class MandateStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    PROPOSED = "PROPOSED", "Proposé"
    PENDING_CEP_REVIEW = "PENDING_CEP_REVIEW", "En examen CEP"
    APPROVED = "APPROVED", "Approuvé"
    ACTIVE = "ACTIVE", "Actif"
    SUSPENDED = "SUSPENDED", "Suspendu"
    REVOKED = "REVOKED", "Révoqué"
    EXPIRED = "EXPIRED", "Expiré"
    REJECTED = "REJECTED", "Rejeté"


class Mandataire(models.Model):
    """Personne accréditée comme mandataire d'un parti ou candidat."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    cin = models.CharField(max_length=32, unique=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    photo_url = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.cin})"


class Mandate(models.Model):
    """Mandat d'accréditation avec workflow d'approbation et périmètre territorial."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mandataire = models.ForeignKey(Mandataire, on_delete=models.CASCADE, related_name="mandates")
    election = models.ForeignKey("elections.Election", on_delete=models.CASCADE, related_name="mandates")
    represented_type = models.CharField(max_length=16, choices=RepresentedType.choices, default=RepresentedType.PARTY)
    party = models.ForeignKey(Party, on_delete=models.SET_NULL, null=True, blank=True, related_name="mandates")
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL, null=True, blank=True, related_name="mandates")
    mode = models.CharField(max_length=16, choices=MandateMode.choices, default=MandateMode.PHYSICAL)
    status = models.CharField(max_length=32, choices=MandateStatus.choices, default=MandateStatus.DRAFT)
    
    department = models.CharField(max_length=64, blank=True)
    commune = models.CharField(max_length=64, blank=True)
    assigned_stations = models.JSONField(default=list, blank=True)  # codes des bureaux autorisés
    
    badge_code = models.CharField(max_length=64, blank=True, unique=True, null=True)
    issued_at = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Mandat {self.mandataire} @ {self.election} ({self.status})"


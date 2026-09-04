"""Domaine : registre électoral + séparation stricte identité / vote.

SÉPARATION NON NÉGOCIABLE (Document Maître §2.1) :
- identity      → `Elector` (référence minimale + hash d'identité, jamais
                   l'identité civile complète en clair)
- eligibility   → `EligibilityCheck`
- participation → `ParticipationToken` (droit de voter, jamais le choix)
- ballot        → `Ballot` (ANONYME — aucun lien vers identité ou token)

Vote anonyme : `Ballot` ne porte AUCUNE clé étrangère vers `Elector` ni
`ParticipationToken`. La participation (token) et le contenu du vote (ballot)
sont stockés séparément et sans lien, de sorte qu'aucun administrateur ne peut
corréler une identité à un choix.
"""
import uuid

from django.db import models


class RegistrationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    PENDING_VERIFICATION = "PENDING_VERIFICATION", "En attente de vérification"
    REGISTERED = "REGISTERED", "Enregistré"
    ACTIVE = "ACTIVE", "Actif"
    SUSPENDED = "SUSPENDED", "Suspendu"
    INACTIVE = "INACTIVE", "Inactif"
    REJECTED = "REJECTED", "Rejeté"


class EligibilityStatus(models.TextChoices):
    ELIGIBLE = "ELIGIBLE", "Éligible"
    NOT_ELIGIBLE = "NOT_ELIGIBLE", "Non éligible"
    PENDING = "PENDING", "En attente"
    REVOKED = "REVOKED", "Révoqué"


class Elector(models.Model):
    """Électeur — référence minimale + hash d'identité (dédoublonnage).

    Ne stocke JAMAIS l'identité civile complète : uniquement une référence
    publique et un hash d'identité pour la détection de doublons.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    electoral_reference = models.CharField(max_length=40, unique=True)
    # SHA-256 de la référence d'identité dédoublonnée — pas de données en clair.
    identity_hash = models.CharField(max_length=64, db_index=True)
    registration_status = models.CharField(
        max_length=32, choices=RegistrationStatus.choices, default=RegistrationStatus.DRAFT
    )
    eligibility_status = models.CharField(
        max_length=32, choices=EligibilityStatus.choices, default=EligibilityStatus.PENDING
    )
    territorial_node = models.ForeignKey(
        "geography.GeographicNode", on_delete=models.PROTECT, null=True, blank=True,
        related_name="electors",
    )
    registration_center = models.ForeignKey(
        "geography.VotingCenter", on_delete=models.PROTECT, null=True, blank=True,
    )
    polling_station = models.ForeignKey(
        "geography.PollingStation", on_delete=models.PROTECT, null=True, blank=True,
    )
    status_history = models.JSONField(default=list)  # DRAFT → REGISTERED → ...
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["electoral_reference"]

    def __str__(self) -> str:
        return self.electoral_reference


class EligibilityCheck(models.Model):
    """Résultat de vérification d'éligibilité pour un scrutin."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    elector = models.ForeignKey(Elector, on_delete=models.CASCADE, related_name="eligibility_checks")
    election = models.ForeignKey("elections.Election", on_delete=models.CASCADE, related_name="eligibility_checks")
    status = models.CharField(max_length=16, choices=EligibilityStatus.choices)
    reason = models.CharField(max_length=128, blank=True)
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["elector", "election"], name="uniq_eligibility_per_election"),
        ]

    def __str__(self) -> str:
        return f"{self.elector} @ {self.election} = {self.status}"


class ParticipationToken(models.Model):
    """Autorisation de voter — un seul enregistrement par électeur et scrutin.

    Ne contient JAMAIS le choix du bulletin. `state=USED` signifie
    participation enregistrée (anti-double-vote).
    """

    class State(models.TextChoices):
        ISSUED = "ISSUED", "Émise"
        USED = "USED", "Utilisée"
        CANCELLED = "CANCELLED", "Annulée"
        REVOKED = "REVOKED", "Révoquée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=64, unique=True)  # jeton éphémère, cryptographique
    election = models.ForeignKey("elections.Election", on_delete=models.PROTECT, related_name="participation_tokens")
    elector = models.ForeignKey(Elector, on_delete=models.PROTECT, related_name="participation_tokens")
    issuing_station = models.ForeignKey("geography.PollingStation", on_delete=models.PROTECT)
    state = models.CharField(max_length=16, choices=State.choices, default=State.ISSUED)
    anti_replay_hash = models.CharField(max_length=64, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["election", "elector"], name="uniq_participation_per_election"),
        ]

    def __str__(self) -> str:
        return f"{self.token} ({self.state})"


class Ballot(models.Model):
    """Bulletin anonyme — AUCUNE clé étrangère vers Elector / ParticipationToken.

    Garantie de séparation : le contenu du vote n'est jamais relié à une
    identité ni à une autorisation. Les options sont le reflet du scrutin.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    election = models.ForeignKey("elections.Election", on_delete=models.PROTECT, related_name="ballots")
    # [{ "index": int, "kind": "candidate"|"blank"|"null", "ref": str }]
    options = models.JSONField(default=list)
    sealed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sealed_at"]


class RecordedVote(models.Model):
    """Reçu de vérification — ne révèle PAS le choix.

    Le reçu référence un bulletin ANONYME et sert uniquement à vérifier
    l'inclusion et l'absence de modification, jamais à retrouver le choix.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    receipt_reference = models.CharField(max_length=64, unique=True)
    election = models.ForeignKey("elections.Election", on_delete=models.PROTECT, related_name="recorded_votes")
    ballot = models.ForeignKey(Ballot, on_delete=models.PROTECT, related_name="receipts")
    verification_hash = models.CharField(max_length=64, blank=True)
    sealed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.receipt_reference

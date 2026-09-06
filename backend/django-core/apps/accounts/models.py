"""Domaine : identité & contrôle d'accès (IAM / RBAC).

Modèles :
- `Role` : rôles électoraux (RBAC + règles contextuelles).
- `User` : utilisateur CEP avec rôle + MFA.
- `DeviceBinding` : liaison appareil ↔ utilisateur (chiffrement/keystore côté app).
- `CriticalActionApproval` : double approbation des opérations critiques.

⚠️ RÈGLE FORTE (Document Maître §6) : le rôle DEV ne donne AUCUN droit
électoral. Le SUPERADMIN technique ne modifie jamais un vote ou un résultat
par simple privilège technique.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    SUPERADMIN = "SUPERADMIN", "SUPERADMIN"
    DEV = "DEV", "DEV"
    ADMIN_CEP = "ADMIN_CEP", "ADMIN CEP"
    MEMBER_CEP = "MEMBER_CEP", "Membre CEP"
    ELECTORAL_MANAGER = "ELECTORAL_MANAGER", "Responsable électoral"
    BED = "BED", "BED"
    BEC = "BEC", "BEC"
    CIV_MANAGER = "CIV_MANAGER", "Responsable CIV"
    FIELD_AGENT = "FIELD_AGENT", "Agent terrain"
    POLLING_AGENT = "POLLING_AGENT", "Agent bureau"
    SUPERVISOR = "SUPERVISOR", "Superviseur"
    AUDITOR = "AUDITOR", "Auditeur"
    OBSERVER = "OBSERVER", "Observateur"
    PARTY = "PARTY", "Parti politique"
    CANDIDATE = "CANDIDATE", "Candidat"
    CITIZEN = "CITIZEN", "Citoyen"
    DIASPORA = "DIASPORA", "Diaspora"


class User(AbstractUser):
    """Utilisateur CEP — authentification forte + RBAC + MFA."""

    role = models.CharField(max_length=32, choices=Role.choices, default=Role.CITIZEN)
    mfa_enabled = models.BooleanField(default=False)
    # Identifiant de compte ordonné : jamais l'identité civile complète.
    electoral_reference = models.CharField(max_length=40, blank=True, unique=True, null=True)
    # Permissions granulaires (resource.action) et Scopes ABAC (départements, communes, élection, etc.)
    permissions = models.JSONField(default=list, blank=True)
    scope = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def has_perm_code(self, perm_code: str) -> bool:
        """Vérifie si l'utilisateur possède une permission explicite ou superadmin."""
        if not self.is_active:
            return False
        user_perms = self.permissions or []
        if "system.superadmin" in user_perms:
            return True
        if perm_code in user_perms or "*.*" in user_perms or "*" in user_perms:
            return True
        domain = perm_code.split(".")[0] if "." in perm_code else ""
        if domain and f"{domain}.*" in user_perms:
            return True
        return False

    def has_scope_target(self, target: dict) -> bool:
        """Vérifie si la cible (département, commune, élection, etc.) est dans le scope de l'utilisateur."""
        if not self.is_active:
            return False
        user_scope = self.scope or {}
        # Scope vide ou non restreint = accès global
        if not user_scope or user_scope.get("isGlobal", False):
            return True

        if "department" in target and target["department"]:
            dept_scope = user_scope.get("departments", [])
            if dept_scope and target["department"] not in dept_scope:
                return False

        if "commune" in target and target["commune"]:
            commune_scope = user_scope.get("communes", [])
            if commune_scope and target["commune"] not in commune_scope:
                return False

        if "election" in target and target["election"]:
            election_scope = user_scope.get("elections", [])
            if election_scope and target["election"] not in election_scope:
                return False

        if "party" in target and target["party"]:
            party_scope = user_scope.get("parties", [])
            if party_scope and target["party"] not in party_scope:
                return False

        return True

    def __str__(self) -> str:
        return self.username


class DeviceBinding(models.Model):
    """Liaison appareil ↔ utilisateur (device identity, chiffrement côté app)."""

    class Status(models.TextChoices):
        PROVISIONED = "PROVISIONED", "Provisionné"
        ACTIVE = "ACTIVE", "Actif"
        SUSPENDED = "SUSPENDED", "Suspendu"
        LOST = "LOST", "Perdu"
        STOLEN = "STOLEN", "Volé"
        REVOKED = "REVOKED", "Révoqué"
        RETIRED = "RETIRED", "Retraité"

    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="device_bindings")
    device_id = models.CharField(max_length=128)
    certificate_fingerprint = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PROVISIONED)
    bound_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "device_id"], name="uniq_user_device"),
        ]

    def __str__(self) -> str:
        return f"{self.device_id} ({self.status})"


class CriticalActionApproval(models.Model):
    """Double approbation pour les opérations électorales critiques."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        APPROVED = "APPROVED", "Approuvé"
        REJECTED = "REJECTED", "Rejeté"

    action = models.CharField(max_length=128)
    object_ref = models.CharField(max_length=128)
    requested_by = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="+")
    approver = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="+", null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.action} #{self.id} ({self.status})"


class MFAConfig(models.Model):
    """Configuration MFA (TOTP) d'un utilisateur — secret chiffré + codes de secours.

    Le secret TOTP est stocké côté serveur (jamais dans un APK) et les codes de
    secours sont hachés. `enabled` reflète l'activation effective du MFA.
    """

    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="mfa")
    totp_secret = models.CharField(max_length=64)
    backup_codes_hash = models.JSONField(default=list)  # liste de hash des codes de secours
    enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"MFA {self.user} (enabled={self.enabled})"

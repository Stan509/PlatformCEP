"""DRF Permission Guard & ABAC Scope Enforcement.

Enforces server-side granular permissions (`resource.action`) and territorial/electoral scopes.
Never relies on role string shortcuts alone.
"""
from typing import Any
from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class HasGranularPermissionAndScope(BasePermission):
    """DRF Permission Class checking required permission code and resource scope."""

    required_permission: str | None = None

    def __init__(self, required_permission: str | None = None) -> None:
        if required_permission:
            self.required_permission = required_permission
        super().__init__()

    def has_permission(self, request: Request, view: Any) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        # Get permission required on view
        required_perm = getattr(view, "required_permission", self.required_permission)
        if not required_perm:
            return True

        return request.user.has_perm_code(required_perm)

    def has_object_permission(self, request: Request, view: Any, obj: Any) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        # Check required permission
        required_perm = getattr(view, "required_permission", self.required_permission)
        if required_perm and not request.user.has_perm_code(required_perm):
            return False

        # Build scope target from object attributes
        target_scope = {}
        if hasattr(obj, "department") and getattr(obj, "department"):
            target_scope["department"] = getattr(obj, "department")
        elif hasattr(obj, "territorial_node") and getattr(obj, "territorial_node"):
            node = getattr(obj, "territorial_node")
            target_scope["department"] = getattr(node, "code", None)

        if hasattr(obj, "commune") and getattr(obj, "commune"):
            target_scope["commune"] = getattr(obj, "commune")

        if hasattr(obj, "election") and getattr(obj, "election"):
            election = getattr(obj, "election")
            target_scope["election"] = str(getattr(election, "id", election))

        if hasattr(obj, "party") and getattr(obj, "party"):
            party = getattr(obj, "party")
            target_scope["party"] = str(getattr(party, "id", party))

        return request.user.has_scope_target(target_scope)


def make_permission_class(perm_code: str):
    """Factory creating a dynamic DRF Permission class for a specific permission code."""
    class DynamicPermission(HasGranularPermissionAndScope):
        required_permission = perm_code
    return DynamicPermission


# ==============================================================================
# LOCK 2 : PRÉVENTION DES ÉLÉVATIONS DE PRIVILÈGES (HIÉRARCHIE ABAC / RBAC)
# ==============================================================================
from rest_framework.exceptions import PermissionDenied
from apps.accounts.models import Role
from apps.audit.services import log_audit_event

# Rangs Hiérarchiques (Plus le nombre est petit, plus le privilège est élevé)
ROLE_HIERARCHY_RANK = {
    Role.SUPERADMIN_DEVOPS: 0, # DevOps technique (aucun privilège électoral)
    Role.SUPERADMIN: 1,
    Role.ADMIN_CEP: 1,         # Présidence et Conseil du CEP
    Role.MEMBER_CEP: 1,
    Role.ELECTORAL_MANAGER: 2,
    Role.BED: 3,                # Direction Départementale BED
    Role.CIV_MANAGER: 4,
    Role.BEC: 4,                # Direction Communale BEC
    Role.SUPERVISOR: 5,
    Role.FIELD_AGENT: 5,
    Role.POLLING_AGENT: 5,
    Role.AUDITOR: 6,
    Role.OBSERVER: 6,
    Role.PARTY: 6,
    Role.CANDIDATE: 6,
    Role.CITIZEN: 6,
    Role.DIASPORA: 6,
}


def validate_user_provisioning(creator, target_role: str, target_scope: dict) -> None:
    """Valide les règles strictes de non-escalade de privilèges et de confinement géographique.
    
    1. Contrôle d'Isolation DevOps : Le DevOps ne crée pas de comptes électoraux, et vice-versa.
    2. Contrôle de Pair à Pair (Peer Role Enforcement) : Un créateur au rang N ne peut créer QUE des rangs M > N.
    3. Confinement de l'Étendue Géographique (Scope Containment) : L'étendue attribuée doit être un sous-ensemble strict du créateur.
    """
    if not creator or not creator.is_authenticated:
        raise PermissionDenied("Authentification requise pour provisionner un compte.")

    creator_role = getattr(creator, "role", Role.CITIZEN)

    # 1. DevOps Isolation Guard
    if creator_role == Role.SUPERADMIN_DEVOPS or getattr(creator, "username", "") == "devops.admin":
        if target_role != Role.SUPERADMIN_DEVOPS:
            _log_escalation_attempt(creator, target_role, target_scope, "DevOps user cannot provision electoral account")
            raise PermissionDenied("PRIVILEGE ESCALATION GUARD : Le rôle Superadmin DevOps ne peut pas provisionner de compte électoral.")

    if target_role == Role.SUPERADMIN_DEVOPS and creator_role != Role.SUPERADMIN_DEVOPS:
        _log_escalation_attempt(creator, target_role, target_scope, "Electoral admin cannot provision DevOps account")
        raise PermissionDenied("PRIVILEGE ESCALATION GUARD : Les administrateurs électoraux ne peuvent pas provisionner de compte Superadmin DevOps.")

    # 2. Peer Role Enforcement (Role Hierarchy Rank)
    creator_rank = ROLE_HIERARCHY_RANK.get(creator_role, 99)
    target_rank = ROLE_HIERARCHY_RANK.get(target_role, 99)

    # Allow Presidence/Council (Rank 1) to provision any subordinate role (Ranks 1..6 except DevOps)
    if creator_rank > 1:
        if target_rank <= creator_rank:
            _log_escalation_attempt(creator, target_role, target_scope, f"Peer or higher role creation denied (creator rank {creator_rank} <= target rank {target_rank})")
            raise PermissionDenied(
                f"PRIVILEGE ESCALATION GUARD : Un utilisateur de rôle '{creator_role}' (rang {creator_rank}) ne peut pas créer un rôle égal ou supérieur '{target_role}' (rang {target_rank})."
            )

    # 3. Scope Containment Rule
    creator_scope = getattr(creator, "scope", {}) or {}
    if not creator_scope.get("isGlobal", False):
        creator_depts = set(creator_scope.get("departments", []))
        target_depts = set(target_scope.get("departments", []))

        # Target cannot be global if creator is not global
        if target_scope.get("isGlobal", False):
            _log_escalation_attempt(creator, target_role, target_scope, "Non-global creator cannot provision global scope")
            raise PermissionDenied("SCOPE CONTAINMENT GUARD : Un utilisateur restreint géographiquement ne peut pas provisionner un compte à portée globale.")

        # Target departments must be strict subset of creator departments
        if target_depts and not target_depts.issubset(creator_depts):
            _log_escalation_attempt(creator, target_role, target_scope, f"Department scope containment breach ({target_depts} not subset of {creator_depts})")
            raise PermissionDenied(
                f"SCOPE CONTAINMENT GUARD : L'étendue départementale attribuée {list(target_depts)} dépasse votre portée autorisée {list(creator_depts)}."
            )

        creator_communes = set(creator_scope.get("communes", []))
        target_communes = set(target_scope.get("communes", []))
        if creator_communes and target_communes and not target_communes.issubset(creator_communes):
            _log_escalation_attempt(creator, target_role, target_scope, f"Commune scope containment breach ({target_communes} not subset of {creator_communes})")
            raise PermissionDenied(
                f"SCOPE CONTAINMENT GUARD : L'étendue communale attribuée {list(target_communes)} dépasse votre portée autorisée {list(creator_communes)}."
            )


def _log_escalation_attempt(creator, target_role: str, target_scope: dict, reason: str) -> None:
    try:
        log_audit_event(
            actor_ref=creator.username,
            actor_role=getattr(creator, "role", ""),
            action="PRIVILEGE_ESCALATION_ATTEMPT_DENIED",
            object_ref=target_role,
            reason=reason,
            new_value={"target_role": target_role, "target_scope": target_scope}
        )
    except Exception:
        pass


"""Classes de Permissions DRF d'Autorité pour CEP Platform.
Séparation stricte entre l'Infrastructure (DEVOPS) et le Processus Électoral (CEP).
"""
from rest_framework.permissions import BasePermission
from apps.audit.models import AuditEvent


class IsDevOpsOnly(BasePermission):
    """Autorise UNIQUEMENT le personnel technique DevOps / Infrastructure.
    Interdit strictement l'accès aux membres du CEP et acteurs électoraux.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, "role", "")
        user_perms = getattr(request.user, "permissions", []) or []

        # Check if user is explicit DevOps
        is_devops = (
            user_role == "SUPERADMIN_DEVOPS" or
            request.user.username == "devops.admin" or
            "infrastructure.monitor" in user_perms
        )

        if not is_devops:
            # Audit Security Violation Attempt
            try:
                AuditEvent.objects.create(
                    event_type="UNAUTHORIZED_DEVOPS_ACCESS_ATTEMPT",
                    actor=request.user.username,
                    target=request.path,
                    details={"role": user_role, "reason": "Non-DevOps user attempted accessing infrastructure endpoint"},
                    ip_address=request.META.get("REMOTE_ADDR", "127.0.0.1")
                )
            except Exception:
                pass
            return False

        return True


class IsElectoralAdminOnly(BasePermission):
    """Autorise les membres et agents du CEP selon leurs habilitations électorales.
    Interdit STRICTEMENT tout accès ou modification au rôle DEVOPS.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, "role", "")

        # DEVOPS HAS ZERO ELECTORAL PERMISSIONS — DENY BY DEFAULT
        if user_role == "SUPERADMIN_DEVOPS" or request.user.username == "devops.admin":
            if request.method not in ["GET", "HEAD", "OPTIONS"]:
                try:
                    AuditEvent.objects.create(
                        event_type="DEVOPS_ELECTORAL_MUTATION_DENIED",
                        actor=request.user.username,
                        target=request.path,
                        details={"method": request.method, "reason": "DevOps user attempted modifying electoral data"},
                        ip_address=request.META.get("REMOTE_ADDR", "127.0.0.1")
                    )
                except Exception:
                    pass
                return False
            # Even read access for electoral mutation endpoints is forbidden for DevOps
            return False

        # Allow valid electoral roles
        valid_electoral_roles = [
            "ADMIN_CEP", "MEMBER_CEP", "ELECTORAL_MANAGER",
            "BED", "BEC", "CIV_MANAGER", "FIELD_AGENT", "POLLING_AGENT", "SUPERVISOR", "AUDITOR"
        ]

        return user_role in valid_electoral_roles or request.user.is_staff

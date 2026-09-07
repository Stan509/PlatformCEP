"""Vues — authentification (JWT + MFA) et profil.

Sécurité : MFA obligatoire pour les comptes privilégiés, sessions courtes,
détection d'anomalies (implémentation basique), contrôle d'accès RBAC.
"""
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .mfa import verify_backup_code, verify_totp
from .models import MFAConfig, User
from .serializers import LoginSerializer, MFAVerifySerializer, ProfileSerializer


def _tokens_for(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class LoginView(APIView):
    """Étape 1 — mot de passe. Émet un défi MFA si activé, sinon des tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        if getattr(user, "mfa_enabled", False):
            return Response({"mfa_required": True, "username": user.username}, status=status.HTTP_200_OK)

        return Response(_tokens_for(user), status=status.HTTP_200_OK)


class MFAVerifyView(APIView):
    """Étape 2 — vérification MFA (TOTP ou code de secours) puis émission des tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = MFAVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        code = serializer.validated_data["code"]

        config: MFAConfig | None = getattr(user, "mfa", None)
        if config and verify_totp(config.totp_secret, code):
            return Response(_tokens_for(user), status=status.HTTP_200_OK)
        if config and verify_backup_code(user, code):
            return Response(_tokens_for(user), status=status.HTTP_200_OK)

        return Response({"detail": "Code MFA invalide."}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    """Profil de l'utilisateur connecté (données minimisées)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data, status=status.HTTP_200_OK)


from .rbac import validate_user_provisioning
from apps.audit.services import log_audit_event


class UserProvisionView(APIView):
    """API de création/provisionnement de sous-comptes institutionnels protégée contre l'escalade de privilèges."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get("username", "").strip().lower()
        role = request.data.get("role", "")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        password = request.data.get("password", "CepPassword2026!")
        scope = request.data.get("scope", {})

        if not username or not role:
            return Response({"error": "Les champs 'username' et 'role' sont obligatoires."}, status=status.HTTP_400_BAD_REQUEST)

        # Lock 2: Privilege Escalation & Scope Containment Guards
        validate_user_provisioning(request.user, role, scope)

        if User.objects.filter(username=username).exists():
            return Response({"error": f"L'utilisateur '{username}' existe déjà."}, status=status.HTTP_400_BAD_REQUEST)

        # Set provisionedBy in scope
        updated_scope = dict(scope)
        updated_scope["provisionedBy"] = request.user.username

        new_user = User.objects.create(
            username=username,
            role=role,
            first_name=first_name,
            last_name=last_name,
            scope=updated_scope,
            is_staff=True
        )
        new_user.set_password(password)
        new_user.save()

        # Audit Log Entry
        try:
            log_audit_event(
                actor_ref=request.user.username,
                actor_role=getattr(request.user, "role", ""),
                action="USER_ACCOUNT_PROVISIONED",
                object_ref=username,
                new_value={"role": role, "scope": updated_scope}
            )
        except Exception:
            pass

        return Response({
            "success": True,
            "username": new_user.username,
            "role": new_user.role,
            "scope": new_user.scope,
            "message": f"Compte '{username}' provisionné avec succès avec le rôle '{role}'."
        }, status=status.HTTP_201_CREATED)


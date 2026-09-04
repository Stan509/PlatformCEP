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

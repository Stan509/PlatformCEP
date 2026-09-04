"""Permissions DRF — lecture publique pour les données institutionnelles.

Les données publiques (élections, candidats, géographie publiée) sont lisibles
sans authentification. Les écritures restent protégées par le RBAC fin
(implémenté en Phase 3 — identité/IAM).
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsPublicReadOrAuthenticated(BasePermission):
    """Lecture publique autorisée ; écriture réservée aux utilisateurs connectés."""

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

"""Vues — élections (lecture publique, écriture protégée RBAC)."""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from apps.accounts.permissions import IsPublicReadOrAuthenticated
from .models import Election
from .serializers import ElectionSerializer


class ElectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    permission_classes = [IsPublicReadOrAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["election_type", "status"]

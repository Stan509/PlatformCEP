"""Vues — candidats (lecture publique, neutralité, ordre officiel)."""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from apps.accounts.permissions import IsPublicReadOrAuthenticated
from .models import Candidate
from .serializers import CandidateSerializer


class CandidateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [IsPublicReadOrAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["election", "post", "party"]

    def get_queryset(self):
        # Neutralité : ordre officiel (ballot_index), jamais par popularité.
        return Candidate.objects.select_related("party").order_by("ballot_index")

"""Serializers — candidats & partis (neutralité absolue)."""
from rest_framework import serializers

from .models import Candidate, Party


class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ["id", "acronym", "name", "status"]


class CandidateSerializer(serializers.ModelSerializer):
    party = PartySerializer(read_only=True)
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Candidate
        fields = [
            "id", "display_name", "first_name", "last_name", "party",
            "post", "territory_node", "ballot_index", "status",
        ]

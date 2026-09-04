"""Serializers — élections."""
from rest_framework import serializers

from .models import Election, TerritoryRule


class TerritoryRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerritoryRule
        fields = ["post", "scope", "assign", "ordering", "is_active"]


class ElectionSerializer(serializers.ModelSerializer):
    territory_rules = TerritoryRuleSerializer(many=True, read_only=True)

    class Meta:
        model = Election
        fields = [
            "id", "name", "election_type", "status", "legal_configuration",
            "start_date", "end_date", "territory_rules",
        ]
        read_only_fields = ["id"]

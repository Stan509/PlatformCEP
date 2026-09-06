"""Serializers — authentification & MFA."""
from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user or not user.is_active:
            raise serializers.ValidationError("Identifiants invalides.")
        attrs["user"] = user
        return attrs


class MFAVerifySerializer(serializers.Serializer):
    username = serializers.CharField()
    code = serializers.CharField()

    def validate(self, attrs):
        try:
            user = User.objects.get(username=attrs["username"])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Identifiants invalides.") from exc
        if not user.is_active:
            raise serializers.ValidationError("Compte inactif.")
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "role", "mfa_enabled", "electoral_reference",
            "permissions", "scope", "first_name", "last_name", "email"
        ]


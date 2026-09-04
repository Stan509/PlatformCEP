"""Tests d'immuabilité du journal d'audit (tamper-evident)."""
from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import AuditEvent


class AuditImmutableTest(TestCase):
    def setUp(self):
        self.event = AuditEvent.objects.create(
            actor_ref="test.cep.admin", action="election.publish", event_hash="deadbeef", previous_hash=None,
        )

    def test_update_is_forbidden(self):
        self.event.reason = "tentative de modification"
        with self.assertRaises(ValidationError):
            self.event.save()

    def test_delete_is_forbidden(self):
        with self.assertRaises(ValidationError):
            self.event.delete()

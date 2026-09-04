"""Tests de séparation stricte identité / vote.

Garantit par conception que le `Ballot` (bulletin anonyme) ne porte AUCUNE
clé étrangère vers l'identité (`Elector`) ni vers l'autorisation
(`ParticipationToken`).
"""
from django.test import TestCase

from .models import Ballot, Elector, ParticipationToken


class BallotSeparationTest(TestCase):
    def test_ballot_has_no_identity_foreign_key(self):
        for field in Ballot._meta.get_fields():
            related = getattr(field, "related_model", None)
            self.assertNotEqual(related, Elector, "Ballot ne doit jamais référencer Elector")
            self.assertNotEqual(related, ParticipationToken, "Ballot ne doit jamais référencer ParticipationToken")
        self.assertFalse(hasattr(Ballot, "elector"), "Ballot ne doit pas avoir de champ électeur visible")

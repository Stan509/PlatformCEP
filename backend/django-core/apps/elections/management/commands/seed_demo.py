"""Seed de données de DÉMONSTRATION — totalement fictives.

⚠️ Aucune donnée citoyenne réelle. Uniquement pour dev/test.
Comptes & identifiants marqués `DEMO`.

Exécution :
    python manage.py seed_demo
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import Role, User
from apps.candidates.models import Candidate, CandidateStatus, Party
from apps.elections.models import Election, ElectionStatus, TerritoryRule
from apps.geography.models import GeoLevel, GeographicNode, GeoVersion, PollingStation, VotingCenter

# Comptes DEMO : <username> -> (role, mfa)
DEMO_USERS = {
    "test.superadmin": (Role.SUPERADMIN, True),
    "test.dev": (Role.DEV, False),
    "test.cep.admin": (Role.ADMIN_CEP, True),
    "test.cep.member": (Role.MEMBER_CEP, True),
    "test.bed": (Role.BED, True),
    "test.bec": (Role.BEC, True),
    "test.field.agent": (Role.FIELD_AGENT, False),
    "test.polling.agent": (Role.POLLING_AGENT, False),
    "test.candidate": (Role.CANDIDATE, False),
    "test.party": (Role.PARTY, False),
    "test.auditor": (Role.AUDITOR, True),
    "test.observer": (Role.OBSERVER, False),
    "test.citizen": (Role.CITIZEN, False),
    "test.diaspora": (Role.DIASPORA, False),
}

# Candidats DEMO — noms fictifs, ordre officiel par ballot_index.
DEMO_CANDIDATES = [
    ("Demo", "Personne A", 1),
    ("Demo", "Personne B", 2),
    ("Demo", "Personne C", 3),
]


class Command(BaseCommand):
    help = "Crée les données de démonstration fictives (comptes, géo, élection, candidats)."

    def handle(self, *args, **options) -> None:
        self._seed_users()
        self._seed_geography()
        self._seed_election()
        self.stdout.write(self.style.SUCCESS("Seed DEMO terminé (données fictives uniquement)."))

    def _seed_users(self) -> None:
        for username, (role, mfa) in DEMO_USERS.items():
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"role": role, "mfa_enabled": mfa, "is_staff": role == Role.ADMIN_CEP, "is_superuser": False},
            )
            if created:
                user.set_password("Demo!Passw0rd-2026")  # mot de passe fictif de démo
                user.save()
                self.stdout.write(f"  + {username} ({role})")

    def _seed_geography(self) -> None:
        geo_version, _ = GeoVersion.objects.get_or_create(
            version="2026.0",
            defaults={
                "effective_from": timezone.now().replace(month=1, day=1),
                "source": "demo-seed",
                "author": "test.cep.admin",
                "approver": "test.superadmin",
            },
        )
        haiti, _ = GeographicNode.objects.get_or_create(
            code="HT", geo_version=geo_version,
            defaults={"level": GeoLevel.COUNTRY, "name": {"ht": "Ayiti", "fr": "Haïti", "en": "Haiti"}},
        )
        ouest, _ = GeographicNode.objects.get_or_create(
            code="OU", geo_version=geo_version, parent=haiti,
            defaults={"level": GeoLevel.DEPARTMENT, "name": {"ht": "Lwès", "fr": "Ouest", "en": "West"}},
        )
        pap, _ = GeographicNode.objects.get_or_create(
            code="OU-1", geo_version=geo_version, parent=ouest,
            defaults={"level": GeoLevel.COMMUNE, "name": {"ht": "Pòtoprens", "fr": "Port-au-Prince", "en": "Port-au-Prince"}},
        )
        center, _ = VotingCenter.objects.get_or_create(
            node=pap, code="C1", geo_version=geo_version,
            defaults={"name": {"ht": "Sant 1", "fr": "Centre 1", "en": "Center 1"}, "address": "Adresse démo"},
        )
        PollingStation.objects.get_or_create(
            center=center, code="B0042", geo_version=geo_version,
            defaults={"name": {"ht": "Biro 0042", "fr": "Bureau 0042", "en": "Station 0042"}},
        )
        self.stdout.write("  + Géographie versionnée 2026.0 (demo)")

    def _seed_election(self) -> None:
        now = timezone.now()
        election, _ = Election.objects.get_or_create(
            election_type="demo_2026",
            start_date=now - timedelta(hours=2),
            defaults={
                "name": {"ht": "Eleksyon Demo 2026", "fr": "Élection Démo 2026", "en": "Demo Election 2026"},
                "status": ElectionStatus.OPEN,
                "end_date": now + timedelta(hours=8),
                "rules": {
                    "territory": {"post": "representative", "scope": "commune", "assign": "commune"},
                    "voting": {"modalities": ["physical"], "ballot_neutrality": True},
                    "publication": {"levels": ["national", "department", "commune"]},
                },
            },
        )
        TerritoryRule.objects.get_or_create(
            election=election, post="representative",
            defaults={"scope": "commune", "assign": "commune", "ordering": 1, "is_active": True},
        )
        party, _ = Party.objects.get_or_create(acronym="DEMO", defaults={"name": {"ht": "Patri Demo", "fr": "Parti Démo", "en": "Demo Party"}})
        for first, last, index in DEMO_CANDIDATES:
            Candidate.objects.get_or_create(
                election=election, post="representative", territory_node=None, ballot_index=index,
                defaults={"first_name": first, "last_name": last, "party": party, "status": CandidateStatus.PUBLISHED},
            )
        self.stdout.write(f"  + Élection demo_2026 (OPEN) + {len(DEMO_CANDIDATES)} candidats demo")

# CEP — Django Core

Backend principal de l'écosystème électoral : Python + Django + DRF + PostgreSQL.

## Domaines (applications)

| App | Domaine |
|---|---|
| `accounts` | Identité & RBAC (rôles, permission, MFA, device binding) |
| `registry` | Registre électoral + séparation stricte identité / vote |
| `geography` | Moteur de géographie versionné (configurable) |
| `elections` | Moteur électoral configurable (jamais codé en dur) |
| `candidates` | Candidats & partis (neutralité absolue) |
| `operations` | Centres, bureaux, agents, PV, tabulation |
| `incidents` | Workflow d'incidents |
| `audit` | Journal d'audit immuable (tamper-evident) |

## Configuration

```bash
cp .env.example .env
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo   # données de démonstration FICTIVES (comptes test.*, élection, candidats)
python manage.py runserver
```

## API (lecture publique, écriture protégée RBAC)

- `GET /api/elections/` — scrutins configurés (filtrable par type/statut).
- `GET /api/candidates/` — candidats (ordre officiel, jamais par popularité).
- Schéma OpenAPI : `/api/docs/`, `/api/schema/`.

## Tests

```bash
python manage.py test           # inclut les invariants d'immutabilité & de séparation
python manage.py test apps.audit.Tests apps.registry.Tests
```

## Domaine & sécurité (Phase 2)

- **Séparation stricte identité/vote** : `Ballot` sans lien vers `Elector`.
- **Audit immuable** : `AuditEvent` non modifiable/non supprimable, chaîné par hash.
- **Moteur électoral configurable** : `Election.rules` + `TerritoryRule` (jamais codé en dur).
- **Données fictives uniquement** : commande `seed_demo`, comptes `test.*`.

> Modèles métier livrés en Phase 2 ; primitives crypto Go/Rust en Phase 3.

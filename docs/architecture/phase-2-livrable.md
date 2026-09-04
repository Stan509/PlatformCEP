# CEP — Livrable Phase 2 : Backend Django / PostgreSQL (modèles + RBAC)

> Ce document récapitule le travail livré pour la **Phase 2** : modèles de
> données, RBAC, API DRF de lecture et jeu de seed de démonstration.

---

## 1. Modèles créés (`backend/django-core/apps/*/models.py`)

### `accounts` — IAM / RBAC
- `Role` (TextChoices) : les 17 rôles du Document Maître §6.
- `User` (custom `AUTH_USER_MODEL="accounts.User"`) : rôle + MFA + `electoral_reference`.
- `DeviceBinding` : liaison appareil ↔ utilisateur (provisionné/actif/suspendu/perdu/volé/révoqué/retraité).
- `CriticalActionApproval` : double approbation des opérations critiques.

### `geography` — moteur versionné
- `GeoVersion` : version, date d'effet, source, auteur, approbateur.
- `GeographicNode` : arbre (parent self), multilingue (`{ht,fr,en}`), contrainte `unique(code, version)`.
- `VotingCenter` / `PollingStation` : centres et bureaux rattachés aux nœuds.

### `elections` — moteur 100 % configurable
- `Election` : nom multilingue, statut, `rules` (JSON : territoire / éligibilité / vote / décompte / publication), `CheckConstraint(end > start)`.
- `TerritoryRule` : règle post ↔ scope ↔ assign **configurable**, jamais codée en dur.

### `registry` — séparation stricte identité / vote 💡
| Modèle | Domaine | Lien identité |
|---|---|---|
| `Elector` | identity | référence minimale + `identity_hash` (pas d'identité civile en clair) |
| `EligibilityCheck` | eligibility | par électeur + scrutin |
| `ParticipationToken` | participation | droit de voter (`unique(election, elector)` → anti-double-vote) |
| `Ballot` | bulletin | **AUCUNE clé étrangère vers `Elector` / `ParticipationToken`** |
| `RecordedVote` | reçu | référence un bulletin **anonyme** ; le reçu ne révèle pas le choix |

### `candidates` — neutralité absolue
- `Party` + `Candidate` (`ballot_index` = ordre officiel, jamais par popularité ; contrainte d'unicité par slot).

### `operations` — workflow bureau
- `PollingSession` (ouverture → clôture) + `ProcessingRecord` (PV reçu, anomalies, signature).

### `incidents` / `audit`
- `Incident` : catégorie / sévérité / statut / journal d'événements.
- `AuditEvent` : **immuable** — `save()`/`delete()` lèvent une `ValidationError` ; chaîne `previous_hash` (tamper-evident).

## 2. API DRF (lecture publique)

- `GET /api/elections/` et `GET /api/candidates/` (filtrable, ordre officiel).
- Permission `IsPublicReadOrAuthenticated` : lecture publique, écriture protégée RBAC.
- Schéma OpenAPI servi par drf-spectacular (`/api/docs/`, `/api/schema/`).

## 3. Seed de démonstration (données FICTIVES)

```bash
python manage.py seed_demo
```

Crée : les 14 comptes `test.*` (avec rôles), la géographie versionnée `2026.0`,
une élection `demo_2026` (OPEN, règles configurables), 1 parti + 3 candidats
demo, et un bureau. **Aucune donnée citoyenne réelle.**

## 4. Tests qui prouvent les invariants

- `apps/audit/tests.py` : un `AuditEvent` ne peut être ni modifié ni supprimé.
- `apps/registry/tests.py` : un `Ballot` ne porte aucun FK vers `Elector` /
  `ParticipationToken` (séparation stricte).

## 5. Ce qui reste

- **Phase 3** : cryptographie & validation (branchement Go ↔ Rust), PKI, MFA réel.
- **Phase 4–6** : écrans PWA, Admin/Command Center, APK local-first.

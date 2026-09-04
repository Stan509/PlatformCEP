# CEP — Livrable Phase 1 : Design System & Structure du projet

> Ce document récapitule le travail livré pour la **Phase 1** (Design System &
> Design Tokens) ainsi que la **structure globale de base** du monorepo,
> conformément aux deux documents fondateurs.

---

## 1. Structure du monorepo (créée)

```
cep-election-platform/
├── apps/                       # Applications
│   ├── public-pwa/             # PWA publique institutionnelle (Vite + React)
│   ├── cep-admin/              # Cockpit CEP / Command Center (squelette)
│   ├── field-app/              # APK agents de terrain (local-first)
│   └── polling-app/            # APK bureaux de vote (local-first)
├── backend/django-core/        # Python + Django + DRF (domaines + API)
├── services/
│   ├── go-gateway/             # API Gateway (Go)
│   └── sync-service/           # Synchronisation sécurisée (Go)
├── rust/crypto-core/           # Primitives crypto / audit immuable (Rust)
├── packages/
│   ├── design-system/          # Design tokens + bibliothèque de composants
│   ├── shared-types/           # Types partagés du domaine électoral
│   └── i18n/                   # Kreyòl / Français / English
├── infrastructure/             # Docker, monitoring, K8s/Terraform (à venir)
├── security/                   # Threat model, policies, keys, audit
├── tests/                      # Unit / integration / e2e / security / offline / mobile
└── docs/                       # Architecture / API / operations / training
```

## 2. Design tokens (`packages/design-system/src/tokens`)

| Token | Contenu |
|---|---|
| `colors` | Palette officielle CEP (CEP Blue `#0A4A7A`, Deep Blue `#073B61`, Light Blue `#EAF4FB`, surfaces, états sémantiques Success/Warning/Danger) |
| `spacing` | Grille 4px : 4/8/12/16/24/32/40/48/64/80/96 |
| `typography` | Inter, hiérarchie Display→H1→H2→H3→Body→Small→Caption |
| `radius` | 8 / 12 / 16 / 20–24 px |
| `shadows` | Ombres très discrètes (jamais lourdes) |
| `breakpoints` | mobile/tablet/laptop/desktop/large-desktop |
| `motion` | 150–250 ms (micro) / 250–400 ms (majeur), `prefers-reduced-motion` |

Le thème agrégé (`theme`) et le générateur de variables CSS (`themeToCssVariables`)
permettent de consommer les tokens sans valeur en dur. Le fichier `styles.css`
exporte les variables `--cep-*` + les classes des composants.

## 3. Composants livrés

`Button` · `Input` · `Card` · `Modal` · `Table` · `StatusIndicator` ·
`SyncIndicator` · `OfflineBanner` · `LanguageSwitcher`

Chaque composant gère les états obligatoires (spec §40) : default / hover /
focus / active / disabled / loading / success / warning / error / offline.
Les textes sont externalisés via i18n. **Aucune chaîne UI codée en dur.**

## 4. Multilinguisme (`packages/i18n`)

- Langue par défaut : **Kreyòl** → Français → English.
- `I18nProvider` + `useI18n` avec persistance de la langue (localStorage).
- Interpolation + pluralisation de base. Locales : `locales/{ht,fr,en}.json`.

## 5. Types partagés (`packages/shared-types`)

Types du domaine électoral avec **séparation stricte identité / vote** :
`ElectorPublic` (identity), `EligibilityCheck`, `ParticipationToken` (participation),
`Ballot` / `RecordedVote` (anonymes), `Election`, `Candidate`, `ResultConfidence`,
`Role`, `Device`, `AuditEvent`, `Incident`, `GeoVersion`.

## 6. Invariants appliqués dès la Phase 1

- **Neutralité absolue** : cartes candidats identiques, `ballotIndex` = ordre
  officiel (pas de popularité). Aucune couleur de parti dans l'interface.
- **Séparation identité/vote** : modélisée par des types disjoints (un `Ballot`
  ne référence jamais une identité).
- **RBAC** : politique documentée (`security/policies/rbac.md`) — le rôle `DEV`
  n'a aucun droit électoral.
- **Données de test fictives** : `tests/fixtures/seed-users.json` +
  `demo-geography.json` (comptes `test.*` / géographie versionnée — DEMO).

## 7. Démarrage (après `pnpm install`)

```bash
# Public PWA (port 3000)
pnpm --filter @cep/public-pwa dev

# Admin (3001) / Field (3002) / Polling (3003)
pnpm --filter @cep/cep-admin dev
pnpm --filter @cep/field-app dev
pnpm --filter @cep/polling-app dev

# Tests crypto (Rust)
cd rust/crypto-core && cargo test
```

## 8. Ce qui reste (phases suivantes)

- **Phase 2** : modèles Django (registre, géo versionnée, moteur électoral, candidats) + RBAC migrations.
- **Phase 3** : branchement de la validation crypto (Go ↔ Rust) + primitives complètes.
- **Phase 4–6** : écrans PWA complets, Admin CEP & Command Center, APK local-first.

> ⚠️ Aucune fonctionnalité électorale n'est juridiquement active. Tout est
> configurable et soumis à validation par les autorités compétentes.

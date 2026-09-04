# CEP — État de l'écosystème (toutes phases livrées)

Ce document synthétise l'état de la génération de l'écosystème électoral CEP
après livraison des **6 phases**. Les invariants et modules sont décrits dans
`../README.md`.

## Phases livrées

| Phase | Livrable | Détail |
|---|---|---|
| 1 | Design System & Design Tokens | `packages/design-system` (tokens CEP, Inter, grille 4px, composants + états) + `i18n` + `shared-types` |
| 2 | Backend Django/PostgreSQL | 8 domaines, RBAC, séparation identité/vote, moteur configurable, API DRF, seed démo |
| 3 | Services sécurité & crypto | Rust `crypto-core` (Ed25519, SHA-256, audit immuable, CLI) + Go `sync-service` (validation) + MFA/PKI |
| 4 | PWA Public | Accueil, statut, inscription (wizard), candidats, résultats (confiance), infos — i18n + états |
| 5 | Admin CEP & Command Center | Cockpit + Command Center + gestion (élections, appareils, incidents, audit, releases) |
| 6 | APK terrain & bureau (local-first) | `packages/local-first` (file signée) + field-app + polling-app offline-first |

## Architecture du dépôt

```
apps/{public-pwa, cep-admin, field-app, polling-app}
backend/django-core
services/{go-gateway, sync-service}
rust/crypto-core
packages/{design-system, shared-types, i18n, local-first}
infrastructure  security  tests  docs
```

## Invariants vérifiés (par conception)

- **Neutralité absolue** : cartes candidats identiques, `ballotIndex` officiel, aucune couleur politique.
- **Séparation identité/vote** : `Ballot` sans FK identité (Django) ; transaction de vote sans identité (APK).
- **Local-first** : file de transactions signées/chaînées + bandeau offline/online permanent.
- **Audit immuable** : `AuditEvent` non-modifiable/non-supprimable, chaîne `previous_hash`.
- **Configuration dynamique** : `Election.rules` + `TerritoryRule` ; jamais codé en dur.
- **Multilinguisme** : Kreyòl (défaut) / Français / English — aucun texte UI en dur.
- **Données fictives** : comptes `test.*`, géo démo, candidats/résultats démo.

## Limites / étapes suivantes (qualité & validation)

> Ce dépôt est une **génération d'architecture et de code**, pas une mise en
> production. Avant tout usage réel, il faut (Document Maître §44, §63) :

1. `python manage.py makemigrations && migrate` (Django) et `cargo test` (Rust).
2. `pnpm install && pnpm build` + typecheck TypeScript des 4 apps.
3. Brancher la **signature Ed25519 réelle** (Rust) dans le `Signer` des APK (le
   `DemoSigner` est HMAC-like en attendant).
4. Tests de sécurité : SAST, DAST, pentest, tests offline/replay/anti-double-vote.
5. Revue cryptographique indépendante.
6. Validation institutionnelle & juridique des règles électorales.

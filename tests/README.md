# CEP — Tests

Hiérarchie de tests du monorepo. Chaque package porte aussi ses tests unitaires
locaux (voir `rust/crypto-core/tests`, et les `*.test.*` dans les packages TS).

| Dossier | Type |
|---|---|
| `unit/` | Tests unitaires (composants, fonctions, modèles) |
| `integration/` | Tests d'intégration entre services |
| `e2e/` | End-to-end (parcours UI, workflow bureau de vote) |
| `security/` | SAST/DAST, RBAC, replay, anti-tampering |
| `offline/` | Local-first, files signées, synchronisation |
| `mobile/` | Tests APK terrain & bureau |

## Données de test — DEMO uniquement

Aucune donnée citoyenne réelle en développement. Tous les comptes sont fictifs :

`test.superadmin`, `test.dev`, `test.cep.admin`, `test.cep.member`, `test.bed`,
`test.bec`, `test.field.agent`, `test.polling.agent`, `test.candidate`,
`test.party`, `test.auditor`, `test.observer`, `test.citizen`, `test.diaspora`.

## Critères de sortie (extrait, Document Maître §63)

- Toutes les fonctions critiques testées.
- Toutes les permissions testées.
- APK offline testés ; synchronisation testée ; double-vote testé.
- Secret du vote vérifié ; résultats auditables.

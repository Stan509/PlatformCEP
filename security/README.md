# CEP — Sécurité

Référentiel sécurité : threat model, policies, gestion des clés, audit.

## Arborescence

- `threat-model/` — matrice des adversaires (Document Maître §45).
- `policies/` — politiques RBAC, gestion des secrets, revue crypto, CI/CD.
- `keys/` — **jamais de clé réelle ici** ; uniquement des placeholders `.gitignore`.
- `audit/` — règles de journalisation et d'audit immuable.

## Invariants de sécurité (non négociables)

1. Séparation stricte identité / vote.
2. `DEV` ne donne aucun droit électoral ; le `SUPERADMIN` ne modifie ni vote ni résultat.
3. Opérations critiques = approbations multiples (séparation des pouvoirs).
4. Chaque journal critique est tamper-evident (chaîne hachée par le core Rust).
5. Aucun secret réel dans le dépôt ni dans les APK.
6. APK non signé = refusé ; appareil révoqué = bloqué.

> Revues indépendantes (SAST, DAST, pentest, revue crypto, threat modeling)
> obligatoires **avant** tout déploiement réel (Document Maître §44).

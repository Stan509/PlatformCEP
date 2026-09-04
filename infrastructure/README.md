# CEP — infrastructure

Couche d'infrastructure : containers, orchestration, monitoring, provisioning.

## Arborescence

- `docker/` : fichiers Docker & Compose (PostgreSQL, Django, Go gateway).
- `kubernetes/` : manifests d'orchestration (Phase 2+).
- `terraform/` : provisioning (Phase 2+).
- `monitoring/` : dashboards Prometheus / alerting / observabilité.

## Principes

- Secrets via variables d'environnement / vault — jamais dans Git.
- Chiffrement au repos pour PostgreSQL (infrastructure).
- Réplication + sauvegardes immuables + test de restauration (DR).
- Segmentation réseau stricte ; les services électoraux sensibles sont isolés.

## Environnements

`LOCAL` → `DEV` → `TEST` → `STAGING` → `PILOT` → `PRODUCTION`  
Les données et secrets sont séparés par environnement. Aucun développeur n'utilise
la base de production directement (Document Maître §50).

# CEP — Sync Service

Service de synchronisation sécurisée des transactions local-first.

## Rôle

- Réception des transactions signées (APK terrain & bureau).
- Validation **FIFO strictement croissante** par appareil (anti-replay/rollback).
- **Vérification cryptographique via le core Rust** : intégrité du payload
  (SHA-256) + signature Ed25519 (via le CLI `crypto-cli`).
- Forwarding vers Django Core — le serveur ne fait **jamais** confiance au
  compteur du client (Document Maître §24-25).

## Démarrage

```bash
export SYNC_ADDR=:8090
export DEVICE_PUBLIC_KEYS="DEV-001:<public_hex>,DEV-002:<public_hex>"
go run ./cmd/worker
```

- `GET /healthz` — liveness.
- `POST /api/v1/sync/ingest` — ingestion d'une transaction signée.

> Persistance vers PostgreSQL (via Django Core) branchée en Phase 6 — files APK.

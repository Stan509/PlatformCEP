# CEP — Go API Gateway

Point d'entrée réseau unique de l'écosystème.

## Rôle

- Terminaison TLS, HSTS, CORS strict, rate limiting.
- Routage/forwarding vers Django Core, Identity/IAM et Election Services.
- Ingestion haute concurrence ; ne stocke jamais de donnée électorale sensible.

## Démarrage

```bash
export GATEWAY_ADDR=:8080
export GATEWAY_ALLOWED_ORIGINS=http://localhost:3000
go run ./cmd/server
```

> La logique métier de routage vers Django et la validation cryptographique
> sont ajoutées dans les phases suivantes (Phase 3).

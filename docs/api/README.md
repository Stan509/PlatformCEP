# CEP — API

## Points d'entrée (Phase 2)

L'API est servie par Django Core via DRF, avec une passerelle Go.

| Méthode | Chemin | Domaine |
|---|---|---|
| GET | `/api/schema/` | OpenAPI (drf-spectacular) |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/redoc/` | ReDoc |

Généré automatiquement depuis les viewsets en Phase 2 (`/api/registry/`,
`/api/geography/`, `/api/elections/`, `/api/candidates/`).

## Passerelle Go

- `GET /healthz` — santé du service.
- `GET /api/v1/ping` — liveness.
- `POST /api/v1/sync/ingest` — ingestion des transactions signées (sync-service).

## Sécurité API (obligatoire)

- TLS moderne, HSTS, CSP, CSRF, protection XSS, rate limiting, anti brute-force.
- Validation d'entrée, ORM/queries sûres, rotation de secrets, sessions sécurisées.

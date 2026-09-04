# CEP — Livrable Phase 3 : Services de sécurité & cryptographie (Rust ↔ Go) + MFA/PKI

> Récapitulatif du travail livré pour la **Phase 3** : primitives crypto,
> validation réelle côté Go, authentification forte (MFA), PKI.

---

## 1. Core Rust (`rust/crypto-core`) étendu

| Module | Rôle |
|---|---|
| `hash` | SHA-256 |
| `sign` | Ed25519 — signature/validation + reconstitution depuis clé privée (provisionning) |
| `keygen` | Génération de paires de clés (`SigningKey::generate(&mut OsRng)`) |
| `audit` | Chaîne d'audit immuable `hash(Event N+1 + prev_hash)` |
| `integrity` | Hash / vérification d'intégrité de fichiers (APK, manifests) |
| `nonce` | Anti-replay / anti-rollback (nonce + monotonie de séquence) |

**CLI `crypto-cli`** (`src/bin/crypto-cli.rs`) : `keygen`, `hash`, `sign`,
`verify`, `nonce` — utilisable par Go et les scripts (canal de confiance).

**Tests** (`tests/crypto.rs`) : round-trip signature, keygen, audit tamper-evident,
nonce déterministe + anti-replay, monotonie.

## 2. Go `sync-service` — validation réellement branchée

- `internal/sync/cryptocli.go` : invocation de la CLI Rust (`os/exec`).
- `internal/sync/validator.go` : `RustValidator` — vérifie `payload_hash` (SHA-256)
  **et** la signature Ed25519 (clé publique de l'appareil).
- `internal/sync/memstore.go` : registre de clés publiques (remplacé par la PKI/Django en prod).
- `cmd/worker/main.go` : injecte le registre (`DEVICE_PUBLIC_KEYS`), endpoint
  `POST /api/v1/sync/ingest`, `GET /healthz`.

Principe respecté : le serveur ne fait jamais confiance au compteur client
(`EnsureFIFO`), et une transaction non signée / mal hachée est rejetée.

## 3. Authentification forte & MFA (Django)

- `pyotp` ajouté à `requirements.txt` ; modèle `MFAConfig` (secret + codes de secours hachés).
- `apps/accounts/mfa.py` : `enable_mfa`, `verify_totp`, `generate_backup_codes`, `verify_backup_code`.
- API : `POST /api/auth/login/` (mot de passe → défi MFA si activé), `POST /api/auth/mfa/`
  (TOTP ou code de secours → JWT), `GET /api/auth/me/`. Sessions courtes (JWT 15 min).

## 4. PKI

- `security/pki/README.md` : hiérarchie (Root → Services / Device CA / App Signing /
  Election / Audit) et règles (aucune clé dans le code, APK signé obligatoire).
- `security/pki/provision-device.ps1` : outillage de provisioning d'un appareil
  (génère la paire via `crypto-cli keygen`, charge la clé privée, enregistre la clé publique).

## 5. Invariants renforcés

- **Anti-réplication / anti-replay** : monotonie + nonce.
- **Intégrité & authenticité** : hash payload + signature Ed25519 vérifiés côté serveur.
- **Aucun secret dans le dépôt** : clés générées à l'exécution, jamais commitées.
- **APK signé obligatoire** : vérification d'intégrité (`integrity`).

> ⚠️ Tout mécanisme cryptographique doit être revu indépendamment avant usage
> réel (Document Maître §27, §44). Ce livrable est une base d'ingénierie, pas
> une validation de sécurité.

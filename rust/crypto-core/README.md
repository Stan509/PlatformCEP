# CEP — Crypto Core (Rust)

Composants critiques & sécurité : primitives cryptographiques, validation de
signatures, vérification d'intégrité, protection anti-replay, audit immuable.

## Modules

| Module | Rôle |
|---|---|
| `hash` | SHA-256 — vérification d'intégrité |
| `sign` | Ed25519 — signature / vérification (transactions, audits, APK) |
| `keygen` | Génération de paires de clés (provisionning) |
| `audit` | Chaîne d'audit immuable `hash(Event N+1 + prev_hash)` |
| `integrity` | Hash / vérification d'intégrité de fichiers (APK, manifests) |
| `nonce` | Anti-replay / anti-rollback (nonce + monotonie de séquence) |

## CLI `crypto-cli` (canal de confiance vers Go & scripts)

```bash
cargo run --bin crypto-cli -- keygen                      # génère une paire de clés
cargo run --bin crypto-cli -- hash <message>              # SHA-256
cargo run --bin crypto-cli -- sign <private_hex> <message>
cargo run --bin crypto-cli -- verify <public_hex> <message> <signature_hex>
cargo run --bin crypto-cli -- nonce <device_id> <sequence> <payload_hash>
```

## Principe

> Les algorithmes cryptographiques ne sont pas inventés. Bibliothèques auditées
> et primitives standard (Ed25519, SHA-256). Revue indépendante obligatoire
> avant tout usage réel (Document Maître §27, §44).

## Exemple

```rust
use crypto_core::{SignKeyPair, hash_bytes, verify_bytes, compute_nonce, is_monotonic};

let kp = SignKeyPair::from_seed([7u8; 32]);
let msg = b"transaction-signed";
let sig = kp.sign_hex(msg);
assert!(verify_bytes(&kp.public_hex(), msg, &sig));

assert!(is_monotonic(Some(1), 2));
let nonce = compute_nonce("DEV-001", 2, "payload-hash");
```

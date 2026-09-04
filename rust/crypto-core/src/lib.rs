//! `crypto-core` — primitives cryptographiques du CEP.
//!
//! ⚠️ IMPORTANT : les algorithmes ne sont PAS inventés. Ce core utilise des
//! bibliothèques auditées et des primitives standard (Ed25519, SHA-256).
//! Toute implémentation cryptographique doit être revue et testée
//! indépendamment avant usage (Document Maître §27).
//!
//! Rôle :
//! - signature et vérification des transactions hors ligne (APK) ;
//! - vérification d'intégrité (hash fichiers / manifests) ;
//! - protection anti-replay / anti-rollback (nonce + monotonie) ;
//! - chaîne d'audit immuable (tamper-evident) : `hash(Event N+1 + prev_hash)`.

pub mod audit;
pub mod hash;
pub mod integrity;
pub mod keygen;
pub mod nonce;
pub mod sign;

pub use audit::audit_chain_next_hash;
pub use hash::hash_bytes;
pub use integrity::{file_sha256, verify_file};
pub use keygen::generate_keypair;
pub use nonce::{compute_nonce, is_monotonic};
pub use sign::{verify_bytes, SignKeyPair};

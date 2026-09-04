//! Protection anti-replay / anti-rollback des transactions hors ligne.
//!
//! Un nonce lie un identifiant d'appareil et une séquence pour détecter la
//! réutilisation d'une transaction. Le serveur (Go `sync-service`) applique en
//! plus une stricte monotonie de séquence (Document Maître §24).
use super::hash::hash_bytes;

/// Calcule un nonce anti-replay `hash(device_id | sequence | payload_hash)`.
pub fn compute_nonce(device_id: &str, sequence: u64, payload_hash: &str) -> String {
    let input = format!("{device_id}|{sequence}|{payload_hash}");
    hash_bytes(input.as_bytes())
}

/// Vérifie la monotonie d'une séquence (une transaction plus ancienne ne doit
/// pas être ré-acceptée après une plus récente).
pub fn is_monotonic(previous: Option<u64>, next: u64) -> bool {
    match previous {
        None => true,
        Some(prev) => next > prev,
    }
}

//! Chaîne d'audit immuable (tamper-evident).
//!
//! Principe (Document Maître §37) :
//!   Event N     → hash(Event N)
//!   Event N+1   → hash(Event N+1 + previous_hash)
//!
//! Chaque événement référence le hash de l'événement précédent, ce qui rend
//! toute modification rétroactive détectable.
use super::hash::hash_bytes;

/// Calcule le hash du prochain événement d'audit.
///
/// `payload` est le contenu sérialisé de l'événement courant ;
/// `previous_hash` est le hash hexadécimal de l'événement précédent (ou `None`
/// pour le tout premier événement de la chaîne).
pub fn audit_chain_next_hash(payload: &[u8], previous_hash: Option<&str>) -> String {
    let mut buffer = Vec::with_capacity(payload.len() + 64);
    if let Some(prev) = previous_hash {
        buffer.extend_from_slice(prev.as_bytes());
        buffer.push(b'|');
    }
    buffer.extend_from_slice(payload);
    hash_bytes(&buffer)
}

//! Fonctions de hachage (SHA-256) pour la vérification d'intégrité.
use sha2::{Digest, Sha256};

/// Calcule le SHA-256 d'un contenu et retourne le hash hexadécimal.
pub fn hash_bytes(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

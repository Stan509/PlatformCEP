//! Génération de paires de clés (provisionning des appareils / services).
use ed25519_dalek::SigningKey;
use rand_core::OsRng;

use super::sign::SignKeyPair;

/// Génère une nouvelle paire de clés Ed25519 depuis une source aléatoire OS.
pub fn generate_keypair() -> SignKeyPair {
    let signing = SigningKey::generate(&mut OsRng);
    SignKeyPair::from_seed(signing.to_bytes())
}

//! Signatures Ed25519 pour les transactions hors ligne (APK) et l'audit.
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};

/// Paire de clés : clé de signature (privée) + clé de vérification (publique).
pub struct SignKeyPair {
    signing: SigningKey,
    verifying: VerifyingKey,
}

impl SignKeyPair {
    /// Génère une nouvelle paire depuis une graine de 32 octets.
    pub fn from_seed(seed: [u8; 32]) -> Self {
        let signing = SigningKey::from_bytes(&seed);
        let verifying = signing.verifying_key();
        Self { signing, verifying }
    }

    /// Reconstruit une paire depuis sa clé privée hexadécimale (provisionning).
    /// ⚠️ À utiliser côté serveur uniquement — jamais dans un APK.
    pub fn from_private_hex(private_hex: &str) -> Option<Self> {
        let bytes = hex::decode(private_hex).ok()?;
        let seed: [u8; 32] = bytes.try_into().ok()?;
        Some(Self::from_seed(seed))
    }

    /// Expose la clé publique de vérification (hex).
    pub fn public_hex(&self) -> String {
        hex::encode(self.verifying.to_bytes())
    }

    /// Expose la clé privée (hex) — provisionning sécurisé uniquement.
    pub fn private_hex(&self) -> String {
        hex::encode(self.signing.to_bytes())
    }
}

impl SignKeyPair {
    /// Signe un message ; retourne la signature (hex).
    pub fn sign_hex(&self, message: &[u8]) -> String {
        let sig: Signature = self.signing.sign(message);
        hex::encode(sig.to_bytes())
    }
}

/// Vérifie une signature Ed25519 hexadécimale sur un message.
pub fn verify_bytes(public_hex: &str, message: &[u8], signature_hex: &str) -> bool {
    let Ok(public_bytes) = hex::decode(public_hex) else {
        return false;
    };
    let Ok(sig_bytes) = hex::decode(signature_hex) else {
        return false;
    };
    let Ok(public_bytes): Result<[u8; 32], _> = public_bytes.try_into() else {
        return false;
    };
    let Ok(sig_bytes): Result<[u8; 64], _> = sig_bytes.try_into() else {
        return false;
    };

    let Ok(verifying) = VerifyingKey::from_bytes(&public_bytes) else {
        return false;
    };
    let signature = Signature::from_bytes(&sig_bytes);
    verifying.verify(message, &signature).is_ok()
}

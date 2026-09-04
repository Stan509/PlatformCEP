//! Vérification d'intégrité des fichiers (ex. APK, manifests) via SHA-256.
use std::fmt;
use std::path::Path;

use super::hash::hash_bytes;

/// Erreur de lecture / hachage d'un fichier.
#[derive(Debug)]
pub struct IntegrityError(pub String);

impl fmt::Display for IntegrityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "integrity error: {}", self.0)
    }
}

/// Calcule le SHA-256 d'un fichier à partir de son chemin.
pub fn file_sha256(path: &Path) -> Result<String, IntegrityError> {
    let bytes = std::fs::read(path).map_err(|e| IntegrityError(e.to_string()))?;
    Ok(hash_bytes(&bytes))
}

/// Vérifie qu'un fichier correspond à un hash attendu.
pub fn verify_file(path: &Path, expected_hex: &str) -> Result<bool, IntegrityError> {
    let actual = file_sha256(path)?;
    Ok(actual.eq_ignore_ascii_case(expected_hex))
}

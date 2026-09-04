package sync

// DeviceKeyStore résout la clé publique d'un appareil autorisé.
// En production ce store est alimenté par la PKI / Django (Phase 3),
// jamais par une valeur codée en dur.
type DeviceKeyStore interface {
	PublicKey(deviceID string) (string, bool)
}

// RustValidator valide l'intégrité (hash) et l'authenticité (signature)
// d'une transaction en s'appuyant sur le core Rust (`@cep/crypto-core`).
type RustValidator struct {
	Keys DeviceKeyStore
}

func (v *RustValidator) Validate(tx Transaction) Verdict {
	if tx.TransactionID == "" || tx.DeviceID == "" {
		return Verdict{Accepted: false, Reason: "missing_ids"}
	}
	if tx.PayloadHash == "" || tx.Signature == "" {
		return Verdict{Accepted: false, Reason: "unsigned_or_unhashed"}
	}
	if v.Keys == nil {
		return Verdict{Accepted: false, Reason: "no_key_store"}
	}
	publicHex, ok := v.Keys.PublicKey(tx.DeviceID)
	if !ok {
		return Verdict{Accepted: false, Reason: "unknown_device_key"}
	}

	// 1) Intégrité : le hash client doit correspondre au payload.
	actualHash, err := HashMessage(tx.Payload)
	if err != nil {
		return Verdict{Accepted: false, Reason: "crypto_error"}
	}
	if !equalFold(actualHash, tx.PayloadHash) {
		return Verdict{Accepted: false, Reason: "payload_hash_mismatch"}
	}

	// 2) Authenticité : la signature doit être valide pour la clé publique.
	valid, err := VerifySignature(publicHex, tx.Payload, tx.Signature)
	if err != nil || !valid {
		return Verdict{Accepted: false, Reason: "invalid_signature"}
	}

	return Verdict{Accepted: true}
}

func equalFold(a, b string) bool {
	// Évite une dépendance externe pour une comparaison insensible à la casse.
	if len(a) != len(b) {
		return false
	}
	for i := 0; i < len(a); i++ {
		ca, cb := a[i], b[i]
		if ca >= 'A' && ca <= 'Z' {
			ca += 32
		}
		if cb >= 'A' && cb <= 'Z' {
			cb += 32
		}
		if ca != cb {
			return false
		}
	}
	return true
}

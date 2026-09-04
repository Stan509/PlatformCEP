use crypto_core::{SignKeyPair, audit_chain_next_hash, compute_nonce, generate_keypair, is_monotonic, verify_bytes};

#[test]
fn sign_then_verify_round_trip() {
    let kp = SignKeyPair::from_seed([7u8; 32]);
    let msg = b"offline-transaction-signed";
    let sig = kp.sign_hex(msg);

    assert!(verify_bytes(&kp.public_hex(), msg, &sig), "valid signature must verify");
    assert!(
        !verify_bytes(&kp.public_hex(), b"tampered-message", &sig),
        "signature must not verify against a different message"
    );
}

#[test]
fn audit_chain_is_deterministic_and_tamper_evident() {
    let h0 = audit_chain_next_hash(b"event-1", None);
    let h1 = audit_chain_next_hash(b"event-2", Some(&h0));

    // Déterminisme : même entrée → même hash.
    assert_eq!(h1, audit_chain_next_hash(b"event-2", Some(&h0)));

    // Tamper-evident : modifier un hash amont change le hash aval.
    let tampered = audit_chain_next_hash(b"event-2", Some("tampered-prev-hash"));
    assert_ne!(h1, tampered, "a chain link should be sensitive to its predecessor");
}

#[test]
fn integrity_hash_round_trip() {
    let a = crypto_core::hash_bytes(b"payload");
    let b = crypto_core::hash_bytes(b"payload");
    assert_eq!(a, b);
    assert_ne!(a, crypto_core::hash_bytes(b"other-payload"));
}

#[test]
fn keygen_then_sign_verify_round_trip() {
    let kp = generate_keypair();
    let msg = b"newly-generated-keypair";
    let sig = kp.sign_hex(msg);
    assert!(verify_bytes(&kp.public_hex(), msg, &sig));

    // Reconstruire depuis la clé privée (provisionning).
    let restored = SignKeyPair::from_private_hex(&kp.private_hex()).expect("private hex round-trip");
    assert_eq!(restored.public_hex(), kp.public_hex());
}

#[test]
fn nonce_is_deterministic_and_anti_replay() {
    let a = compute_nonce("DEV-001", 7, "payload-hash");
    let b = compute_nonce("DEV-001", 7, "payload-hash");
    assert_eq!(a, b);
    assert_ne!(a, compute_nonce("DEV-001", 8, "payload-hash"), "séquence différente → nonce différent");

    assert!(is_monotonic(None, 1));
    assert!(is_monotonic(Some(1), 2));
    assert!(!is_monotonic(Some(2), 2), "même séquence ne doit pas être ré-acceptée");
    assert!(!is_monotonic(Some(3), 1), "séquence plus ancienne doit être rejetée");
}

# CEP — PKI (Public Key Infrastructure)

Hiérarchie de confiance (Document Maître §34) :

```text
Root Authority
 ├── CEP Services
 ├── Device CA
 ├── Application Signing
 ├── Election Services
 └── Audit / Verification
```

## Règles

- Toute clé privée est protégée par un mécanisme matériel (HSM / keystore / TPM)
  ou équivalent. **Aucune clé critique dans le code source.**
- Les APK doivent être signés par `Application Signing` — un APK non signé est refusé.
- Chaque appareil est provisionné (`Device CA`) avec une paire de clés unique.
- Les transactions offline sont signées par la clé de l'appareil et vérifiées
  côté serveur (Go `sync-service` → core Rust).

## Provisioning d'un appareil

Le binaire `rust/crypto-core` expose un CLI de génération de clés :

```powershell
cargo run --bin crypto-cli -- release -- keygen
# private=<hex>   → à charger dans un keystore sécurisé de l'appareil
# public=<hex>    → à enregistrer dans le registre d'appareils (serveur)
```

Voir `security/pki/provision-device.ps1` pour un flux automatisé.

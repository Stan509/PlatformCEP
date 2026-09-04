# CEP — Gestion des clés

> ⚠️ **Aucune clé privée réelle dans ce dépôt.** Ce dossier est explicitement
> `.gitignore`-é. Toute clé est générée dans un environnement séparé (vault /
> HSM / keystore matériel) et n'est jamais commitée.

## Règle

- Aucune clé critique dans le code source (Document Maître §34).
- Clés privées protégées par mécanismes matériels ou équivalents.
- `Root Authority` → `CEP Services` / `Device CA` / `Application Signing` /
  `Election Services` / `Audit-Verification`.

## Fichiers autorisés (placeholders uniquement)

- `*.example` : exemples de format, valeurs fictives.
- Aucun `.pem`, `.key`, `.p12`, `.jks` réels.

# CEP — Audit immuable

Règles de journalisation et de vérification (Document Maître §37).

- Chaque événement critique est chaîné : `hash(Event N+1 + previous_hash)`.
- Le journal est stocké séparément et les admins applicatifs ne peuvent pas
  effacer silencieusement les traces.
- Les hashs/signatures sont produits par le core Rust (`rust/crypto-core`).
- Export pour recherche et preuves ; contrôle d'accès restreint (auditeur).

**Ce qui est journalisé** : qui · quoi · quand · depuis quel appareil · résultat ·
identifiant de corrélation · ancienne/nouvelle valeur · raison.

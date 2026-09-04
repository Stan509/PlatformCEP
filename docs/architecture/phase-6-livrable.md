# CEP — Livrable Phase 6 : APK terrain & bureau (Local-First)

> Récapitulatif du travail livré pour la **Phase 6** — dernier volet de l'écosystème.

---

## 1. Moteur local-first partagé (`packages/local-first`)

| Module | Rôle |
|---|---|
| `types.ts` | `LocalTransaction` (id, device, sequence, hash, signature, previousHash, syncStatus) + `Signer` |
| `signer.ts` | `DemoSigner` (HMAC-like via SHA-256 WebCrypto) + `hashObject` — ⚠️ démo, remplacé par Ed25519 (Rust) en prod |
| `queue.ts` | `LocalQueue` — file de transactions signées, chaînée (previousHash), persistée (localStorage), FIFO, `enqueue/pending/markSynced/markError` |

**Invariants local-first (§24-25)** : transactions identifiées, séquencées,
hachées, signées, chaînées (anti-rollback), protégées contre le replay. Le
serveur (Go `sync-service`) vérifie signature + monotonie — il ne fait jamais
confiance au compteur client.

## 2. Design system — hooks

- `useOnline()` : suivi `online`/`offline` (permanent sur APK).

## 3. APK agent de terrain (`apps/field-app`)

- Bandeau **offline/online permanent** + `SyncIndicator` (synced/pending/offline).
- Dashboard : inscrits / synchronisés / en attente, mission active.
- Actions : **nouvelle inscription** (→ transaction signée locale),
  **rechercher**, **synchroniser** (marque SYNCED en ligne), **incident** (→ file).
- Données fictives uniquement.

## 4. APK bureau de vote (`apps/polling-app`)

- Flux ultra-simple (gros boutons, une action principale par écran) :
  `start → verify → authorized / not_authorized → ballot → confirm → recorded`.
- **Bulletin anonyme** : le vote est enregistré dans une transaction signée
  avec `ballotIndex` + `election`, **jamais l'identité de l'électeur**.
- L'écran final affiche un **reçu** (vérification) et « le secret de votre choix
  est préservé » — il ne révèle jamais le choix.
- Bandeau offline/online permanent + **mode formation** (§47) qui reproduit le
  workflow sans toucher aux données réelles.

## 5. Invariants de neutralité & séparation — appliqués

- **Neutralité absolue** : candidates strictement identiques (même taille, même
  présentation), ordre = `ballotIndex` officiel.
- **Séparation identité/vote** : la transaction de vote ne porte aucune identité.
- **Anti-double-vote** : séquence + unicité locale ; côté serveur FIFO + token unique.
- **Aucun texte codé en dur** : i18n (bloc `apps` ajouté aux 3 langues).

## 6. Ce qui reste (qualité, hors périmètre de génération)

- Brancher la signature **Ed25519 réelle** (core Rust) dans le `Signer` des APK.
- Exécution des migrations Django, `pnpm build`, tests de bout en bout.
- Revue de sécurité indépendante obligatoire avant tout déploiement réel (§44, §63).

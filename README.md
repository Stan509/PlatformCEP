# CEP — Écosystème Numérique Électoral (Haïti)

Plateforme monolithique modulaire (monorepo) pour le **Conseil Électoral Provisoire (CEP)** d'Haïti.

> ⚠️ **Document d'architecture / conception.** Ce dépôt est généré à partir de deux documents de référence :
> 1. `CEP_Design_Complet_V1.0.md` — design system & design complet ;
> 2. `CEP_Ecosysteme_Electoral_Document_Maitre_v1.0.md` — architecture, sécurité et spécifications fonctionnelles.
>
> Aucune fonctionnalité électorale (vote, diaspora, publication de résultats, modalités probatoires) n'est juridiquement active
> tant qu'elle n'a pas été validée par les autorités compétentes.

---

## 1. Invariants non négociables

| Invariant | Garantie architecturale |
|---|---|
| **Neutralité absolue** | Aucun élément graphique, couleur, tri ou animation ne favorise un candidat, un parti ou une région. Cartes de candidats strictement identiques. |
| **Séparation stricte identité / vote** | Domains `Identity` / `Eligibility` / `Participation` / `Ballot` strictement découplés. Techniquement impossible de corréler un électeur à son choix. |
| **Local-first & résilience** | Les APK terrain et bureau fonctionnent hors ligne avec files de transactions chiffrées, signées et synchronisées au retour du réseau. |
| **Traçabilité & audit** | Toute action critique produit un journal d'audit immuable (tamper-evident, chaîné par hash). |
| **Configuration dynamique** | Aucune règle électorale (ex. `Sénat = département`) n'est codée en dur. Le moteur électoral est entièrement configurable par le CEP. |

## 2. Stack technique de référence

| Couche | Technologie | Rôle |
|---|---|---|
| Backend principal | Python + Django + DRF | Administration, workflows, registre, gestion électorale, candidats, géographie, API |
| Services réseau / sync | Go (gateway, sync) | API Gateway, synchronisation sécurisée, ingestion haute concurrence |
| Composants critiques / crypto | Rust | Primitives cryptographiques, validation de signatures, intégrité, anti-tampering |
| Frontend / PWA / Admin | TypeScript + React | PWA installable, responsive, i18n (Kreyòl par défaut) |
| Base de données | PostgreSQL | Contraintes strictes, intégrité transactionnelle, chiffrement au repos |

## 3. Structure du dépôt

```
cep-election-platform/
├── apps/
│   ├── public-pwa/        # PWA institutionnelle publique
│   ├── cep-admin/         # Back-office CEP (cockpit institutionnel)
│   ├── field-app/         # APK agents de terrain (local-first)
│   └── polling-app/       # APK bureaux de vote (local-first)
├── backend/
│   └── django-core/       # API + domaine métier (Django/DRF)
├── services/
│   ├── go-gateway/        # API Gateway (Go)
│   └── sync-service/      # Synchronisation sécurisée (Go)
├── rust/
│   └── crypto-core/       # Primitives crypto + audit (Rust)
├── packages/
│   ├── design-system/     # Design tokens + bibliothèque de composants
│   ├── shared-types/      # Types partagés du domaine
│   └── i18n/              # Multilingue Kreyòl / Français / English
├── infrastructure/        # Docker / K8s / Terraform / monitoring
├── security/              # Threat model / policies / audit
├── tests/                 # Unit / integration / e2e / security / offline
└── docs/                  # Architecture / API / operations / training
```

## 4. Phases de livraison

> L'ordre de priorité est défini dans le Document Maître (§59) et le Design Complet (§59).

- **Phase 1 — Design System & Design Tokens** ✅ : tokens CEP, Inter, grille 4px, composants + états, i18n.
- **Phase 2 — Architecture Backend & Modèles (Django/PostgreSQL)** ✅ : 8 domaines, RBAC, séparation identité/vote.
- **Phase 3 — Services sécurité & crypto (Go/Rust)** ✅ : `crypto-core` (Ed25519/SHA-256/audit), `sync-service`, MFA/PKI.
- **Phase 4 — PWA Public** ✅ : accueil, statut, inscription, candidats, résultats, infos — i18n + états.
- **Phase 5 — Admin CEP & Command Center** ✅ : cockpit + command center + gestion (élections, appareils, incidents, audit, releases).
- **Phase 6 — APK agents & bureaux (local-first)** ✅ : `local-first` (file signée) + field-app + polling-app offline-first.

> 🧭 **État global** : voir [`docs/architecture/ecosystem-status.md`](docs/architecture/ecosystem-status.md)
> pour les livrables détaillés, les invariants et les étapes de validation avant production.

## 5. Données de test — DEMO uniquement

Toutes les données sont **fictives**. Aucune donnée citoyenne réelle ne doit être utilisée en développement.

Comptes de démonstration (voir `tests/` et `security/policies` pour la matrice de rôles) :
`test.superadmin`, `test.dev`, `test.cep.admin`, `test.cep.member`, `test.bed`, `test.bec`,
`test.field.agent`, `test.polling.agent`, `test.candidate`, `test.party`, `test.auditor`,
`test.observer`, `test.citizen`, `test.diaspora`.

## 6. Multilinguisme

- Langue par défaut : **Kreyòl ayisyen**.
- Langues disponibles : **Kreyòl → Français → English**.
- Aucun texte UI n'est codé en dur : toutes les chaînes passent par `packages/i18n`.

## 7. Sécurité — points de vigilance

- Aucune clé ou secret réel dans le dépôt (`.gitignore` + `security/keys`).
- Séparation des pouvoirs (RBAC) — le rôle `DEV` **ne donne aucun droit électoral**.
- Le `SUPERADMIN` technique ne peut pas modifier un vote ou un résultat par simple privilège technique.
- Vérifications indépendantes (audit cryptographique, test d'intrusion) requises **avant** tout déploiement réel.

---

*Référentiels : `../CEP_Design_Complet_V1.0.md` et `../CEP_Ecosysteme_Electoral_Document_Maitre_v1.0.md`.*

# CEP — Architecture d'ensemble

## Vue logique (Document Maître §4)

```
                    INTERNET
                       |
                 CDN / WAF
                       |
               Load Balancer
                       |
                 Go API Gateway
                       |
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
  Django Core        Identity/IAM       Election Services
       |                   |                   |
       +-------------------+-------------------+
                       |
                PostgreSQL Cluster
                       |
          +------------+------------+
          |            |            |
          v            v            v
      Audit         Object       Reporting
      Ledger        Storage      / Analytics
                       |
              Secure Sync Gateway
                       |
         +-------------+-------------+
         |                           |
         v                           v
   Field APK                    Polling APK
   Local-first                  Local-first
```

## Séparation stricte des domaines (invariant)

| Domaine | Contenu | Jamais relié à |
|---|---|---|
| Identity | Référence électorale minimale | Vote |
| Eligibility | Statut d'éligibilité | Vote |
| Participation | `ParticipationToken` (droit de voter) | Choix |
| Ballot | Bulletin anonyme | Identité |

Conceptuellement : `Identity → Eligibility → ParticipationToken → Participation → Ballot anonyme`.
**Aucun administrateur ne peut relier identité ↔ participation ↔ choix.**

## Flux local-first (APK)

```
LOCAL  →  Transaction signée  →  File chiffrée  →  Réseau disponible
      →  Gateway sécurisée  →  Validation serveur  →  ACK  →  Synchronisé
```

Le serveur ne fait **jamais** confiance au compteur du client (anti-replay/rollback).

## Côté crypto

Les primitives de signature (Ed25519), d'intégrité (SHA-256) et la chaîne
d'audit immuable vivent dans `rust/crypto-core`, utilisées par Go (sync/gateway)
et les APK. Les règles électorales sont configurables (jamais codées en dur).

## Modules du système

Public PWA · Registre · Géographie · Gestion électorale · Candidats · Opérations
· Tabulation · Incidents · Assets · Formation · Audit · Release Management.

> **Ce document est un plan d'architecture.** Les implémentations détaillées par
> module sont livrées phase par phase (voir `README.md` racine).

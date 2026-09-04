# CEP — Opérations

## Runbook

- Franchir les étapes critiques avec double approbation et journalisation.
- Toute opération irréversible exige : confirmation → résumé → 2e confirmation → audit.
- Ne jamais présenter une donnée provisoire comme définitive.

## Disaster Recovery (Document Maître §39)

`Primary → replication → Secondary → Immutable Backups`.

Tester régulièrement : restauration, perte serveur/réseau/région, corruption,
restauration APK, récupération des transactions offline.

## Monitoring

Disponibilité, latence, erreurs, synchronisation, appareils offline, tentatives
de connexion, signatures invalides, transactions dupliquées, versions APK,
incidents. Aucune donnée électorale sensible dans un dashboard non protégé.

## Command Center

Suivi temps réel : bureaux 🟢/🟡/🔴, appareils online/offline, sync ok/en attente/
erreur, PV reçus/validés, incidents critiques/élevés/normaux. Carte d'Haïti.

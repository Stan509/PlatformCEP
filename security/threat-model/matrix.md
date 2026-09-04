# CEP — Modèle de menaces (extrait)

Adversaires et contrôles associés. Chaque entrée doit :
probabilité · impact · contrôle · test · propriétaire · statut.

| # | Adversaire / menace | Impact | Contrôle principal | Test |
|---|---|---|---|---|
| 1 | Utilisateur malveillant | Élevé | RBAC + validation d'entrée | SAST, DAST |
| 2 | Agent compromis | Critique | Anti-tampering, device identity, revoke | Tests offline |
| 3 | Appareil volé | Critique | Device binding + re-auth + remote revoke | Tests appareils |
| 4 | Appareil modifié | Critique | Intégrité APK, code signé, keystore | Anti-tampering |
| 5 | Développeur malveillant | Critique | Séparation des pouvoirs, PR review, audit | RBAC tests |
| 6 | Administrateur compromis | Critique | MFA, sessions courtes, double approbation | RBAC/ABAC |
| 7 | Attaquant externe | Élevé | WAF, TLS, rate limiting, CSP | Pentest |
| 8 | Malware Android | Moyen | Stockage chiffré, keystore, anti-débogage | Mobile security |
| 9 | Attaque réseau | Élevé | TLS 1.3+ (mTLS interne), HSTS | DAST |
| 10 | Attaque API | Élevé | Rate limit, validation, auth fort | API tests |
| 11 | Compte CEP compromis | Critique | MFA, passkey, détection d'anomalies | RBAC/ABAC |
| 12 | Manipulation des résultats | Critique | Approbations multiples, audit immuable | Offline/PV |
| 13 | DDoS | Moyen | Load balancer, WAF, auto-scaling | — |
| 14 | Corrélation identité/vote | Critique | Séparation stricte des domaines | Revue crypto |

> Fichier de travail détaillé (`threat-model/matrix.md`) à compléter lors de la
> revue de sécurité (Phase 14 du Document Maître).

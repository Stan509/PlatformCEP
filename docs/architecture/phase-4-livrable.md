# CEP — Livrable Phase 4 : PWA Public

> Récapitulatif du travail livré pour la **Phase 4** : PWA publique institutionnelle.

---

## 1. Routage & données

- `src/router.tsx` : routage par hash (`#/route`), routes `home / check-status /
  register / candidates / results / info / diaspora / help`.
- `src/lib/mockData.ts` : données **fictives** (élections, candidats, partis, résultats) —
  aucune donnée citoyenne réelle.
- `src/lib/api.ts` : client API simulé (latence réseau) — remplacé par des appels
  `fetch` vers Django en production.
- `src/hooks/useAsync.ts` : hook d'état asynchrone encapsulant les états
  **loading / success / empty / error** (spec §40-42).

## 2. Composants publics

- `components/public/Header.tsx` : logo (placeholder), navigation, sélecteur de langue.
- `components/public/Footer.tsx` : liens institutionnels, langue.
- Nouveau dans le design system : `StateView` (loading / error / empty / offline) réutilisable.

## 3. Écrans

| Écran | Fichier | Points clés |
|---|---|---|
| Accueil | `pages/Home.tsx` | Hero institutionnel, cycle électoral, élections (cartes identiques — neutralité), teasers résultats/infos |
| Vérifier mon statut | `pages/CheckStatus.tsx` | 3 cas : enregistré (badge vert) / non trouvé (neutre) / problème (code support) — minimisation |
| Inscription | `pages/Register.tsx` | Wizard 6 étapes, une action principale par étape, géographie configurable, référence ≠ preuve de vote |
| Candidats | `pages/Candidates.tsx` | Neutre : cartes strictement identiques, ordre officiel (`ballotIndex`), états loading/error/empty |
| Résultats | `pages/Results.tsx` | Indicateurs de confiance (provisoire/partiel/consolidé/définitif), état vide par défaut |
| Informations / Diaspora / Aide | `pages/Info.tsx` | États vides, modalités diaspora activables par configuration |

## 4. Invariants respectés

- **Neutralité absolue** : cartes identiques, aucun classement visuel.
- **Aucun texte codé en dur** : toutes les chaînes passent par i18n (HT/FR/EN).
- **États UI obligatoires** : chaque page gère loading / error / empty ; offline pour les APK.
- **Minimisation / privacy by design** : le statut n'expose que les infos nécessaires ;
  la référence d'inscription n'est pas une preuve de vote.

## 5. Ce qui reste

- **Phase 5** : Admin CEP & Command Center (cockpit, gestion, monitoring temps réel).
- **Phase 6** : APK terrain & bureau — local-first (files chiffrées/signées, anti-double-vote).

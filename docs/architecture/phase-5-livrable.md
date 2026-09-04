# CEP — Livrable Phase 5 : Admin CEP & Command Center

> Récapitulatif du travail livré pour la **Phase 5**.

---

## 1. Structure de l'admin (`apps/cep-admin`)

- `src/router.tsx` : routage par hash (`dashboard / command-center / elections /
  devices / incidents / audit / releases / settings`).
- `src/lib/mockData.ts` : données admin **fictives** (élections, appareils,
  incidents, audit, releases, état du command center).
- `src/lib/api.ts` : client API simulé (démo).
- `components/admin/Sidebar.tsx` + `Topbar.tsx` : cockpit institutionnel
  (nav §19, élection active, état système, langue).

## 2. Écrans

| Écran | Fichier | Points clés |
|---|---|---|
| Tableau de bord | `pages/Dashboard.tsx` | KPIs, table des élections, états loading/empty/error |
| Command Center | `pages/CommandCenter.tsx` | Bureaux 🟢/🟡/🔴, appareils online/offline, sync, PV reçus/validés, carte (placeholder) |
| Élections | `pages/Elections.tsx` | Tableau, statuts, transitions critiques |
| Appareils | `pages/Devices.tsx` | statut, dernière connexion/sync, actions suspend/révoquer |
| Incidents | `pages/Incidents.tsx` | catégorie, sévérité, statut, workflow |
| Audit | `pages/Audit.tsx` | journal immuable (acteur, action, objet, corrélation) |
| Versions APK | `pages/Releases.tsx` | build, hash, signature, publication privée (§32-33) |
| Configuration | `pages/Settings.tsx` | moteur configurable + invariants |

## 3. Design system étendu

- Hook partagé `useAsync` (loading / success / empty / error + `reload`) exporté
  depuis `@cep/design-system`.

## 4. Invariants

- Aucun texte codé en dur : tout passe par i18n (bloc `admin` ajouté aux 3 langues).
- Command center : couleurs sémantiques uniquement (juxtaposées à un libellé).
- État systématique loading/empty/error sur chaque tableau.
- Révoquer/suspendre des appareils visibles (RBAC en production).

## 5. Ce qui reste

- **Phase 6** : APK terrain & bureau — local-first (files chiffrées/signées,
  indicateur offline/online permanent, anti-double-vote).

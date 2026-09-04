# CEP — Politique RBAC

Le système implémente RBAC + règles contextuelles (Document Maître §6).

## Rôles

| Rôle | Droits électoraux | Accès registre | Accès résultats |
|---|---|---|---|
| SUPERADMIN | ❌ (aucun droit électoral par privilège technique) | — | read-only |
| DEV | ❌ **aucun** | ❌ | ❌ |
| ADMIN_CEP | ✅ (procedural) | gest. | gest. publication |
| MEMBRE_CEP | ✅ (lecture) | lecture | lecture |
| RESPONSABLE ÉLECTORAL | ✅ | gest. | gest. |
| BED / BEC | ✅ (opérations) | opérations | — |
| RESPONSABLE CIV | ✅ | opérations | — |
| AGENT TERRAIN | ✅ (inscription) | opérations | — |
| AGENT BUREAU | ✅ (vote) | vérification | — |
| SUPERVISEUR | ✅ | gest. | lecture |
| AUDITEUR | ❌ (lecture) | **jamais le choix** | read-only |
| OBSERVATEUR | lecture publique | — | read-only |
| PARTI / CANDIDAT | données propres | ❌ | agrégé public |
| CITOYEN / DIASPORA | données propres | — | public |

## Règles fortes

- Le rôle **DEV** ne donne **aucun droit électoral**.
- Le **SUPERADMIN** technique ne peut pas modifier un vote ou un résultat.
- Un accès au registre électoral **ne permet jamais** de déduire un choix individuel.
- Les opérations critiques (publier un résultat définitif, ouvrir/fermer un scrutin,
  modifier une candidature validée) exigent **plusieurs approbations**.
- L'auditeur ne voit jamais d'informations permettant de reconstruire le vote individuel.

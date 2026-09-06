/**
 * CEP ADMIN V3 — Permission Engine (resource.action)
 * Granular RBAC definitions for Provisional Electoral Council (CEP) Administration.
 */

export type PermissionCode =
  // Dashboard & Scope
  | 'dashboard.view'
  | 'myScope.view'
  // Elections
  | 'election.view'
  | 'election.create'
  | 'election.update'
  | 'election.open'
  | 'election.close'
  | 'election.archive'
  // Electoral Registry & Eligibility
  | 'elector.view'
  | 'elector.search'
  | 'elector.approve'
  | 'elector.reject'
  | 'elector.suspend'
  | 'elector.assign'
  // Candidates
  | 'candidate.view'
  | 'candidate.create'
  | 'candidate.update'
  | 'candidate.approve'
  | 'candidate.reject'
  | 'candidate.suspend'
  // Political Parties
  | 'party.view'
  | 'party.create'
  | 'party.update'
  | 'party.approve'
  | 'party.reject'
  // Mandataires
  | 'mandate.view'
  | 'mandate.create'
  | 'mandate.approve'
  | 'mandate.reject'
  | 'mandate.activate'
  | 'mandate.suspend'
  | 'mandate.revoke'
  // Polling Stations & Centers
  | 'station.view'
  | 'station.create'
  | 'station.update'
  | 'station.assign'
  | 'station.transfer'
  // Devices (BIOPADs)
  | 'device.view'
  | 'device.register'
  | 'device.activate'
  | 'device.suspend'
  | 'device.revoke'
  // Incidents
  | 'incident.view'
  | 'incident.create'
  | 'incident.assign'
  | 'incident.resolve'
  | 'incident.close'
  // Procès-Verbaux (PV)
  | 'pv.view'
  | 'pv.review'
  | 'pv.validate'
  | 'pv.reject'
  // Vote Count & Tally
  | 'count.view'
  | 'count.enter'
  | 'count.review'
  | 'count.validate'
  // Results
  | 'result.view'
  | 'result.publish'
  | 'result.correct'
  // Audit & Security
  | 'audit.view'
  | 'audit.export'
  // User & Access Management
  | 'user.view'
  | 'user.create'
  | 'user.update'
  | 'user.suspend'
  | 'user.permissions.manage'
  // Superadmin Emergency Bypass
  | 'system.superadmin';

export interface PermissionDefinition {
  code: PermissionCode;
  domain: string;
  label: string;
  description: string;
}

export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  // Dashboard
  { code: 'dashboard.view', domain: 'ACCUEIL', label: 'Consulter le Tableau de bord', description: 'Accès aux widgets de synthèse du cockpit' },
  { code: 'myScope.view', domain: 'ACCUEIL', label: 'Consulter Mon Périmètre', description: 'Accès au poste de travail individuel et autorisations' },

  // Elections
  { code: 'election.view', domain: 'ÉLECTIONS', label: 'Consulter les Élections', description: 'Affichage des scrutins et calendriers électoraux' },
  { code: 'election.create', domain: 'ÉLECTIONS', label: 'Créer une Élection', description: 'Création d\'un nouveau scrutin électoral' },
  { code: 'election.update', domain: 'ÉLECTIONS', label: 'Modifier la Configuration', description: 'Édition des règles et modalités de vote' },
  { code: 'election.open', domain: 'ÉLECTIONS', label: 'Ouvrir un Scrutin', description: 'Passage d\'une élection en phase ouverte' },
  { code: 'election.close', domain: 'ÉLECTIONS', label: 'Clôturer un Scrutin', description: 'Clôture officielle de la période de vote' },
  { code: 'election.archive', domain: 'ÉLECTIONS', label: 'Archiver une Élection', description: 'Archivage légal d\'un scrutin terminé' },

  // Electoral Registry
  { code: 'elector.view', domain: 'REGISTRE ÉLECTORAL', label: 'Consulter le Registre Électoral', description: 'Affichage de la liste et fiches d\'électeurs' },
  { code: 'elector.search', domain: 'REGISTRE ÉLECTORAL', label: 'Rechercher un Électeur', description: 'Recherche par CIN/NIF/Nom/Passeport' },
  { code: 'elector.approve', domain: 'REGISTRE ÉLECTORAL', label: 'Valider une Inscription', description: 'Homologation d\'une demande d\'inscription' },
  { code: 'elector.reject', domain: 'REGISTRE ÉLECTORAL', label: 'Rejeter une Inscription', description: 'Rejet motivé d\'une inscription' },
  { code: 'elector.suspend', domain: 'REGISTRE ÉLECTORAL', label: 'Suspendre un Électeur', description: 'Suspension temporaire du droit de vote' },
  { code: 'elector.assign', domain: 'REGISTRE ÉLECTORAL', label: 'Gérer l\'Affectation Électorale', description: 'Transfert et affectation de bureau (FIXED, NOMADIC, ONLINE-Z)' },

  // Candidates
  { code: 'candidate.view', domain: 'CANDIDATURES', label: 'Consulter les Candidats', description: 'Affichage des fiches de candidats et programmes' },
  { code: 'candidate.create', domain: 'CANDIDATURES', label: 'Enregistrer un Candidat', description: 'Saisie d\'un nouveau dossier de candidature' },
  { code: 'candidate.update', domain: 'CANDIDATURES', label: 'Éditer un Candidat', description: 'Modification d\'un dossier de candidat' },
  { code: 'candidate.approve', domain: 'CANDIDATURES', label: 'Homologuer un Candidat', description: 'Approbation officielle d\'une candidature' },
  { code: 'candidate.reject', domain: 'CANDIDATURES', label: 'Rejeter un Candidat', description: 'Rejet formel d\'une candidature' },
  { code: 'candidate.suspend', domain: 'CANDIDATURES', label: 'Suspendre un Candidat', description: 'Suspension administrative d\'un candidat' },

  // Political Parties
  { code: 'party.view', domain: 'PARTIS POLITIQUES', label: 'Consulter les Partis Politiques', description: 'Affichage du registre légal des partis' },
  { code: 'party.create', domain: 'PARTIS POLITIQUES', label: 'Enregistrer un Parti', description: 'Inscription formelle d\'un parti politique' },
  { code: 'party.update', domain: 'PARTIS POLITIQUES', label: 'Modifier un Parti', description: 'Édition des informations et représentants' },
  { code: 'party.approve', domain: 'PARTIS POLITIQUES', label: 'Reconnaître Légalement un Parti', description: 'Homologation CEP d\'un parti politique' },
  { code: 'party.reject', domain: 'PARTIS POLITIQUES', label: 'Suspendre / Rejeter un Parti', description: 'Suspension du statut légal d\'un parti' },

  // Mandataires
  { code: 'mandate.view', domain: 'MANDATAIRES', label: 'Consulter les Mandataires', description: 'Affichage des accréditations de mandataires' },
  { code: 'mandate.create', domain: 'MANDATAIRES', label: 'Créer une Demande de Mandat', description: 'Soumission d\'un mandat d\'accréditation' },
  { code: 'mandate.approve', domain: 'MANDATAIRES', label: 'Approuver une Accréditation', description: 'Validation administrative du mandat' },
  { code: 'mandate.reject', domain: 'MANDATAIRES', label: 'Rejeter un Mandat', description: 'Refus motivé d\'une accréditation' },
  { code: 'mandate.activate', domain: 'MANDATAIRES', label: 'Activer un Mandat', description: 'Passage du mandat au statut actif' },
  { code: 'mandate.suspend', domain: 'MANDATAIRES', label: 'Suspendre un Mandat', description: 'Suspension provisoire des droits du mandataire' },
  { code: 'mandate.revoke', domain: 'MANDATAIRES', label: 'Révoquer un Mandat', description: 'Révocation définitive de l\'accréditation' },

  // Polling Stations
  { code: 'station.view', domain: 'OPÉRATIONS TERRAIN', label: 'Consulter les Bureaux de Vote', description: 'Visualisation des centres et bureaux' },
  { code: 'station.create', domain: 'OPÉRATIONS TERRAIN', label: 'Créer un Bureau de Vote', description: 'Ajout d\'une station physique ou virtuelle' },
  { code: 'station.update', domain: 'OPÉRATIONS TERRAIN', label: 'Modifier un Bureau', description: 'Édition de l\'adresse, capacité ou zone' },
  { code: 'station.assign', domain: 'OPÉRATIONS TERRAIN', label: 'Affecter des Électeurs au Bureau', description: 'Rattachement de la liste électorale' },
  { code: 'station.transfer', domain: 'OPÉRATIONS TERRAIN', label: 'Transférer des Stations', description: 'Modification de la géolocalisation nomade' },

  // Devices
  { code: 'device.view', domain: 'OPÉRATIONS TERRAIN', label: 'Consulter les Appareils BIOPAD', description: 'Flotte d\'appareils et statut de connexion' },
  { code: 'device.register', domain: 'OPÉRATIONS TERRAIN', label: 'Enrôler un Appareil', description: 'Enregistrement cryptographique d\'un BIOPAD' },
  { code: 'device.activate', domain: 'OPÉRATIONS TERRAIN', label: 'Activer un Appareil', description: 'Autorisation mTLS d\'utilisation terrain' },
  { code: 'device.suspend', domain: 'OPÉRATIONS TERRAIN', label: 'Suspendre un Appareil', description: 'Suspension temporaire pour contrôle' },
  { code: 'device.revoke', domain: 'OPÉRATIONS TERRAIN', label: 'Révoquer un Appareil', description: 'Révocation mTLS d\'urgence d\'un BIOPAD' },

  // Incidents
  { code: 'incident.view', domain: 'INCIDENTS', label: 'Consulter les Incidents', description: 'Alertes terrain et signalements' },
  { code: 'incident.create', domain: 'INCIDENTS', label: 'Déclarer un Incident', description: 'Saisie d\'un nouvel incident opérationnel' },
  { code: 'incident.assign', domain: 'INCIDENTS', label: 'Assigner un Incident', description: 'Attribution à un responsable d\'enquête' },
  { code: 'incident.resolve', domain: 'INCIDENTS', label: 'Résoudre un Incident', description: 'Remédiation et clôture technique' },
  { code: 'incident.close', domain: 'INCIDENTS', label: 'Fermer un Incident', description: 'Validation finale de la résolution' },

  // Procès-Verbaux
  { code: 'pv.view', domain: 'DÉPOUILLEMENT', label: 'Consulter les Procès-Verbaux', description: 'Affichage des PV reçus et signatures' },
  { code: 'pv.review', domain: 'DÉPOUILLEMENT', label: 'Examiner les PV', description: 'Contrôle de conformité et des scellés' },
  { code: 'pv.validate', domain: 'DÉPOUILLEMENT', label: 'Valider un Procès-Verbal', description: 'Homologation officielle du PV pour la tabulation' },
  { code: 'pv.reject', domain: 'DÉPOUILLEMENT', label: 'Rejeter un PV', description: 'Rejet d\'un PV pour anomalie ou litige' },

  // Count & Tally
  { code: 'count.view', domain: 'DÉPOUILLEMENT', label: 'Consulter le Comptage', description: 'Décompte des bulletins et abstentions' },
  { code: 'count.enter', domain: 'DÉPOUILLEMENT', label: 'Saisir un Décompte', description: 'Saisie des chiffres de dépouillement' },
  { code: 'count.review', domain: 'DÉPOUILLEMENT', label: 'Contrôle Contradictoire', description: 'Vérification du comptage mandataire vs officiel' },
  { code: 'count.validate', domain: 'DÉPOUILLEMENT', label: 'Valider le Décompte', description: 'Validation définitive du décompte d\'un bureau' },

  // Results
  { code: 'result.view', domain: 'RÉSULTATS', label: 'Consulter les Résultats', description: 'Résultats bruts, provisoires et consolidés' },
  { code: 'result.publish', domain: 'RÉSULTATS', label: 'Publier les Résultats', description: 'Publication légale officielle par le CEP' },
  { code: 'result.correct', domain: 'RÉSULTATS', label: 'Corriger un Résultat', description: 'Correction motivée sur décision du CEP' },

  // Audit
  { code: 'audit.view', domain: 'AUDIT & SÉCURITÉ', label: 'Consulter la Piste d\'Audit', description: 'Journal immuable des événements et hashes' },
  { code: 'audit.export', domain: 'AUDIT & SÉCURITÉ', label: 'Exporter les Journaux', description: 'Exportation signée de la piste d\'audit' },

  // Users & RBAC
  { code: 'user.view', domain: 'ADMINISTRATION', label: 'Consulter les Utilisateurs', description: 'Liste des comptes administrateurs et rôles' },
  { code: 'user.create', domain: 'ADMINISTRATION', label: 'Créer un Utilisateur', description: 'Création d\'un compte administrateur CEP' },
  { code: 'user.update', domain: 'ADMINISTRATION', label: 'Modifier un Utilisateur', description: 'Mise à jour des coordonnées et statuts' },
  { code: 'user.suspend', domain: 'ADMINISTRATION', label: 'Suspendre un Utilisateur', description: 'Verrouillage immédiat d\'un compte' },
  { code: 'user.permissions.manage', domain: 'ADMINISTRATION', label: 'Gérer les Permissions & Scopes', description: 'Attribution fine des rôles, perms et scopes' },

  // Superadmin
  { code: 'system.superadmin', domain: 'SYSTÈME', label: 'Superadministration Système', description: 'Autorisation de niveau administrateur système' },
];

/**
 * Checks if a user possesses the requested permission(s).
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermissions?: PermissionCode | PermissionCode[]
): boolean {
  if (!requiredPermissions) return true;
  if (!userPermissions || userPermissions.length === 0) return false;

  // Superadmin emergency permission check
  if (userPermissions.includes('system.superadmin')) return true;

  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  return required.some((perm) => userPermissions.includes(perm));
}

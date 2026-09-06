/**
 * Données ADMIN CEP — Mode Institutionnel Sérieux.
 * Statistiques réelles d'Haïti : ~5.84M d'électeurs, 10 départements, 145 communes.
 */

export interface AdminElection {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string; // 'statusDraft' | 'statusPublished' | 'statusOpen' | 'statusClosed' | 'statusTabulation' | 'statusFinal'
  candidates: number;
  stations: number;
  lastModified: string;
}

export interface AdminCandidate {
  id: string;
  number: string; // Numéro officiel sur le bulletin (ex: #14, #07)
  name: string;
  party: string;
  partyId?: string;
  post: string; // 'Président', 'Sénateur', 'Député', 'Maire', 'ASEC/DSEC'
  territory: string;
  department?: string;
  commune?: string;
  sectionCommunale?: string;
  slogan: string;
  policySummary: string; // Résumé politique générale & programme
  photoUrl: string;
  electionId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logoUrl: string;
  leaderName: string;
  legalStatus: 'RECOGNIZED' | 'PENDING' | 'SUSPENDED';
  address: string;
  mandatairesCount: number;
  candidatesCount: number;
}

export type MandateModality = 'FIXED' | 'NOMADIC' | 'ONLINE' | 'BOTH';
export type MandateStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
export type MandateEntityType = 'CANDIDATE' | 'PARTY';

export interface MandatePermissions {
  canViewParticipation: boolean;
  canViewResults: boolean;
  canReportIncident: boolean;
  canSubmitObservation: boolean;
  canViewPv: boolean;
  canSignPv: boolean;
  canTallyVotes: boolean;
}

export interface StationScopeItem {
  code: string;
  name: string;
  type: 'FIXED' | 'NOMADIC' | 'VIRTUAL';
  location: string;
  electorsCount: number;
  participantsCount: number;
  incidentsCount: number;
  pvStatus: 'AVAILABLE' | 'PENDING' | 'NOT_STARTED';
  geofenceStatus?: 'VALID' | 'INVALID' | 'UNKNOWN' | 'LOW_ACCURACY' | 'SUSPICIOUS';
  devices?: { id: string; status: 'OPERATIONAL' | 'OFFLINE' | 'ALERT' }[];
}

export interface ElectoralMandate {
  id: string;
  mandataireId: string;
  fullName: string;
  phone: string;
  email: string;
  entityType: MandateEntityType;
  representedEntityId: string;
  representedEntityName: string;
  representedEntityPhotoOrLogo?: string;
  electionId: string;
  electionName: string;
  electionType: string;
  department: string;
  commune: string;
  electoralZone: string;
  authorizedStations: StationScopeItem[];
  modalities: MandateModality[];
  permissions: MandatePermissions;
  validFrom: string;
  validTo: string;
  status: MandateStatus;
}

export interface ElectoralMandataire {
  id: string;
  fullName: string;
  partyId: string;
  partyName: string;
  candidateId?: string;
  candidateName?: string;
  department: string;
  commune: string;
  pollingStationCode: string;
  pollingStationName: string;
  phone: string;
  status: 'ACTIVE' | 'REVOKED';
  remarksCount: number;
  mandateId?: string;
}

export interface MandataireRemark {
  id: string;
  mandataireId: string;
  mandataireName: string;
  partyName: string;
  pollingStationCode: string;
  category: 'REGULARITY' | 'ANOMALY' | 'DISPUTE' | 'TALLY_CHECK';
  title: string;
  description: string;
  tallyVotes: number;
  reportedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED';
}


export interface ApkAgentUser {
  id: string;
  type: 'FIELD' | 'POLLING_STATION';
  agentCode: string;
  fullName: string;
  phone: string;
  department: string;
  commune: string;
  coveredSections?: string; // For field agents
  pollingStationCode?: string; // For polling agents
  pollingStationName?: string;
  address?: string; // Physical address
  deviceId?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface UserScope {
  departments?: string[];
  communes?: string[];
  elections?: string[];
  stationCodes?: string[];
  partyIds?: string[];
  candidateIds?: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'ADMIN_CEP' | 'MEMBER_CEP' | 'CANDIDATE' | 'PARTY' | 'MANDATAIRE' | 'APK_AGENT';
  roleTitle: string;
  permissions?: string[];
  scope?: UserScope;
  candidateId?: string;
  partyId?: string;
  mandataireId?: string;
  agentId?: string;
  department?: string;
  commune?: string;
  pollingStationCode?: string;
}

export interface AdminDevice {
  id: string;
  deviceId: string;
  version: string;
  assignedUser: string;
  department: string;
  commune: string;
  pollingStationCode: string;
  encryption: string; // ex: 'AES-256-GCM (Hardware TPM 2.0 Enclave)'
  certExpiry: string;
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  compromised: boolean;
  compromiseReason?: string;
  tamperCount: number;
  lastSeen: string;
  lastSync: string;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  category: 'SUPERVISION' | 'ELECTIONS' | 'PARTIES_CANDIDATES' | 'OPERATIONS' | 'AUDIT' | 'USERS';
  description: string;
}

export interface AdminRole {
  id: string;
  code: string;
  title: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  role: string; // 'ADMIN_CEP' | 'MEMBER_CEP' | 'BED_SUPERVISOR' | 'BEC_SUPERVISOR' | 'AUDITOR' | 'OPERATOR' | custom role code
  roleTitle: string;
  department?: string;
  commune?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  mTLSVerified: boolean;
  lastActive: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { id: 'PERM_DASHBOARD_VIEW', name: 'Supervision & Command Center', category: 'SUPERVISION', description: 'Accès en lecture seule au Tableau de bord et au Command Center' },
  { id: 'PERM_ELECTIONS_MANAGE', name: 'Gestion des Scrutins Électoraux', category: 'ELECTIONS', description: 'Création, modification et configuration des modalités de vote' },
  { id: 'PERM_PARTIES_VIEW', name: 'Consultation Partis Politiques', category: 'PARTIES_CANDIDATES', description: 'Lecture seule du registre légal des partis et mandataires' },
  { id: 'PERM_PARTIES_MANAGE', name: 'Reconnaissance Partis Politiques', category: 'PARTIES_CANDIDATES', description: 'Ajout, modification et suspension des partis politiques' },
  { id: 'PERM_CANDIDATES_MANAGE', name: 'Gestion & Homologation Candidats', category: 'PARTIES_CANDIDATES', description: 'Approbation, rejet et édition des fiches de candidats' },
  { id: 'PERM_PV_VALIDATE', name: 'Validation & Homologation PV', category: 'OPERATIONS', description: 'Saisie, vérification et validation officielle des Procès-Verbaux' },
  { id: 'PERM_INCIDENTS_MANAGE', name: 'Gestion des Incidents & Alertes', category: 'OPERATIONS', description: 'Modération, clôture et investigation des incidents de terrain' },
  { id: 'PERM_DEVICES_MANAGE', name: 'Gestion des Appareils BIOPAD', category: 'OPERATIONS', description: 'Enrôlement, suspension, révocation mTLS et verrouillage à distance' },
  { id: 'PERM_APK_AGENTS_MANAGE', name: 'Gestion des Utilisateurs APK', category: 'USERS', description: 'Création et gestion des identifiants d\'agents terrain et bureau de vote' },
  { id: 'PERM_AUDIT_LOGS_VIEW', name: 'Audit & Journaux Cryptographiques', category: 'AUDIT', description: 'Inspection de la piste d\'audit SHA-256 et vérification des hashs' },
  { id: 'PERM_USERS_ROLES_MANAGE', name: 'Administration Utilisateurs & Rôles (RBAC)', category: 'USERS', description: 'Création, attribution et modification des rôles et autorisations' },
];

export const INITIAL_ADMIN_ROLES: AdminRole[] = [
  {
    id: 'role-admin-cep',
    code: 'ADMIN_CEP',
    title: 'Président & Conseillers CEP',
    description: 'Accès institutionnel souverain total. Signature des décrets et validation ultime des résultats.',
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    isSystem: true,
  },
  {
    id: 'role-bed-supervisor',
    code: 'BED_SUPERVISOR',
    title: 'Directeur BED (Département)',
    description: 'Supervision départementale, validation des PV locaux et contrôle de la flotte d\'appareils BIOPAD.',
    permissions: ['PERM_DASHBOARD_VIEW', 'PERM_PARTIES_VIEW', 'PERM_CANDIDATES_MANAGE', 'PERM_PV_VALIDATE', 'PERM_INCIDENTS_MANAGE', 'PERM_DEVICES_MANAGE', 'PERM_APK_AGENTS_MANAGE'],
    isSystem: true,
  },
  {
    id: 'role-bec-supervisor',
    code: 'BEC_SUPERVISOR',
    title: 'Superviseur BEC (Commune)',
    description: 'Supervision communale, déploiement des agents de bureau et remontée des procès-verbaux.',
    permissions: ['PERM_DASHBOARD_VIEW', 'PERM_PV_VALIDATE', 'PERM_INCIDENTS_MANAGE', 'PERM_APK_AGENTS_MANAGE'],
    isSystem: true,
  },
  {
    id: 'role-auditor',
    code: 'AUDITOR',
    title: 'Auditeur Indépendant / Observateur',
    description: 'Lecture seule absolue sur le Command Center, les registres et la piste d\'audit cryptographique.',
    permissions: ['PERM_DASHBOARD_VIEW', 'PERM_PARTIES_VIEW', 'PERM_AUDIT_LOGS_VIEW'],
    isSystem: true,
  },
  {
    id: 'role-operator',
    code: 'OPERATOR',
    title: 'Opérateur de Saisie & Support',
    description: 'Saisie technique des procès-verbaux et assistance opérationnelle aux bureaux de vote.',
    permissions: ['PERM_DASHBOARD_VIEW', 'PERM_PV_VALIDATE', 'PERM_INCIDENTS_MANAGE'],
    isSystem: true,
  },
];


export interface AdminIncident {
  id: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  reportedAt: string;
}

export interface AdminAuditEvent {
  id: string;
  actor: string;
  action: string;
  object: string;
  outcome: string;
  correlationId: string;
  occurredAt: string;
}

export interface AdminRelease {
  id: string;
  version: string;
  build: string;
  hash: string;
  signature: string;
  status: 'SIGNED' | 'PUBLISHED' | 'REVOKED';
}

export const ADMIN_KPIS = [
  { key: 'electors', value: '5 842 190' },
  { key: 'candidates', value: '184' },
  { key: 'stations', value: '13 850' },
  { key: 'agents', value: '24 500' },
  { key: 'devices', value: '7 420' },
  { key: 'sync', value: '99,4 %' },
  { key: 'incidents', value: '4' },
  { key: 'security', value: '1 ALERTE' },
] as const;

export const ADMIN_ELECTIONS: AdminElection[] = [
  { id: 'e1', name: 'Élections Générales d\'Haïti 2026', type: 'generale_2026', date: '2026-11-15', status: 'statusOpen', candidates: 184, stations: 13850, lastModified: '2026-09-05T02:00' },
  { id: 'e2', name: 'Élection Municipale et Locales 2024 (Archivée)', type: 'local', date: '2024-01-15', status: 'statusFinal', candidates: 412, stations: 8940, lastModified: '2024-01-20T18:00' },
];

export const POLITICAL_PARTIES: PoliticalParty[] = [
  {
    id: 'p1',
    name: 'Pitit Desalin',
    acronym: 'PITIT',
    logoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80',
    leaderName: 'Jean-Charles Moïse',
    legalStatus: 'RECOGNIZED',
    address: 'Delmas 33, Rue Poupelard #45, Port-au-Prince',
    mandatairesCount: 1420,
    candidatesCount: 42,
  },
  {
    id: 'p2',
    name: 'Rassemblement des Démocrates Nationaux Progressistes',
    acronym: 'RDNP',
    logoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=120&auto=format&fit=crop&q=80',
    leaderName: 'Mirlande Manigat',
    legalStatus: 'RECOGNIZED',
    address: 'Pétion-Ville, Rue Clerveaux #12, Port-au-Prince',
    mandatairesCount: 980,
    candidatesCount: 38,
  },
  {
    id: 'p3',
    name: 'Ligue Alternative pour le Progrès et l\'Émancipation Haïtienne',
    acronym: 'LAPEH',
    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&auto=format&fit=crop&q=80',
    leaderName: 'Steven Benoît',
    legalStatus: 'RECOGNIZED',
    address: 'Bourdon, Avenue Martin Luther King #88, Port-au-Prince',
    mandatairesCount: 650,
    candidatesCount: 24,
  },
  {
    id: 'p4',
    name: 'En Avant',
    acronym: 'EA',
    logoUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=120&auto=format&fit=crop&q=80',
    leaderName: 'Jerry Tardieu',
    legalStatus: 'RECOGNIZED',
    address: 'Pétion-Ville, Rue Moïse #19, Port-au-Prince',
    mandatairesCount: 410,
    candidatesCount: 18,
  },
  {
    id: 'p5',
    name: 'Candidats Indépendants d\'Haïti',
    acronym: 'INDEP',
    logoUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=120&auto=format&fit=crop&q=80',
    leaderName: 'Collectif des Indépendants',
    legalStatus: 'RECOGNIZED',
    address: 'Avenue Charles Sumner #104, Port-au-Prince',
    mandatairesCount: 320,
    candidatesCount: 62,
  },
];

export const ADMIN_CANDIDATES: AdminCandidate[] = [
  {
    id: 'c1',
    number: '#14',
    name: 'Jean-Charles Moïse',
    party: 'Pitit Desalin',
    partyId: 'p1',
    post: 'Président',
    territory: 'National (Haïti)',
    slogan: 'Pou yon Ayiti Souvren ak Djanm',
    policySummary: 'Souveraineté monétaire et économique, réforme agraire prioritaire, nationalisation des infrastructures stratégiques et décentralisation industrielle dans les 10 départements.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    status: 'APPROVED',
  },
  {
    id: 'c2',
    number: '#07',
    name: 'Mirlande Manigat',
    party: 'RDNP',
    partyId: 'p2',
    post: 'Président',
    territory: 'National (Haïti)',
    slogan: 'Ansanm pou Rekonstriksyon ak Leta de Dwa',
    policySummary: 'Renforcement constitutionnel des institutions, éducation universelle obligatoire, modernisation de la fonction publique et diplomatie multilatérale active.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    status: 'APPROVED',
  },
  {
    id: 'c3',
    number: '#22',
    name: 'Steven Benoît',
    party: 'LAPEH',
    partyId: 'p3',
    post: 'Sénateur',
    territory: 'Département de l\'Ouest',
    department: 'Ouest',
    slogan: 'Lalwa ak Jistis pou Tout Moun',
    policySummary: 'Transparence parlementaire stricte, audit permanent des fonds publics, renforcement de l\'autonomie administrative du département de l\'Ouest et lutte contre la corruption.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    status: 'APPROVED',
  },
  {
    id: 'c4',
    number: '#03',
    name: 'Jerry Tardieu',
    party: 'En Avant',
    partyId: 'p4',
    post: 'Député',
    territory: 'Circonscription de Pétion-Ville',
    department: 'Ouest',
    commune: 'Pétion-Ville',
    slogan: 'Modernisation ak Devlopman Lokal',
    policySummary: 'Partenariat public-privé pour les infrastructures urbaines, soutien à l\'entrepreneuriat des jeunes et intégration économique de la diaspora haïtienne.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    status: 'APPROVED',
  },
  {
    id: 'c5',
    number: '#18',
    name: 'Marie-Antoinette Duclaire',
    party: 'Candidats Indépendants d\'Haïti',
    partyId: 'p5',
    post: 'Maire',
    territory: 'Commune de Cap-Haïtien',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    slogan: 'Patrimoine ak Propreté pou Okap',
    policySummary: 'Valorisation du patrimoine historique du Nord, plan moderne de gestion des déchets, développement touristique de la baie du Cap-Haïtien et voirie urbaine.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    status: 'APPROVED',
  },
];

export const ELECTORAL_MANDATAIRES: ElectoralMandataire[] = [
  {
    id: 'm1',
    fullName: 'Pierre-Richard Alexis',
    partyId: 'p1',
    partyName: 'Pitit Desalin',
    candidateId: 'c1',
    candidateName: 'Jean-Charles Moïse #14',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    pollingStationCode: 'BV-PAP-012',
    pollingStationName: 'Lycée Alexandre Pétion',
    phone: '+509 3712-4490',
    status: 'ACTIVE',
    remarksCount: 1,
    mandateId: 'mandate-1',
  },
  {
    id: 'm2',
    fullName: 'Claudette Saint-Germain',
    partyId: 'p2',
    partyName: 'RDNP',
    candidateId: 'c2',
    candidateName: 'Mirlande Manigat #07',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    pollingStationCode: 'BV-CAP-004',
    pollingStationName: 'École Nationale de la Citadelle',
    phone: '+509 3844-9011',
    status: 'ACTIVE',
    remarksCount: 0,
    mandateId: 'mandate-2',
  },
  {
    id: 'm3',
    fullName: 'Jean-Yves Théodore',
    partyId: 'p5',
    partyName: 'Candidat Indépendant Marie-Antoinette Duclaire',
    candidateId: 'c5',
    candidateName: 'Marie-Antoinette Duclaire #18',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    pollingStationCode: 'BV-CAP-004',
    pollingStationName: 'École Nationale de la Citadelle',
    phone: '+509 3690-1122',
    status: 'ACTIVE',
    remarksCount: 2,
    mandateId: 'mandate-3',
  },
];

export const ELECTORAL_MANDATES: ElectoralMandate[] = [
  {
    id: 'mandate-1',
    mandataireId: 'm1',
    fullName: 'Pierre-Richard Alexis',
    phone: '+509 3712-4490',
    email: 'p.alexis.mandat@pititdesalin.ht',
    entityType: 'CANDIDATE',
    representedEntityId: 'c1',
    representedEntityName: 'Jean-Charles Moïse #14',
    representedEntityPhotoOrLogo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    electionName: 'Élections Générales d\'Haïti 2026',
    electionType: 'Présidentielle & Parlementaire',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    electoralZone: 'Section Turgeau & Centre-Ville',
    authorizedStations: [
      {
        code: 'BV-PAP-012',
        name: 'Lycée Alexandre Pétion (Bureau 012)',
        type: 'FIXED',
        location: 'Rue Monseigneur Guilloux, Port-au-Prince',
        electorsCount: 450,
        participantsCount: 312,
        incidentsCount: 0,
        pvStatus: 'AVAILABLE',
        devices: [
          { id: 'BIOPAD-OU-PAP-0142', status: 'OPERATIONAL' },
          { id: 'BIOPAD-OU-PAP-0143', status: 'OPERATIONAL' },
        ],
      },
      {
        code: 'BV-PAP-013',
        name: 'Bureau Nomade Pétion-Ville (Carrefour Clercine)',
        type: 'NOMADIC',
        location: 'Unité Mobile 03 - Polygone GPS Pétion-Ville Norte',
        electorsCount: 380,
        participantsCount: 245,
        incidentsCount: 1,
        pvStatus: 'AVAILABLE',
        geofenceStatus: 'VALID',
        devices: [{ id: 'BIOPAD-OU-PET-0881', status: 'OPERATIONAL' }],
      },
      {
        code: 'BV-PAP-014',
        name: 'École Nationale de la République du Chili',
        type: 'FIXED',
        location: 'Avenue Jean-Paul II, Port-au-Prince',
        electorsCount: 500,
        participantsCount: 340,
        incidentsCount: 0,
        pvStatus: 'PENDING',
        devices: [{ id: 'BIOPAD-OU-PAP-0201', status: 'OPERATIONAL' }],
      },
    ],
    modalities: ['FIXED', 'NOMADIC'],
    permissions: {
      canViewParticipation: true,
      canViewResults: true,
      canReportIncident: true,
      canSubmitObservation: true,
      canViewPv: true,
      canSignPv: true,
      canTallyVotes: true,
    },
    validFrom: '2026-09-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    status: 'ACTIVE',
  },
  {
    id: 'mandate-2',
    mandataireId: 'm2',
    fullName: 'Claudette Saint-Germain',
    phone: '+509 3844-9011',
    email: 'c.saintgermain@rdnp.ht',
    entityType: 'PARTY',
    representedEntityId: 'p2',
    representedEntityName: 'Rassemblement des Démocrates Nationaux Progressistes (RDNP)',
    representedEntityPhotoOrLogo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=120&auto=format&fit=crop&q=80',
    electionId: 'e1',
    electionName: 'Élections Générales d\'Haïti 2026',
    electionType: 'Présidentielle & Législatives',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    electoralZone: 'Zone Métropolitaine du Cap',
    authorizedStations: [
      {
        code: 'BV-CAP-004',
        name: 'École Nationale de la Citadelle (Bureau 004)',
        type: 'FIXED',
        location: 'Rue 18-B, Cap-Haïtien',
        electorsCount: 480,
        participantsCount: 301,
        incidentsCount: 0,
        pvStatus: 'AVAILABLE',
        devices: [{ id: 'BIOPAD-ND-CAP-0089', status: 'OPERATIONAL' }],
      },
      {
        code: 'BV-ONLINE-Z',
        name: 'Circonspection Virtuelle Online-Z (Diaspora & Vote Web)',
        type: 'VIRTUAL',
        location: 'Serveur Souverain Cloud Enclave CEP',
        electorsCount: 5000,
        participantsCount: 3410,
        incidentsCount: 0,
        pvStatus: 'AVAILABLE',
      },
    ],
    modalities: ['BOTH'],
    permissions: {
      canViewParticipation: true,
      canViewResults: true,
      canReportIncident: true,
      canSubmitObservation: true,
      canViewPv: true,
      canSignPv: false,
      canTallyVotes: true,
    },
    validFrom: '2026-09-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    status: 'ACTIVE',
  },
  {
    id: 'mandate-3',
    mandataireId: 'm3',
    fullName: 'Jean-Yves Théodore',
    phone: '+509 3690-1122',
    email: 'jy.theodore@indep-duclaire.ht',
    entityType: 'CANDIDATE',
    representedEntityId: 'c5',
    representedEntityName: 'Marie-Antoinette Duclaire #18',
    representedEntityPhotoOrLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    electionId: 'e1',
    electionName: 'Élections Générales d\'Haïti 2026',
    electionType: 'Municipale Cap-Haïtien',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    electoralZone: 'Cap-Haïtien Ouest',
    authorizedStations: [
      {
        code: 'BV-CAP-004',
        name: 'École Nationale de la Citadelle (Bureau 004)',
        type: 'FIXED',
        location: 'Rue 18-B, Cap-Haïtien',
        electorsCount: 480,
        participantsCount: 301,
        incidentsCount: 1,
        pvStatus: 'AVAILABLE',
        devices: [{ id: 'BIOPAD-ND-CAP-0089', status: 'OPERATIONAL' }],
      },
    ],
    modalities: ['FIXED'],
    permissions: {
      canViewParticipation: true,
      canViewResults: true,
      canReportIncident: true,
      canSubmitObservation: true,
      canViewPv: true,
      canSignPv: true,
      canTallyVotes: true,
    },
    validFrom: '2026-09-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    status: 'ACTIVE',
  },
];


export const MANDATAIRE_REMARKS: MandataireRemark[] = [
  {
    id: 'mr1',
    mandataireId: 'm1',
    mandataireName: 'Pierre-Richard Alexis',
    partyName: 'Pitit Desalin',
    pollingStationCode: 'BV-PAP-012',
    category: 'REGULARITY',
    title: 'Ouverture régulière du bureau et scellement d\'urne',
    description: 'Procès-verbal d\'ouverture vérifié et scellé à 06h00 précises en présence des observateurs.',
    tallyVotes: 420,
    reportedAt: '2026-09-05T06:15',
    status: 'VALIDATED',
  },
  {
    id: 'mr2',
    mandataireId: 'm3',
    mandataireName: 'Jean-Yves Théodore',
    partyName: 'Candidat Indépendant Marie-Antoinette Duclaire',
    pollingStationCode: 'BV-CAP-004',
    category: 'TALLY_CHECK',
    title: 'Comptage contradictoire final et dépouillement des bulletins',
    description: 'Le décompte parallèle donne 184 votes pour le candidat #18 contre 182 enregistrés initialement. Réserve portée au procès-verbal.',
    tallyVotes: 184,
    reportedAt: '2026-09-05T05:40',
    status: 'UNDER_REVIEW',
  },
];

export const APK_AGENT_USERS: ApkAgentUser[] = [
  {
    id: 'a1',
    type: 'FIELD',
    agentCode: 'AGT-FLD-OU-041',
    fullName: 'Marc-Antoine Toussaint',
    phone: '+509 3788-1200',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    coveredSections: 'Turgeau, Morne l\'Hôpital, Martissant',
    deviceId: 'BIOPAD-OU-PAP-0142',
    status: 'ACTIVE',
  },
  {
    id: 'a2',
    type: 'POLLING_STATION',
    agentCode: 'AGT-POL-BV-012',
    fullName: 'Magalie Saint-Juste',
    phone: '+509 3611-9988',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    pollingStationCode: 'BV-PAP-012',
    pollingStationName: 'Lycée Alexandre Pétion (Bureau #012)',
    address: 'Rue Monseigneur Guilloux, Port-au-Prince, Département de l\'Ouest',
    deviceId: 'BIOPAD-OU-PAP-0142',
    status: 'ACTIVE',
  },
  {
    id: 'a3',
    type: 'POLLING_STATION',
    agentCode: 'AGT-POL-BV-004',
    fullName: 'Emmanuel Hyppolite',
    phone: '+509 3922-3344',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    pollingStationCode: 'BV-CAP-004',
    pollingStationName: 'École Nationale de la Citadelle (Bureau #004)',
    address: 'Rue 18-B, Cap-Haïtien, Département du Nord',
    deviceId: 'BIOPAD-ND-CAP-0089',
    status: 'ACTIVE',
  },
];

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'u-cep-1',
    username: 'president.cep',
    password: 'CepPassword2026!',
    fullName: 'Me. Max Mathurin',
    role: 'ADMIN_CEP',
    roleTitle: 'Président du Conseil Électoral Provisoire (CEP)',
    permissions: ['system.superadmin', '*.*'],
    scope: { departments: ['ALL'], elections: ['ALL'], communes: ['ALL'] },
  },
  {
    id: 'u-cep-1-legacy',
    username: 'm.mathurin.cep',
    password: 'CepPassword2026!',
    fullName: 'Me. Max Mathurin',
    role: 'ADMIN_CEP',
    roleTitle: 'Président du Conseil Électoral Provisoire (CEP)',
    permissions: ['system.superadmin', '*.*'],
    scope: { departments: ['ALL'], elections: ['ALL'], communes: ['ALL'] },
  },
  {
    id: 'u-exec-dg',
    username: 'directeur.exec',
    password: 'CepPassword2026!',
    fullName: 'Me. Max Delva Guillaume',
    role: 'ADMIN_CEP',
    roleTitle: 'Directeur Exécutif & Général du CEP',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'election.view',
      'election.update',
      'station.view',
      'device.view',
      'user.view',
      'audit.view',
    ],
    scope: { departments: ['ALL'], elections: ['ALL'] },
  },
  {
    id: 'u-ops-cep',
    username: 'ops.cep',
    password: 'CepPassword2026!',
    fullName: 'Ing. Fritz Bernard',
    role: 'ADMIN_CEP',
    roleTitle: 'Conseiller Électoral — Responsable des Opérations & Logistique',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'station.view',
      'station.create',
      'station.assign',
      'station.transfer',
      'device.view',
      'device.register',
      'device.activate',
      'device.suspend',
      'device.revoke',
      'incident.view',
      'incident.resolve',
      'audit.view',
    ],
    scope: { departments: ['ALL'], elections: ['ALL'] },
  },
  {
    id: 'u-legal-cep',
    username: 'legal.cep',
    password: 'CepPassword2026!',
    fullName: 'Me. Rose Lhérisson',
    role: 'ADMIN_CEP',
    roleTitle: 'Conseillère Électorale — Responsable Contentieux & Juridique',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'candidate.view',
      'candidate.approve',
      'candidate.reject',
      'party.view',
      'mandate.view',
      'mandate.approve',
      'pv.view',
      'pv.review',
      'pv.reject',
      'incident.view',
      'incident.resolve',
      'audit.view',
    ],
    scope: { departments: ['ALL'], elections: ['ALL'] },
  },
  {
    id: 'u-it-cep',
    username: 'it.cep',
    password: 'CepPassword2026!',
    fullName: 'Col. Jacques Roche',
    role: 'ADMIN_CEP',
    roleTitle: 'Conseiller Électoral — Responsable Registre & Sécurité Informatique',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'elector.view',
      'elector.search',
      'elector.assign',
      'device.view',
      'device.revoke',
      'audit.view',
      'audit.export',
      'user.view',
      'user.permissions.manage',
    ],
    scope: { departments: ['ALL'], elections: ['ALL'] },
  },
  {
    id: 'u-bed-ouest',
    username: 'bed.ouest',
    password: 'BedPassword2026!',
    fullName: 'Directeur BED Ouest (Port-au-Prince)',
    role: 'MEMBER_CEP',
    roleTitle: 'Directeur du Bureau Électoral Départemental (BED Ouest)',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'station.view',
      'device.view',
      'candidate.view',
      'pv.view',
      'pv.review',
      'pv.validate',
      'incident.view',
      'incident.create',
    ],
    scope: { departments: ['Ouest'], elections: ['e1'] },
    department: 'Ouest',
  },
  {
    id: 'u-bed-nord',
    username: 'bed.nord',
    password: 'BedPassword2026!',
    fullName: 'Directeur BED Cap-Haïtien (Nord)',
    role: 'MEMBER_CEP',
    roleTitle: 'Directeur du Bureau Électoral Départemental (BED Nord)',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'station.view',
      'device.view',
      'candidate.view',
      'pv.view',
      'pv.review',
      'pv.validate',
      'incident.view',
      'incident.create',
    ],
    scope: { departments: ['Nord'], elections: ['e1'] },
    department: 'Nord',
  },
  {
    id: 'u-sup-terrain',
    username: 'sup.terrain',
    password: 'BecPassword2026!',
    fullName: 'Superviseur Communal & Agent de Liaison (Port-au-Prince)',
    role: 'MEMBER_CEP',
    roleTitle: 'Superviseur Communal & Agent de Liaison Terrain (BEC)',
    permissions: [
      'dashboard.view',
      'myScope.view',
      'station.view',
      'elector.search',
      'incident.view',
      'incident.create',
    ],
    scope: { departments: ['Ouest'], communes: ['Port-au-Prince'], elections: ['e1'] },
    department: 'Ouest',
    commune: 'Port-au-Prince',
  },

  {
    id: 'u-cand-1',
    username: 'cand.moise.14',
    password: 'Candidate2026!',
    fullName: 'Jean-Charles Moïse #14',
    role: 'CANDIDATE',
    roleTitle: 'Candidat Présidentiel — Pitit Desalin #14',
    candidateId: 'c1',
    partyId: 'p1',
  },
  {
    id: 'u-cand-2',
    username: 'cand.manigat.07',
    password: 'Candidate2026!',
    fullName: 'Mirlande Manigat #07',
    role: 'CANDIDATE',
    roleTitle: 'Candidat Présidentiel — RDNP #07',
    candidateId: 'c2',
    partyId: 'p2',
  },
  {
    id: 'u-party-1',
    username: 'party.pititdesalin',
    password: 'Party2026!',
    fullName: 'Direction Politique Pitit Desalin',
    role: 'PARTY',
    roleTitle: 'Parti Politique Officiel (Pitit Desalin)',
    partyId: 'p1',
  },
  {
    id: 'u-mandat-1',
    username: 'mandat.ouest.01',
    password: 'Mandat2026!',
    fullName: 'Pierre-Richard Alexis',
    role: 'MANDATAIRE',
    roleTitle: 'Mandataire Électoral — Bureau BV-PAP-012',
    mandataireId: 'm1',
    partyId: 'p1',
    candidateId: 'c1',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    pollingStationCode: 'BV-PAP-012',
  },
  {
    id: 'u-agent-1',
    username: 'agent.field.pap01',
    password: 'Agent2026!',
    fullName: 'Marc-Antoine Toussaint',
    role: 'APK_AGENT',
    roleTitle: 'Agent de Terrain APK (Recensement)',
    agentId: 'a1',
    department: 'Ouest',
    commune: 'Port-au-Prince',
  },
];

export const ADMIN_DEVICES: AdminDevice[] = [
  {
    id: 'd1',
    deviceId: 'BIOPAD-OU-PAP-0142',
    version: 'v1.4.2-sec',
    assignedUser: 'agent.bed.ouest.01',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    pollingStationCode: 'BV-PAP-012',
    encryption: 'AES-256-GCM (Hardware TPM 2.0 Enclave)',
    certExpiry: '2027-12-31',
    status: 'ACTIVE',
    compromised: false,
    tamperCount: 0,
    lastSeen: 'À l\'instant',
    lastSync: 'Il y a 1 min',
  },
  {
    id: 'd2',
    deviceId: 'BIOPAD-ND-CAP-0089',
    version: 'v1.4.2-sec',
    assignedUser: 'agent.bec.cap.04',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    pollingStationCode: 'BV-CAP-004',
    encryption: 'AES-256-GCM (Hardware TPM 2.0 Enclave)',
    certExpiry: '2027-12-31',
    status: 'ACTIVE',
    compromised: false,
    tamperCount: 0,
    lastSeen: 'Il y a 4 min',
    lastSync: 'Il y a 3 min',
  },
  {
    id: 'd3',
    deviceId: 'BIOPAD-AR-GON-0992',
    version: 'v1.3.9-old',
    assignedUser: 'inconnu',
    department: 'Artibonite',
    commune: 'Gonaïves',
    pollingStationCode: 'BV-GON-088',
    encryption: 'AES-256 (Software Fallback)',
    certExpiry: 'EXPIRED (2026-08-01)',
    status: 'REVOKED',
    compromised: true,
    compromiseReason: 'Détection d\'altération physique du boîtier & tentative de dump mémoire non autorisé.',
    tamperCount: 3,
    lastSeen: 'Il y a 2 j',
    lastSync: 'RÉVOQUÉ',
  },
  {
    id: 'd4',
    deviceId: 'BIOPAD-SD-CAY-0311',
    version: 'v1.4.2-sec',
    assignedUser: 'agent.bed.sud.02',
    department: 'Sud',
    commune: 'Les Cayes',
    pollingStationCode: 'BV-CAY-019',
    encryption: 'AES-256-GCM (Hardware TPM 2.0 Enclave)',
    certExpiry: '2027-12-31',
    status: 'SUSPENDED',
    compromised: false,
    tamperCount: 1,
    lastSeen: 'Il y a 45 min',
    lastSync: 'Il y a 2 h',
  },
];

export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'u1',
    fullName: 'Me. Max Mathurin',
    username: 'm.mathurin.cep',
    role: 'ADMIN_CEP',
    roleTitle: 'Président du Conseil Électoral Provisoire (CEP)',
    status: 'ACTIVE',
    mTLSVerified: true,
    lastActive: 'À l\'instant',
  },
  {
    id: 'u2',
    fullName: 'Dr. Yolette Mengual',
    username: 'y.mengual.cep',
    role: 'MEMBER_CEP',
    roleTitle: 'Conseillère Électorale — Responsable Opérations',
    status: 'ACTIVE',
    mTLSVerified: true,
    lastActive: 'Il y a 12 min',
  },
  {
    id: 'u3',
    fullName: 'Ing. Jean-Robert Joseph',
    username: 'jr.joseph.bed.ouest',
    role: 'BED_SUPERVISOR',
    roleTitle: 'Directeur du Bureau Électoral Départemental (BED Ouest)',
    department: 'Ouest',
    status: 'ACTIVE',
    mTLSVerified: true,
    lastActive: 'Il y a 3 min',
  },
  {
    id: 'u4',
    fullName: 'Marie-Rose Bellevue',
    username: 'mr.bellevue.bec.cap',
    role: 'BEC_SUPERVISOR',
    roleTitle: 'Superviseur Bureau Électoral Communal (BEC Cap-Haïtien)',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    status: 'ACTIVE',
    mTLSVerified: true,
    lastActive: 'Il y a 22 min',
  },
  {
    id: 'u5',
    fullName: 'Cabinet CARICOM / Observateurs',
    username: 'auditor.caricom.global',
    role: 'AUDITOR',
    roleTitle: 'Auditeur International Indépendant',
    status: 'ACTIVE',
    mTLSVerified: true,
    lastActive: 'Il y a 1 h',
  },
];

export const ADMIN_INCIDENTS: AdminIncident[] = [
  { id: 'i1', category: 'Biométrie / Anti-spoofing', severity: 'HIGH', status: 'OPEN', reportedBy: 'agent.bed.ouest.01', reportedAt: '2026-09-05T01:14' },
  { id: 'i2', category: 'Télémétrie Appareil BIOPAD-AR-GON-0992', severity: 'CRITICAL', status: 'OPEN', reportedBy: 'TPM-Enclave-System', reportedAt: '2026-09-04T23:50' },
  { id: 'i3', category: 'Réseau VSAT / Déconnexion temporaire', severity: 'MEDIUM', status: 'RESOLVED', reportedBy: 'agent.bec.cap.04', reportedAt: '2026-09-04T18:20' },
];

export const ADMIN_AUDIT: AdminAuditEvent[] = [
  { id: 'a1', actor: 'm.mathurin.cep', action: 'election.publish_candidates', object: 'generale-2026', outcome: 'ok', correlationId: 'tx-sec-9901', occurredAt: '2026-09-05T02:00' },
  { id: 'a2', actor: 'TPM-Enclave-System', action: 'device.auto_lock', object: 'BIOPAD-AR-GON-0992', outcome: 'COMPROMISED_LOCKED', correlationId: 'tx-sec-9902', occurredAt: '2026-09-04T23:50' },
  { id: 'a3', actor: 'jr.joseph.bed.ouest', action: 'voter.biometric_verification', object: 'NIN-1988-09-12-0041', outcome: 'ok', correlationId: 'tx-sec-9903', occurredAt: '2026-09-05T01:12' },
];

export const ADMIN_RELEASES: AdminRelease[] = [
  { id: 'r1', version: '1.4.2-sec', build: '8452', hash: 'a3f2...9c1', signature: 'ed25519:cert_cep_2026_ok', status: 'PUBLISHED' },
  { id: 'r2', version: '1.4.3-rc', build: '8461', hash: '9b1f...7d2', signature: 'ed25519:cert_cep_2026_ok', status: 'SIGNED' },
];

export const COMMAND_STATE = {
  operational: 13210,
  attention: 540,
  incident: 100,
  online: 7420,
  offline: 0,
  pending: 120,
  pvReceived: 11450,
  pvValidated: 10980,
};

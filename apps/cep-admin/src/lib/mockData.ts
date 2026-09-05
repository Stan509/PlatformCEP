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

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  role: 'ADMIN_CEP' | 'MEMBER_CEP' | 'BED_SUPERVISOR' | 'BEC_SUPERVISOR' | 'AUDITOR' | 'OPERATOR';
  roleTitle: string;
  department?: string;
  commune?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  mTLSVerified: boolean;
  lastActive: string;
}

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

export const ADMIN_CANDIDATES: AdminCandidate[] = [
  {
    id: 'c1',
    number: '#14',
    name: 'Jean-Charles Moïse',
    party: 'Pitit Desalin',
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
    party: 'Rassemblement Démocratique',
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

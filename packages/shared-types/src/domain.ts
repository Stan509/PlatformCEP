/**
 * @cep/shared-types — Types du domaine électoral CEP.
 *
 * PRINCIPE NON NÉGOCIABLE : séparation stricte identité / vote.
 * Les domaines `Identity`, `Eligibility`, `Participation` et `Ballot` sont des
 * modules distincts. Aucun type ne doit coupler une identité à un choix de vote.
 *
 * Par conception, un objet `Ballot` (bulletin) ne référence JAMAIS une identité
 * d'électeur : il est anonyme et associé à un `ParticipationToken` éphémère.
 */

// ---------------------------------------------------------------------------
// Langues
// ---------------------------------------------------------------------------

export type LanguageCode = 'ht' | 'fr' | 'en';

// ---------------------------------------------------------------------------
// Géographie (moteur versionné)
// ---------------------------------------------------------------------------

export interface GeoVersion {
  version: string;
  effectiveFrom: string; // ISO date
  source: string;
  author: string;
  approver?: string;
}

export interface GeographicNode {
  id: string;
  code: string;
  label: Record<LanguageCode, string>;
  parentId?: string;
  level: GeoLevel;
  geoVersion: GeoVersion;
}

export type GeoLevel =
  | 'country'
  | 'department'
  | 'arrondissement'
  | 'commune'
  | 'section_communale'
  | 'locality'
  | 'electoral_district'
  | 'voting_center'
  | 'polling_station';

// ---------------------------------------------------------------------------
// Registre électoral — domaine IDENTITY
// ---------------------------------------------------------------------------

export type RegistrationStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'REGISTERED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'INACTIVE'
  | 'REJECTED';

/**
 * Représentation RÉDUITE et minimale du citoyen, côté public.
 * Remarque : cette structure ne contient volontairement AUCUNE donnée de vote,
 * et jamais l'identité complète (minimisation — privacy by design).
 */
export interface ElectorPublic {
  electorId: string;
  registrationStatus: RegistrationStatus;
  /** identifiant électoral public (jamais l'identité civile complète) */
  electoralReference: string;
  pollingStation?: string;
  votingCenter?: string;
  territorialAssignment?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Domaine ELIGIBILITY
// ---------------------------------------------------------------------------

export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'PENDING' | 'REVOKED';

export interface EligibilityCheck {
  electionId: string;
  electorRef: string;
  status: EligibilityStatus;
  reason?: string;
  checkedAt: string;
}

// ---------------------------------------------------------------------------
// Domaine PARTICIPATION — autorisation de voter (ne révèle PAS le choix)
// ---------------------------------------------------------------------------

/**
 * Un `ParticipationToken` est un droit de voter.
 * Il ne contient JAMAIS le choix du bulletin. Il est éphémère, à usage unique.
 */
export interface ParticipationToken {
  tokenId: string;
  electionId: string;
  electorRef: string;
  issuingStationId: string;
  issuedAt: string;
  /** Issued = autorisation délivrée ; Used = participation enregistrée. */
  state: 'ISSUED' | 'USED' | 'CANCELLED' | 'REVOKED';
  /** hash anti-replay de la transaction serveur. */
  antiReplayHash: string;
}

// ---------------------------------------------------------------------------
// Domaine BALLOT / VOTE — anonyme, aucun lien avec identity
// ---------------------------------------------------------------------------

export interface BallotChoice {
  candidateRef: string;
  /** Position du candidat sur le bulletin — ordre officiel, jamais le ranking. */
  ballotIndex: number;
}

export type BallotOption =
  | { kind: 'candidate'; ref: string; name: string; partyRef?: string }
  | { kind: 'blank' }
  | { kind: 'null' };

export interface Ballot {
  ballotId: string;
  electionId: string;
  ballotIndex: number;
  options: BallotOption[];
  /** date/heure de scellement (trusted time) */
  sealedAt: string;
}

/** Vote enregistré, anonyme. Référence une autorisation, jamais une identité. */
export interface RecordedVote {
  receiptId: string; // reçu de vérification — ne révèle pas le choix
  ballotId: string;
  participationTokenState: 'USED';
  sealedAt: string;
}

// ---------------------------------------------------------------------------
// Élections — moteur configurable
// ---------------------------------------------------------------------------

export type ElectionStatus =
  | 'DRAFT'
  | 'CONFIGURATION'
  | 'REGISTRATION'
  | 'CANDIDATE_VALIDATION'
  | 'READY'
  | 'OPEN'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'TABULATION'
  | 'PROVISIONAL_RESULTS'
  | 'FINAL_VALIDATION'
  | 'FINAL_RESULTS'
  | 'ARCHIVED';

export type ResultStatus = 'PROVISIONAL' | 'PARTIAL' | 'CONSOLIDATED' | 'FINAL';

export interface TerritoryRule {
  level: GeoLevel;
  /** ex. { post: "senator", scope: "department" } — jamais codé en dur. */
  post: string;
  scope: GeoLevel;
  assign: GeoLevel;
}

export interface Election {
  electionId: string;
  name: Record<LanguageCode, string>;
  electionType: string;
  status: ElectionStatus;
  legalConfiguration: string;
  startDate: string;
  endDate: string;
  territoryRules: TerritoryRule[];
  eligibilityRules: Record<string, string>;
  votingRules: { modalities: string[] };
  countingRules: Record<string, unknown>;
  publicationRules: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Candidats & partis
// ---------------------------------------------------------------------------

export type CandidateStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'WITHDRAWN';

export interface Candidate {
  candidateRef: string;
  firstName: string;
  lastName: string;
  partyRef?: string;
  post: string;
  territory: string; // reference node
  /** Position officielle sur le bulletin — ordre juridique, pas popularité. */
  ballotIndex: number;
  status: CandidateStatus;
}

export interface Party {
  partyRef: string;
  name: Record<LanguageCode, string>;
  acronym: string;
}

// ---------------------------------------------------------------------------
// Résultats (publication) — niveaux de confiance
// ---------------------------------------------------------------------------

export interface ResultConfidence {
  status: ResultStatus;
  /** % des bureaux reçus qui alimentent ce résultat. */
  coverage: number; // 0..1
  updatedAt: string;
}

export interface CandidateResult {
  candidateRef: string;
  votes: number;
  percentage: number;
}

export interface ElectionResult {
  electionId: string;
  scope: GeoLevel;
  geographicNodeId: string;
  confidence: ResultConfidence;
  candidates: CandidateResult[];
  blankBallots: number;
  nullBallots: number;
  totalBallots: number;
  participation: number; // 0..1
}

// ---------------------------------------------------------------------------
// Rôles & RBAC
// ---------------------------------------------------------------------------

export type Role =
  | 'SUPERADMIN'
  | 'DEV'
  | 'ADMIN_CEP'
  | 'MEMBER_CEP'
  | 'ELECTORAL_MANAGER'
  | 'BED'
  | 'BEC'
  | 'CIV_MANAGER'
  | 'FIELD_AGENT'
  | 'POLLING_AGENT'
  | 'SUPERVISOR'
  | 'AUDITOR'
  | 'OBSERVER'
  | 'PARTY'
  | 'CANDIDATE'
  | 'CITIZEN'
  | 'DIASPORA';

/**
 * Règle forte : le rôle DEV ne donne AUCUN droit électoral.
 * Cette règle est garantie par le moteur de permissions côté backend.
 */

// ---------------------------------------------------------------------------
// Appareils & synchronisation (local-first)
// ---------------------------------------------------------------------------

export type DeviceStatus =
  | 'PROVISIONED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LOST'
  | 'STOLEN'
  | 'REVOKED'
  | 'RETIRED';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'BLOCKED';

export interface Device {
  deviceId: string;
  status: DeviceStatus;
  appVersion: string;
  allowedElectionId?: string;
  assignedGeoNodeId?: string;
  assignedAgentRef?: string;
  lastConnectionAt?: string;
  lastSyncAt?: string;
}

// ---------------------------------------------------------------------------
// Audit immuable (tamper-evident)
// ---------------------------------------------------------------------------

export interface AuditEvent {
  eventId: string;
  actorRef: string;
  actorRole: Role;
  deviceId?: string;
  action: string;
  occurredAt: string;
  context: string;
  objectRef: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  transactionId: string;
  /** hash du contenu de l'événement (anti-tampering). */
  eventHash: string;
  /** hash de l'événement précédent → chaîne immuable. */
  previousHash: string | null;
  signature?: string;
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export type IncidentCategory =
  | 'device'
  | 'network'
  | 'power'
  | 'identity'
  | 'eligibility'
  | 'security'
  | 'hardware'
  | 'software'
  | 'station_inaccessible'
  | 'operational'
  | 'sync_anomaly'
  | 'electoral';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'CLASSIFIED' | 'ASSIGNED' | 'INVESTIGATING' | 'RESOLVED' | 'VERIFIED' | 'ARCHIVED';

export interface Incident {
  incidentId: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  deviceId?: string;
  reportedBy?: string;
  reportedAt: string;
  description: string;
}

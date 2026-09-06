/**
 * CEP ADMIN V3 — Data Provider Abstraction
 * Decouples React UI components from mock state, ready to connect to Django/DRF REST API.
 */

import type {
  AdminCandidate,
  AdminDevice,
  AdminElection,
  AdminIncident,
  AdminRelease,
  AdminRole,
  AdminUser,
  ApkAgentUser,
  ElectoralMandataire,
  ElectoralMandate,
  MandataireRemark,
  PoliticalParty,
  UserAccount,
} from './mockData';
import { adminApi } from './api';

export interface DataProvider {
  // Auth & Session
  login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; message?: string }>;
  logout(): Promise<void>;
  getCurrentSession(): UserAccount | null;

  // Domain Entities
  getElections(): Promise<AdminElection[]>;
  saveElection(election: AdminElection): Promise<AdminElection[]>;
  deleteElection(id: string): Promise<AdminElection[]>;

  getCandidates(): Promise<AdminCandidate[]>;
  saveCandidate(candidate: AdminCandidate): Promise<AdminCandidate[]>;
  deleteCandidate(id: string): Promise<AdminCandidate[]>;

  getParties(): Promise<PoliticalParty[]>;
  saveParty(party: PoliticalParty): Promise<PoliticalParty[]>;
  deleteParty(id: string): Promise<PoliticalParty[]>;

  getMandataires(): Promise<ElectoralMandataire[]>;
  saveMandataire(mandataire: ElectoralMandataire): Promise<ElectoralMandataire[]>;
  deleteMandataire(id: string): Promise<ElectoralMandataire[]>;

  getMandates(): Promise<ElectoralMandate[]>;
  getMandateForUser(mandataireId?: string, partyId?: string, candidateId?: string): Promise<ElectoralMandate | null>;

  getRemarks(): Promise<MandataireRemark[]>;
  addRemark(remark: MandataireRemark): Promise<MandataireRemark[]>;

  getApkAgents(): Promise<ApkAgentUser[]>;
  saveApkAgent(agent: ApkAgentUser): Promise<ApkAgentUser[]>;
  deleteApkAgent(id: string): Promise<ApkAgentUser[]>;

  getDevices(): Promise<AdminDevice[]>;
  updateDeviceStatus(id: string, status: AdminDevice['status'], compromised?: boolean, reason?: string): Promise<AdminDevice[]>;

  getUsers(): Promise<AdminUser[]>;
  saveUser(user: AdminUser): Promise<AdminUser[]>;
  deleteUser(id: string): Promise<AdminUser[]>;

  getRoles(): Promise<AdminRole[]>;
  saveRole(role: AdminRole): Promise<AdminRole[]>;
  deleteRole(id: string): Promise<AdminRole[]>;

  getIncidents(): Promise<AdminIncident[]>;
  getAuditEvents(): Promise<any[]>;
  getReleases(): Promise<AdminRelease[]>;
}

/**
 * Demo Data Provider active during UI validation phase.
 */
export const demoDataProvider: DataProvider = {
  login: (u, p) => adminApi.login(u, p),
  logout: async () => adminApi.logout(),
  getCurrentSession: () => adminApi.getCurrentSession(),

  getElections: () => adminApi.elections(),
  saveElection: (e) => adminApi.saveElection(e),
  deleteElection: (id) => adminApi.deleteElection(id),

  getCandidates: () => adminApi.candidates(),
  saveCandidate: (c) => adminApi.saveCandidate(c),
  deleteCandidate: (id) => adminApi.deleteCandidate(id),

  getParties: () => adminApi.parties(),
  saveParty: (p) => adminApi.saveParty(p),
  deleteParty: (id) => adminApi.deleteParty(id),

  getMandataires: () => adminApi.mandataires(),
  saveMandataire: (m) => adminApi.saveMandataire(m),
  deleteMandataire: (id) => adminApi.deleteMandataire(id),

  getMandates: () => adminApi.mandates(),
  getMandateForUser: (mId, pId, cId) => adminApi.getMandateForUser(mId, pId, cId),

  getRemarks: () => adminApi.remarks(),
  addRemark: (r) => adminApi.addRemark(r),

  getApkAgents: () => adminApi.apkAgents(),
  saveApkAgent: (a) => adminApi.saveApkAgent(a),
  deleteApkAgent: (id) => adminApi.deleteApkAgent(id),

  getDevices: () => adminApi.devices(),
  updateDeviceStatus: (id, status, compromised, reason) => adminApi.updateDeviceStatus(id, status, compromised, reason),

  getUsers: () => adminApi.users(),
  saveUser: (u) => adminApi.saveUser(u),
  deleteUser: (id) => adminApi.deleteUser(id),

  getRoles: () => adminApi.roles(),
  saveRole: (r) => adminApi.saveRole(r),
  deleteRole: (id) => adminApi.deleteRole(id),

  getIncidents: () => adminApi.incidents(),
  getAuditEvents: () => adminApi.audit(),
  getReleases: () => adminApi.releases(),
};

/**
 * Backend endpoints contract roadmap for future Django/DRF implementation.
 */
export const FUTURE_BACKEND_CONTRACT = {
  authMe: 'GET /api/admin/me',
  permissions: 'GET /api/admin/me/permissions',
  scopes: 'GET /api/admin/me/scopes',
  dashboard: 'GET /api/admin/dashboard',
  elections: 'GET /api/admin/elections',
  candidates: 'GET /api/admin/candidates',
  parties: 'GET /api/admin/parties',
  mandates: 'GET /api/admin/mandates',
  stations: 'GET /api/admin/stations',
  devices: 'GET /api/admin/devices',
  incidents: 'GET /api/admin/incidents',
  pv: 'GET /api/admin/pv',
  results: 'GET /api/admin/results',
  audit: 'GET /api/admin/audit',
};

import {
  ADMIN_AUDIT,
  ADMIN_CANDIDATES,
  ADMIN_DEVICES,
  ADMIN_ELECTIONS,
  ADMIN_INCIDENTS,
  ADMIN_RELEASES,
  ADMIN_USERS,
  APK_AGENT_USERS,
  ELECTORAL_MANDATAIRES,
  ELECTORAL_MANDATES,
  INITIAL_ADMIN_ROLES,
  MANDATAIRE_REMARKS,
  POLITICAL_PARTIES,
  USER_ACCOUNTS,
} from './mockData';
import type {
  AdminCandidate,
  AdminDevice,
  AdminElection,
  AdminRole,
  AdminUser,
  ApkAgentUser,
  ElectoralMandataire,
  ElectoralMandate,
  MandataireRemark,
  PoliticalParty,
  UserAccount,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY_ELECTIONS = 'cep_admin_elections_v1';
const STORAGE_KEY_CANDIDATES = 'cep_admin_candidates_v1';
const STORAGE_KEY_DEVICES = 'cep_admin_devices_v1';
const STORAGE_KEY_USERS = 'cep_admin_users_v1';
const STORAGE_KEY_ROLES = 'cep_admin_roles_v1';
const STORAGE_KEY_PARTIES = 'cep_admin_parties_v1';
const STORAGE_KEY_MANDATAIRES = 'cep_admin_mandataires_v1';
const STORAGE_KEY_MANDATES = 'cep_admin_mandates_v1';
const STORAGE_KEY_REMARKS = 'cep_admin_remarks_v1';
const STORAGE_KEY_APK_AGENTS = 'cep_admin_apk_agents_v1';
const STORAGE_KEY_CURRENT_SESSION = 'cep_admin_auth_session_v1';


function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) return parsed;
    }
  } catch {}
  return fallback;
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/** Client API admin simulé. En production : appels DRF JWT/RBAC. */
export const adminApi = {
  // Authentication & Session
  async login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    await delay(300);
    const u = USER_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase() && acc.password === password
    );
    if (u) {
      setStored(STORAGE_KEY_CURRENT_SESSION, u);
      return { success: true, user: u };
    }
    return { success: false, message: 'Identifiants ou mot de passe incorrects.' };
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
    } catch {}
  },

  getCurrentSession(): UserAccount | null {
    return getStored<UserAccount | null>(STORAGE_KEY_CURRENT_SESSION, null);
  },

  // Elections
  async elections(): Promise<AdminElection[]> {
    await delay(150);
    return getStored(STORAGE_KEY_ELECTIONS, ADMIN_ELECTIONS);
  },

  async saveElection(election: AdminElection): Promise<AdminElection[]> {
    await delay(150);
    const elections = getStored(STORAGE_KEY_ELECTIONS, ADMIN_ELECTIONS);
    const idx = elections.findIndex((e) => e.id === election.id);
    if (idx >= 0) elections[idx] = election;
    else elections.unshift(election);
    setStored(STORAGE_KEY_ELECTIONS, elections);
    return elections;
  },

  async deleteElection(id: string): Promise<AdminElection[]> {
    await delay(150);
    const elections = getStored<AdminElection[]>(STORAGE_KEY_ELECTIONS, ADMIN_ELECTIONS).filter((e) => e.id !== id);
    setStored(STORAGE_KEY_ELECTIONS, elections);
    return elections;
  },

  // Candidates
  async candidates(): Promise<AdminCandidate[]> {
    await delay(150);
    return getStored(STORAGE_KEY_CANDIDATES, ADMIN_CANDIDATES);
  },

  async saveCandidate(candidate: AdminCandidate): Promise<AdminCandidate[]> {
    await delay(150);
    const candidates = getStored(STORAGE_KEY_CANDIDATES, ADMIN_CANDIDATES);
    const idx = candidates.findIndex((c) => c.id === candidate.id);
    if (idx >= 0) candidates[idx] = candidate;
    else candidates.unshift(candidate);
    setStored(STORAGE_KEY_CANDIDATES, candidates);
    return candidates;
  },

  async deleteCandidate(id: string): Promise<AdminCandidate[]> {
    await delay(150);
    const candidates = getStored<AdminCandidate[]>(STORAGE_KEY_CANDIDATES, ADMIN_CANDIDATES).filter((c) => c.id !== id);
    setStored(STORAGE_KEY_CANDIDATES, candidates);
    return candidates;
  },

  // Political Parties
  async parties(): Promise<PoliticalParty[]> {
    await delay(150);
    return getStored(STORAGE_KEY_PARTIES, POLITICAL_PARTIES);
  },

  async saveParty(party: PoliticalParty): Promise<PoliticalParty[]> {
    await delay(150);
    const parties = getStored(STORAGE_KEY_PARTIES, POLITICAL_PARTIES);
    const idx = parties.findIndex((p) => p.id === party.id);
    if (idx >= 0) parties[idx] = party;
    else parties.unshift(party);
    setStored(STORAGE_KEY_PARTIES, parties);
    return parties;
  },

  async deleteParty(id: string): Promise<PoliticalParty[]> {
    await delay(150);
    const parties = getStored<PoliticalParty[]>(STORAGE_KEY_PARTIES, POLITICAL_PARTIES).filter((p) => p.id !== id);
    setStored(STORAGE_KEY_PARTIES, parties);
    return parties;
  },

  // Mandataires
  async mandataires(): Promise<ElectoralMandataire[]> {
    await delay(150);
    return getStored(STORAGE_KEY_MANDATAIRES, ELECTORAL_MANDATAIRES);
  },

  async saveMandataire(mandataire: ElectoralMandataire): Promise<ElectoralMandataire[]> {
    await delay(150);
    const mandataires = getStored(STORAGE_KEY_MANDATAIRES, ELECTORAL_MANDATAIRES);
    const idx = mandataires.findIndex((m) => m.id === mandataire.id);
    if (idx >= 0) mandataires[idx] = mandataire;
    else mandataires.unshift(mandataire);
    setStored(STORAGE_KEY_MANDATAIRES, mandataires);
    return mandataires;
  },

  async deleteMandataire(id: string): Promise<ElectoralMandataire[]> {
    await delay(150);
    const mandataires = getStored<ElectoralMandataire[]>(STORAGE_KEY_MANDATAIRES, ELECTORAL_MANDATAIRES).filter((m) => m.id !== id);
    setStored(STORAGE_KEY_MANDATAIRES, mandataires);
    return mandataires;
  },

  // Mandates V2
  async mandates(): Promise<ElectoralMandate[]> {
    await delay(150);
    return getStored(STORAGE_KEY_MANDATES, ELECTORAL_MANDATES);
  },

  async getMandateForUser(mandataireId?: string, partyId?: string, candidateId?: string): Promise<ElectoralMandate | null> {
    await delay(150);
    const list = getStored(STORAGE_KEY_MANDATES, ELECTORAL_MANDATES);
    if (mandataireId) {
      const found = list.find((m) => m.mandataireId === mandataireId || m.id === mandataireId);
      if (found) return found;
    }
    if (candidateId) {
      const found = list.find((m) => m.representedEntityId === candidateId);
      if (found) return found;
    }
    if (partyId) {
      const found = list.find((m) => m.representedEntityId === partyId);
      if (found) return found;
    }
    return list[0] || null;
  },


  // Mandataire Remarks & Tally
  async remarks(): Promise<MandataireRemark[]> {
    await delay(150);
    return getStored(STORAGE_KEY_REMARKS, MANDATAIRE_REMARKS);
  },

  async addRemark(remark: MandataireRemark): Promise<MandataireRemark[]> {
    await delay(150);
    const remarks = getStored(STORAGE_KEY_REMARKS, MANDATAIRE_REMARKS);
    remarks.unshift(remark);
    setStored(STORAGE_KEY_REMARKS, remarks);
    return remarks;
  },

  // APK Agents
  async apkAgents(): Promise<ApkAgentUser[]> {
    await delay(150);
    return getStored(STORAGE_KEY_APK_AGENTS, APK_AGENT_USERS);
  },

  async saveApkAgent(agent: ApkAgentUser): Promise<ApkAgentUser[]> {
    await delay(150);
    const agents = getStored(STORAGE_KEY_APK_AGENTS, APK_AGENT_USERS);
    const idx = agents.findIndex((a) => a.id === agent.id);
    if (idx >= 0) agents[idx] = agent;
    else agents.unshift(agent);
    setStored(STORAGE_KEY_APK_AGENTS, agents);
    return agents;
  },

  async deleteApkAgent(id: string): Promise<ApkAgentUser[]> {
    await delay(150);
    const agents = getStored<ApkAgentUser[]>(STORAGE_KEY_APK_AGENTS, APK_AGENT_USERS).filter((a) => a.id !== id);
    setStored(STORAGE_KEY_APK_AGENTS, agents);
    return agents;
  },

  // Devices
  async devices(): Promise<AdminDevice[]> {
    await delay(150);
    return getStored(STORAGE_KEY_DEVICES, ADMIN_DEVICES);
  },

  async updateDeviceStatus(id: string, status: AdminDevice['status'], compromised = false, reason?: string): Promise<AdminDevice[]> {
    await delay(150);
    const devices = getStored(STORAGE_KEY_DEVICES, ADMIN_DEVICES);
    const dev = devices.find((d) => d.id === id);
    if (dev) {
      dev.status = status;
      dev.compromised = compromised;
      if (reason) dev.compromiseReason = reason;
      setStored(STORAGE_KEY_DEVICES, devices);
    }
    return devices;
  },

  // CEP Admin Users & Roles
  async users(): Promise<AdminUser[]> {
    await delay(150);
    return getStored(STORAGE_KEY_USERS, ADMIN_USERS);
  },

  async saveUser(user: AdminUser): Promise<AdminUser[]> {
    await delay(150);
    const users = getStored(STORAGE_KEY_USERS, ADMIN_USERS);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.unshift(user);
    setStored(STORAGE_KEY_USERS, users);
    return users;
  },

  async deleteUser(id: string): Promise<AdminUser[]> {
    await delay(150);
    const users = getStored<AdminUser[]>(STORAGE_KEY_USERS, ADMIN_USERS).filter((u) => u.id !== id);
    setStored(STORAGE_KEY_USERS, users);
    return users;
  },

  async roles(): Promise<AdminRole[]> {
    await delay(150);
    return getStored(STORAGE_KEY_ROLES, INITIAL_ADMIN_ROLES);
  },

  async saveRole(role: AdminRole): Promise<AdminRole[]> {
    await delay(150);
    const roles = getStored(STORAGE_KEY_ROLES, INITIAL_ADMIN_ROLES);
    const idx = roles.findIndex((r) => r.id === role.id);
    if (idx >= 0) roles[idx] = role;
    else roles.unshift(role);
    setStored(STORAGE_KEY_ROLES, roles);
    return roles;
  },

  async deleteRole(id: string): Promise<AdminRole[]> {
    await delay(150);
    const roles = getStored<AdminRole[]>(STORAGE_KEY_ROLES, INITIAL_ADMIN_ROLES).filter((r) => r.id !== id);
    setStored(STORAGE_KEY_ROLES, roles);
    return roles;
  },

  getActiveUser(): AdminUser {
    return getStored<AdminUser>(STORAGE_KEY_USERS, ADMIN_USERS[0]!);
  },

  setActiveUser(user: AdminUser): void {
    setStored(STORAGE_KEY_USERS, user);
  },

  async incidents() { await delay(150); return ADMIN_INCIDENTS; },
  async audit() { await delay(150); return ADMIN_AUDIT; },
  async releases() { await delay(150); return ADMIN_RELEASES; },
};


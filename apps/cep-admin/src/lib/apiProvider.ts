/**
 * CEP ADMIN V3 — Production ApiProvider connecting to Django DRF REST API.
 * Falls back to demoDataProvider when Django API is offline or when running in Demo Mode.
 */
import type { DataProvider } from './dataProvider';
import { demoDataProvider } from './dataProvider';
import type { UserAccount, AdminElection, AdminCandidate, PoliticalParty, ElectoralMandataire, ElectoralMandate, AdminDevice } from './mockData';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cep_access_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Request Error [${response.status}]: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export const apiDataProvider: DataProvider = {
  async login(username, password) {
    try {
      const res = await fetchApi<{ access: string; refresh: string }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('cep_access_token', res.access);
      localStorage.setItem('cep_refresh_token', res.refresh);

      const me = await fetchApi<any>('/auth/me/');
      const user: UserAccount = {
        id: me.id,
        username: me.username,
        password: '',
        fullName: `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username,
        role: me.role,
        roleTitle: me.role,
        permissions: me.permissions || [],
        scope: me.scope || { isGlobal: true },
      };

      localStorage.setItem('cep_current_user', JSON.stringify(user));
      return { success: true, user };
    } catch {
      return demoDataProvider.login(username, password);
    }
  },

  async logout() {
    localStorage.removeItem('cep_access_token');
    localStorage.removeItem('cep_refresh_token');
    localStorage.removeItem('cep_current_user');
    await demoDataProvider.logout();
  },

  getCurrentSession() {
    const stored = localStorage.getItem('cep_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return demoDataProvider.getCurrentSession();
      }
    }
    return demoDataProvider.getCurrentSession();
  },

  async getElections() {
    try {
      return await fetchApi<AdminElection[]>('/elections/');
    } catch {
      return demoDataProvider.getElections();
    }
  },

  async saveElection(election) {
    return demoDataProvider.saveElection(election);
  },

  async deleteElection(id) {
    return demoDataProvider.deleteElection(id);
  },

  async getCandidates() {
    try {
      return await fetchApi<AdminCandidate[]>('/candidates/');
    } catch {
      return demoDataProvider.getCandidates();
    }
  },

  async saveCandidate(candidate) {
    return demoDataProvider.saveCandidate(candidate);
  },

  async deleteCandidate(id) {
    return demoDataProvider.deleteCandidate(id);
  },

  async getParties() {
    try {
      return await fetchApi<PoliticalParty[]>('/parties/');
    } catch {
      return demoDataProvider.getParties();
    }
  },

  async saveParty(party) {
    return demoDataProvider.saveParty(party);
  },

  async deleteParty(id) {
    return demoDataProvider.deleteParty(id);
  },

  async getMandataires() {
    try {
      return await fetchApi<ElectoralMandataire[]>('/mandates/');
    } catch {
      return demoDataProvider.getMandataires();
    }
  },

  async saveMandataire(mandataire) {
    return demoDataProvider.saveMandataire(mandataire);
  },

  async deleteMandataire(id) {
    return demoDataProvider.deleteMandataire(id);
  },

  async getMandates() {
    return demoDataProvider.getMandates();
  },

  async getMandateForUser(mandataireId, partyId, candidateId) {
    return demoDataProvider.getMandateForUser(mandataireId, partyId, candidateId);
  },

  async getRemarks() {
    return demoDataProvider.getRemarks();
  },

  async addRemark(remark) {
    return demoDataProvider.addRemark(remark);
  },

  async getApkAgents() {
    return demoDataProvider.getApkAgents();
  },

  async saveApkAgent(agent) {
    return demoDataProvider.saveApkAgent(agent);
  },

  async deleteApkAgent(id) {
    return demoDataProvider.deleteApkAgent(id);
  },

  async getDevices() {
    try {
      return await fetchApi<AdminDevice[]>('/devices/');
    } catch {
      return demoDataProvider.getDevices();
    }
  },

  async updateDeviceStatus(id, status, compromised, reason) {
    return demoDataProvider.updateDeviceStatus(id, status, compromised, reason);
  },

  async getUsers() {
    return demoDataProvider.getUsers();
  },

  async saveUser(user) {
    return demoDataProvider.saveUser(user);
  },

  async deleteUser(id) {
    return demoDataProvider.deleteUser(id);
  },

  async getRoles() {
    return demoDataProvider.getRoles();
  },

  async saveRole(role) {
    return demoDataProvider.saveRole(role);
  },

  async deleteRole(id) {
    return demoDataProvider.deleteRole(id);
  },

  async getIncidents() {
    return demoDataProvider.getIncidents();
  },

  async getAuditEvents() {
    return demoDataProvider.getAuditEvents();
  },

  async getReleases() {
    return demoDataProvider.getReleases();
  },
};

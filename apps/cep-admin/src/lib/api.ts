import {
  ADMIN_AUDIT,
  ADMIN_CANDIDATES,
  ADMIN_DEVICES,
  ADMIN_ELECTIONS,
  ADMIN_INCIDENTS,
  ADMIN_RELEASES,
  ADMIN_USERS,
} from './mockData';
import type {
  AdminCandidate,
  AdminDevice,
  AdminElection,
  AdminUser,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY_ELECTIONS = 'cep_admin_elections_v1';
const STORAGE_KEY_CANDIDATES = 'cep_admin_candidates_v1';
const STORAGE_KEY_DEVICES = 'cep_admin_devices_v1';
const STORAGE_KEY_USERS = 'cep_admin_users_v1';
const STORAGE_KEY_ACTIVE_USER = 'cep_admin_active_user_v1';

function getStoredElections(): AdminElection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ELECTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ADMIN_ELECTIONS;
}

function saveElections(elections: AdminElection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ELECTIONS, JSON.stringify(elections));
  } catch {}
}

function getStoredCandidates(): AdminCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANDIDATES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ADMIN_CANDIDATES;
}

function saveCandidates(candidates: AdminCandidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
  } catch {}
}

function getStoredDevices(): AdminDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ADMIN_DEVICES;
}

function saveDevices(devices: AdminDevice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
  } catch {}
}

function getStoredUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ADMIN_USERS;
}

/** Client API admin simulé (démo). En production : appels DRF avec JWT/RBAC. */
export const adminApi = {
  async elections(): Promise<AdminElection[]> {
    await delay(150);
    return getStoredElections();
  },

  async saveElection(election: AdminElection): Promise<AdminElection[]> {
    await delay(150);
    const elections = getStoredElections();
    const existingIndex = elections.findIndex((e) => e.id === election.id);
    if (existingIndex >= 0) {
      elections[existingIndex] = election;
    } else {
      elections.unshift(election);
    }
    saveElections(elections);
    return elections;
  },

  async deleteElection(id: string): Promise<AdminElection[]> {
    await delay(150);
    const elections = getStoredElections().filter((e) => e.id !== id);
    saveElections(elections);
    return elections;
  },

  async candidates(): Promise<AdminCandidate[]> {
    await delay(150);
    return getStoredCandidates();
  },

  async saveCandidate(candidate: AdminCandidate): Promise<AdminCandidate[]> {
    await delay(150);
    const candidates = getStoredCandidates();
    const existingIndex = candidates.findIndex((c) => c.id === candidate.id);
    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate;
    } else {
      candidates.unshift(candidate);
    }
    saveCandidates(candidates);
    return candidates;
  },

  async deleteCandidate(id: string): Promise<AdminCandidate[]> {
    await delay(150);
    const candidates = getStoredCandidates().filter((c) => c.id !== id);
    saveCandidates(candidates);
    return candidates;
  },

  async devices(): Promise<AdminDevice[]> {
    await delay(150);
    return getStoredDevices();
  },

  async updateDeviceStatus(id: string, status: AdminDevice['status'], compromised = false, reason?: string): Promise<AdminDevice[]> {
    await delay(150);
    const devices = getStoredDevices();
    const dev = devices.find((d) => d.id === id);
    if (dev) {
      dev.status = status;
      dev.compromised = compromised;
      if (reason) dev.compromiseReason = reason;
      saveDevices(devices);
    }
    return devices;
  },

  async users(): Promise<AdminUser[]> {
    await delay(150);
    return getStoredUsers();
  },

  getActiveUser(): AdminUser {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (raw) return JSON.parse(raw);
    } catch {}
    return ADMIN_USERS[0]!;
  },

  setActiveUser(user: AdminUser): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
    } catch {}
  },

  async incidents() { await delay(150); return ADMIN_INCIDENTS; },
  async audit() { await delay(150); return ADMIN_AUDIT; },
  async releases() { await delay(150); return ADMIN_RELEASES; },
};

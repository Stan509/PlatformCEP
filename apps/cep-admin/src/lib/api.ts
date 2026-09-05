import {
  ADMIN_AUDIT,
  ADMIN_CANDIDATES,
  ADMIN_DEVICES,
  ADMIN_ELECTIONS,
  ADMIN_INCIDENTS,
  ADMIN_RELEASES,
} from './mockData';
import type {
  AdminCandidate,
  AdminElection,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY_ELECTIONS = 'cep_admin_elections_v1';
const STORAGE_KEY_CANDIDATES = 'cep_admin_candidates_v1';

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

/** Client API admin simulé (démo). En production : appels DRF avec JWT/RBAC. */
export const adminApi = {
  async elections(): Promise<AdminElection[]> {
    await delay(200);
    return getStoredElections();
  },

  async saveElection(election: AdminElection): Promise<AdminElection[]> {
    await delay(200);
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
    await delay(200);
    const elections = getStoredElections().filter((e) => e.id !== id);
    saveElections(elections);
    return elections;
  },

  async candidates(): Promise<AdminCandidate[]> {
    await delay(200);
    return getStoredCandidates();
  },

  async saveCandidate(candidate: AdminCandidate): Promise<AdminCandidate[]> {
    await delay(200);
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
    await delay(200);
    const candidates = getStoredCandidates().filter((c) => c.id !== id);
    saveCandidates(candidates);
    return candidates;
  },

  async devices() { await delay(200); return ADMIN_DEVICES; },
  async incidents() { await delay(200); return ADMIN_INCIDENTS; },
  async audit() { await delay(200); return ADMIN_AUDIT; },
  async releases() { await delay(200); return ADMIN_RELEASES; },
};

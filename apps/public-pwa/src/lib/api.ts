import type { Candidate, Election, ElectionResult } from '@cep/shared-types';
import { DEMO_CANDIDATES, DEMO_ELECTIONS, DEMO_RESULTS } from './mockData';

/**
 * Client API simulé (mode démo). En production, remplace par des appels
 * `fetch` vers l'API Django (`/api/elections`, `/api/candidates`, ...).
 * Chaque fonction simule une latence réseau pour exercer les états UI.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async elections(): Promise<Election[]> {
    await delay(450);
    return DEMO_ELECTIONS;
  },
  async candidates(): Promise<Candidate[]> {
    await delay(450);
    return DEMO_CANDIDATES;
  },
  async results(): Promise<ElectionResult[]> {
    await delay(450);
    return DEMO_RESULTS; // vide -> état empty (résultats pas encore publiés)
  },
  async checkStatus(reference: string): Promise<{ found: boolean; reference: string }> {
    await delay(600);
    // Démo : un matricule préfixé "DEMO" simule un électeur enregistré
    // (donnée fictive). Aucun matricule réel n'est utilisé (privacy by design).
    return { found: reference.toUpperCase().startsWith('DEMO'), reference };
  },
};

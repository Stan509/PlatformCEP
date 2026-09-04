import type { Candidate, Election, ElectionResult } from '@cep/shared-types';

/**
 * Données de DÉMONSTRATION — totalement fictives.
 * ⚠️ Aucune donnée citoyenne réelle. En production, ces données proviennent de
 * l'API Django (`/api/elections`, `/api/candidates`, `/api/results`).
 */

export const DEMO_ELECTIONS: Election[] = [
  {
    electionId: 'demo-2026',
    name: { ht: 'Eleksyon Demo 2026', fr: 'Élection Démo 2026', en: 'Demo Election 2026' },
    electionType: 'demo_2026',
    status: 'OPEN',
    legalConfiguration: 'DEMO',
    startDate: '2026-09-02T08:00:00Z',
    endDate: '2026-09-02T18:00:00Z',
    territoryRules: [{ level: 'commune', post: 'representative', scope: 'commune', assign: 'commune' }],
    eligibilityRules: {},
    votingRules: { modalities: ['physical'] },
    countingRules: {},
    publicationRules: {},
  },
];

export const DEMO_CANDIDATES: Candidate[] = [
  { candidateRef: 'cand-001', firstName: 'Demo', lastName: 'Personne A', partyRef: 'DEMO', post: 'representative', territory: 'commune', ballotIndex: 1, status: 'PUBLISHED' },
  { candidateRef: 'cand-002', firstName: 'Demo', lastName: 'Personne B', partyRef: 'DEMO', post: 'representative', territory: 'commune', ballotIndex: 2, status: 'PUBLISHED' },
  { candidateRef: 'cand-003', firstName: 'Demo', lastName: 'Personne C', partyRef: 'DEMO', post: 'representative', territory: 'commune', ballotIndex: 3, status: 'PUBLISHED' },
];

export const DEMO_PARTIES = [{ partyRef: 'DEMO', name: { ht: 'Patri Demo', fr: 'Parti Démo', en: 'Demo Party' }, acronym: 'DEMO' }];

export const DEMO_RESULTS: ElectionResult[] = [];

import type { Candidate, Election, ElectionResult, DermalogVoter } from '@cep/shared-types';

/**
 * Registre des données électorales et biométriques d'Haïti — CEP (Démo).
 */

export const HAITI_DEPARTMENTS = [
  { code: 'OU', name: 'Ouest', communes: ['Port-au-Prince', 'Pétion-Ville', 'Delmas', 'Carrefour', 'Tabarre'] },
  { code: 'AR', name: 'Artibonite', communes: ['Gonaïves', 'Saint-Marc', 'Petite-Rivière-de-l\'Artibonite'] },
  { code: 'ND', name: 'Nord', communes: ['Cap-Haïtien', 'Limonade', 'Plaine-du-Nord'] },
  { code: 'SD', name: 'Sud', communes: ['Les Cayes', 'Aquin', 'Port-Salut'] },
  { code: 'GA', name: 'Grand\'Anse', communes: ['Jérémie', 'Anse-d\'Hainault'] },
  { code: 'CE', name: 'Centre', communes: ['Hinche', 'Mirebalais'] },
  { code: 'NE', name: 'Nord-Est', communes: ['Fort-Liberté', 'Ouanaminthe'] },
  { code: 'NO', name: 'Nord-Ouest', communes: ['Port-de-Paix', 'Saint-Louis-du-Nord'] },
  { code: 'SE', name: 'Sud-Est', communes: ['Jacmel', 'Bainet'] },
  { code: 'NI', name: 'Nippes', communes: ['Miragoâne', 'Anse-à-Veau'] },
];

export const HAITI_DEPARTMENTS_AND_COMMUNES: Record<string, string[]> = HAITI_DEPARTMENTS.reduce((acc, d) => {
  acc[d.name] = d.communes;
  return acc;
}, {} as Record<string, string[]>);

export const DIASPORA_COUNTRIES = [
  'États-Unis (Miami, FL)',
  'États-Unis (New York, NY)',
  'États-Unis (Boston, MA)',
  'Canada (Montréal, QC)',
  'France (Paris / Île-de-France)',
  'République Dominicaine (Santo Domingo)',
  'Chili (Santiago)',
  'Brésil (São Paulo)',
  'Autre pays (Consulat Général)',
];

export const DEMO_ELECTIONS: Election[] = [
  {
    electionId: 'haiti-general-2026',
    title: 'Élections Générales d\'Haïti 2026',
    type: 'PRESIDENTIAL',
    name: {
      ht: 'Eleksyon Jeneral Haïti 2026 (Prezidan, Senatè, Depite, Majistra)',
      fr: 'Élections Générales d\'Haïti 2026 (Président, Sénateurs, Députés, Maires)',
      en: 'Haiti General Elections 2026 (President, Senators, Deputies, Mayors)'
    },
    electionType: 'general_2026',
    status: 'OPEN',
    legalConfiguration: 'CONSTITUTION_1987',
    startDate: '2026-09-01T06:00:00Z',
    endDate: '2026-09-30T18:00:00Z',
    territoryRules: [
      { level: 'country', post: 'president', scope: 'country', assign: 'country' },
      { level: 'department', post: 'senator', scope: 'department', assign: 'department' },
      { level: 'commune', post: 'mayor', scope: 'commune', assign: 'commune' },
    ],
    eligibilityRules: {},
    votingRules: { modalities: ['digital_biometric', 'physical'] },
    countingRules: {},
    publicationRules: {},
  },
  {
    electionId: 'referendum-2026',
    title: 'Référendum Constitutionnel 2026',
    type: 'REFERENDUM',
    name: {
      ht: 'Riferandòm Konstitisyonèl 2026',
      fr: 'Référendum Constitutionnel 2026',
      en: 'Constitutional Referendum 2026'
    },
    electionType: 'referendum',
    status: 'OPEN',
    legalConfiguration: 'REFERENDUM',
    startDate: '2026-09-01T06:00:00Z',
    endDate: '2026-09-30T18:00:00Z',
    territoryRules: [{ level: 'country', post: 'referendum', scope: 'country', assign: 'country' }],
    eligibilityRules: {},
    votingRules: { modalities: ['digital_biometric'] },
    countingRules: {},
    publicationRules: {},
  }
];

export const DEMO_PARTIES = [
  { partyRef: 'RDH', name: { ht: 'Rasanbleman Demokratik Ayisyen (RDH)', fr: 'Rassemblement Démocratique Haïtien (RDH)', en: 'Haitian Democratic Rally (RDH)' }, acronym: 'RDH' },
  { partyRef: 'MPH', name: { ht: 'Mouvman Patriyotik d\'Ayiti (MPH)', fr: 'Mouvement Patriotique d\'Haïti (MPH)', en: 'Haitian Patriotic Movement (MPH)' }, acronym: 'MPH' },
  { partyRef: 'APR', name: { ht: 'Alyans Pou Renesans (APR)', fr: 'Alliance Pour la Renaissance (APR)', en: 'Alliance For Renaissance (APR)' }, acronym: 'APR' },
];

export const DEMO_CANDIDATES: Candidate[] = [
  // Président
  { id: 'pres-01', candidateRef: 'pres-01', firstName: 'Jean-Baptiste', lastName: 'ALEXANDRE', party: 'Rassemblement Démocratique Haïtien', partyAcronym: 'RDH', partyRef: 'RDH', slogan: 'Yon lòt Ayiti posib ak travay ak sekirite', post: 'PRESIDENT', territory: 'Haïti (National)', territoryScope: 'NATIONAL', ballotIndex: 1, status: 'PUBLISHED' },
  { id: 'pres-02', candidateRef: 'pres-02', firstName: 'Marie-Lourdes', lastName: 'CÉLESTIN', party: 'Mouvement Patriotique d\'Haïti', partyAcronym: 'MPH', partyRef: 'MPH', slogan: 'Justice, Éducation et Unité Nationale', post: 'PRESIDENT', territory: 'Haïti (National)', territoryScope: 'NATIONAL', ballotIndex: 2, status: 'PUBLISHED' },
  { id: 'pres-03', candidateRef: 'pres-03', firstName: 'Fritz-Gerald', lastName: 'PIERRE', party: 'Alliance Pour la Renaissance', partyAcronym: 'APR', partyRef: 'APR', slogan: 'Moderne, Prospère et Indépendante', post: 'PRESIDENT', territory: 'Haïti (National)', territoryScope: 'NATIONAL', ballotIndex: 3, status: 'PUBLISHED' },

  // Sénateurs (Ouest)
  { id: 'sen-ou-01', candidateRef: 'sen-ou-01', firstName: 'Claudy', lastName: 'JOSEPH', party: 'RDH', partyAcronym: 'RDH', partyRef: 'RDH', slogan: 'Protecteur de l\'Ouest', post: 'SENATOR', territory: 'Ouest', territoryScope: 'DEPARTMENT', department: 'Ouest', ballotIndex: 1, status: 'PUBLISHED' },
  { id: 'sen-ou-02', candidateRef: 'sen-ou-02', firstName: 'Sabine', lastName: 'HYPPOLITE', party: 'MPH', partyAcronym: 'MPH', partyRef: 'MPH', slogan: 'Voix du peuple de l\'Ouest', post: 'SENATOR', territory: 'Ouest', territoryScope: 'DEPARTMENT', department: 'Ouest', ballotIndex: 2, status: 'PUBLISHED' },

  // Sénateurs (Artibonite)
  { id: 'sen-ar-01', candidateRef: 'sen-ar-01', firstName: 'Dieudonné', lastName: 'CHARLES', party: 'APR', partyAcronym: 'APR', partyRef: 'APR', slogan: 'Développement agricole et justice', post: 'SENATOR', territory: 'Artibonite', territoryScope: 'DEPARTMENT', department: 'Artibonite', ballotIndex: 1, status: 'PUBLISHED' },
  { id: 'sen-ar-02', candidateRef: 'sen-ar-02', firstName: 'Roseline', lastName: 'DUVAL', party: 'RDH', partyAcronym: 'RDH', partyRef: 'RDH', slogan: 'L\'Artibonite debout', post: 'SENATOR', territory: 'Artibonite', territoryScope: 'DEPARTMENT', department: 'Artibonite', ballotIndex: 2, status: 'PUBLISHED' },

  // Maires / Magistrats (Pétion-Ville)
  { id: 'mag-pap-01', candidateRef: 'mag-pap-01', firstName: 'Michel-Ange', lastName: 'FORTUNÉ', party: 'Cartel Renouveau Pétion-Ville', partyAcronym: 'RDH', partyRef: 'RDH', slogan: 'Propreté, Sécurité et Modernité', post: 'MAYOR', territory: 'Pétion-Ville', territoryScope: 'COMMUNE', commune: 'Pétion-Ville', department: 'Ouest', ballotIndex: 1, status: 'PUBLISHED' },
  { id: 'mag-pap-02', candidateRef: 'mag-pap-02', firstName: 'Yvrose', lastName: 'JEAN-GILLES', party: 'Cartel Union Communale', partyAcronym: 'MPH', partyRef: 'MPH', slogan: 'Ensemble pour Pétion-Ville', post: 'MAYOR', territory: 'Pétion-Ville', territoryScope: 'COMMUNE', commune: 'Pétion-Ville', department: 'Ouest', ballotIndex: 2, status: 'PUBLISHED' },

  // Maires / Magistrats (Gonaïves)
  { id: 'mag-gon-01', candidateRef: 'mag-gon-01', firstName: 'Jacques-Edouard', lastName: 'LUC', party: 'APR', partyAcronym: 'APR', partyRef: 'APR', slogan: 'Gonaïves Ville d\'Histoire et de Progrès', post: 'MAYOR', territory: 'Gonaïves', territoryScope: 'COMMUNE', commune: 'Gonaïves', department: 'Artibonite', ballotIndex: 1, status: 'PUBLISHED' },

  // Référendum
  { id: 'ref-yes', candidateRef: 'ref-yes', firstName: 'WI / OUI', lastName: '(Adopte la nouvelle Constitution)', party: 'Option Référendaire', partyAcronym: 'OUI', partyRef: 'RDH', slogan: 'Votez OUI', post: 'REFERENDUM', territory: 'Haïti (National)', territoryScope: 'NATIONAL', ballotIndex: 1, status: 'PUBLISHED' },
  { id: 'ref-no', candidateRef: 'ref-no', firstName: 'NON / NON', lastName: '(Rejette la proposition)', party: 'Option Référendaire', partyAcronym: 'NON', partyRef: 'MPH', slogan: 'Votez NON', post: 'REFERENDUM', territory: 'Haïti (National)', territoryScope: 'NATIONAL', ballotIndex: 2, status: 'PUBLISHED' },
];

const e0 = DEMO_ELECTIONS[0];
if (e0) e0.candidates = DEMO_CANDIDATES;

const e1 = DEMO_ELECTIONS[1];
if (e1) e1.candidates = DEMO_CANDIDATES.filter(c => c.post === 'REFERENDUM');

export const sampleElections = DEMO_ELECTIONS;
export const sampleCandidates = DEMO_CANDIDATES;

export const DEMO_DERMALOG_VOTERS: DermalogVoter[] = [
  {
    nin: '004-123-456-7',
    nif: '104-556-778-9',
    fullName: 'Jean-Baptiste Alexis',
    firstName: 'Jean-Baptiste',
    lastName: 'Alexis',
    birthDate: '1995-04-12',
    dateOfBirth: '1995-04-12',
    gender: 'M',
    cartePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    facePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isBiometricVerified: true,
    department: 'Ouest',
    commune: 'Pétion-Ville',
    sectionCommunale: '1ère Section Morne-à-Tuf',
    address: 'Rue Pinchinat, Pétion-Ville, Haïti',
    isDiaspora: false,
    hasVotedElections: {},
  },
  {
    nin: '001-987-654-3',
    nif: '101-223-445-6',
    fullName: 'Marie-Florence Jean',
    firstName: 'Marie-Florence',
    lastName: 'Jean',
    birthDate: '1990-08-25',
    dateOfBirth: '1990-08-25',
    gender: 'F',
    cartePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    facePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    isBiometricVerified: true,
    department: 'Artibonite',
    commune: 'Gonaïves',
    sectionCommunale: '2ème Section Desdunes',
    address: 'Avenue des Dattes, Gonaïves, Haïti',
    isDiaspora: false,
    hasVotedElections: { 'haiti-general-2026': true }, // Déjà voté
  },
  {
    nin: 'PASSPORT-PA-998877',
    nif: '109-887-665-2',
    fullName: 'Jean-Claude Duval',
    firstName: 'Jean-Claude',
    lastName: 'Duval',
    birthDate: '1988-11-03',
    dateOfBirth: '1988-11-03',
    gender: 'M',
    cartePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    facePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isBiometricVerified: true,
    department: 'Diaspora',
    commune: 'États-Unis (Miami, FL)',
    address: 'Little Haiti, Miami, FL, USA',
    isDiaspora: true,
    passportNumber: 'PA-998877',
    countryOfResidence: 'États-Unis (Miami, FL)',
    consularZone: 'Consulat Général d\'Haïti à Miami',
    hasVotedElections: {},
  }
];

export const sampleDermalogVoters = DEMO_DERMALOG_VOTERS;
export const DEMO_RESULTS: ElectionResult[] = [];

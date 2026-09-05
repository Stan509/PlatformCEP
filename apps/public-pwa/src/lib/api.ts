import type { Candidate, Election, ElectionResult, DermalogVoter, BiometricVerificationResult, CastVotePayload } from '@cep/shared-types';
import { DEMO_CANDIDATES, DEMO_ELECTIONS, DEMO_DERMALOG_VOTERS, DEMO_RESULTS } from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Base de données locale de démo (persistant pendant la session navigateur)
const voterRegistry: DermalogVoter[] = [...DEMO_DERMALOG_VOTERS];
const candidatesList: Candidate[] = [...DEMO_CANDIDATES];

export const api = {
  async elections(): Promise<Election[]> {
    await delay(300);
    return DEMO_ELECTIONS;
  },

  async candidates(): Promise<Candidate[]> {
    await delay(300);
    return candidatesList;
  },

  async results(): Promise<ElectionResult[]> {
    await delay(300);
    return DEMO_RESULTS;
  },

  // Validation stricte de la Carte d'Identité Unique Dermalog® (Série émise sous Jovenel Moïse)
  validateDermalogMoiseCard(nin: string): { isValid: boolean; reason?: string } {
    const cleaned = nin.trim().replace(/[\s-]/g, '');

    // Support passeport diaspora
    if (nin.toUpperCase().startsWith('PASSPORT') || nin.toUpperCase().startsWith('PA-')) {
      return { isValid: true };
    }

    // Anciennes cartes rose ou cartes de 9 chiffres (legacy pré-2018 non Dermalog)
    if (cleaned.length === 9 || !/^\d{10}$/.test(cleaned)) {
      return {
        isValid: false,
        reason: "❌ Kat sa a pa konfòm oswa li obsolèt. Sèlman Kat Idantite Unik Dermalog® (ki te fèt anba administrasyon Prezidan Jovenel Moïse ak nimerotasyon ONI 10 chif ak puce) ki valab pou w vote.\n\n❌ Carte non conforme ou obsolète. Seule la Carte d'Identité Unique Dermalog® officielle (émise sous l'administration du Président Jovenel Moïse - NIF/CIN 10 chiffres avec puce biométrique ONI) est acceptée."
      };
    }

    // Doit commencer par une série ONI Dermalog valide (001, 004, 009, 101, 104, 109, etc.)
    const validPrefixes = ['001', '004', '009', '101', '104', '109'];
    const prefix = cleaned.substring(0, 3);
    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        reason: "❌ Série de carte non reconnue par le registre ONI Dermalog® (Jovenel Moïse). Veuillez effectuer la mise à jour de votre carte dans un bureau ONI."
      };
    }

    return { isValid: true };
  },

  // Recherche d'électeur par NIN / Carte Dermalog
  async getVoterByNIN(nin: string): Promise<DermalogVoter | null> {
    await delay(400);
    const cleanNin = nin.trim().replace(/\s+/g, '');
    const found = voterRegistry.find(
      (v) => v.nin.replace(/\s+/g, '') === cleanNin || v.nin.replace(/-/g, '') === cleanNin.replace(/-/g, '')
    );
    return found ? { ...found } : null;
  },

  // Recherche d'électeur Diaspora par Numéro de Passeport Haïtien
  async getVoterByPassport(passport: string): Promise<DermalogVoter | null> {
    await delay(400);
    const cleanPassport = passport.trim().toUpperCase();
    const found = voterRegistry.find(
      (v) => v.passportNumber && v.passportNumber.trim().toUpperCase() === cleanPassport
    );
    return found ? { ...found } : null;
  },

  // Filtrage intelligent des candidats selon le lieu de résidence de l'électeur
  getCandidatesForVoter(voter: DermalogVoter, electionId: string = 'haiti-general-2026') {
    const el = DEMO_ELECTIONS.find(e => e.electionId === electionId || e.id === electionId) || DEMO_ELECTIONS[0];
    const rawCandidates = (el && el.candidates) ? el.candidates : candidatesList;

    const availableCandidates = rawCandidates.filter(c => {
      // Scrutins nationaux (Président, Référendum) : Tous les électeurs d'Haïti et de la Diaspora
      if (c.territoryScope === 'NATIONAL' || c.post === 'PRESIDENT' || c.post === 'REFERENDUM') {
        return true;
      }
      // Scrutins régionaux / Sénatoriaux : Filtrés par Département de résidence
      if (c.territoryScope === 'DEPARTMENT' || c.post === 'SENATOR') {
        return c.department === voter.department || c.territory === voter.department;
      }
      // Scrutins communaux / Législatifs & Magistrats : Filtrés par Commune de résidence
      if (c.territoryScope === 'COMMUNE' || c.post === 'MAYOR' || c.post === 'DEPUTY') {
        return c.commune === voter.commune || c.territory === voter.commune;
      }
      return false;
    });

    // Groupement par poste électif
    const positionsMap: Record<string, { positionLabel: string; candidates: Candidate[] }> = {};
    const labels: Record<string, string> = {
      PRESIDENT: 'Président de la République d\'Haïti',
      SENATOR: `Sénateur de la République (${voter.department})`,
      MAYOR: `Magistrat / Maire (${voter.commune})`,
      DEPUTY: `Député de la Circonscription (${voter.commune})`,
      REFERENDUM: 'Référendum Constitutionnel'
    };

    availableCandidates.forEach(cand => {
      const pos = cand.post;
      if (!positionsMap[pos]) {
        positionsMap[pos] = {
          positionLabel: labels[pos] || pos,
          candidates: []
        };
      }
      positionsMap[pos].candidates.push(cand);
    });

    return Object.entries(positionsMap).map(([position, data]) => ({
      position,
      positionLabel: data.positionLabel,
      candidates: data.candidates
    }));
  },

  // Vérification biométrique faciale (Scanner Live Face vs Carte Dermalog)
  async verifyBiometrics(nin: string, _faceImageBase64?: string): Promise<BiometricVerificationResult> {
    await delay(900);
    const voter = await this.getVoterByNIN(nin);
    if (!voter) {
      return { matched: false, confidenceScore: 0, matchedAt: new Date().toISOString() };
    }
    return {
      matched: true,
      confidenceScore: 98.6,
      matchedAt: new Date().toISOString(),
      voter: { ...voter, isBiometricVerified: true }
    };
  },

  // Vérification complète de l'éligibilité au vote avec rejet des anciennes cartes
  async checkEligibility(nin: string, electionId: string = 'haiti-general-2026') {
    await delay(500);

    // Contrôle de conformité de la carte Dermalog Jovenel Moïse
    const cardValidation = this.validateDermalogMoiseCard(nin);
    if (!cardValidation.isValid) {
      return { status: 'INVALID_CARD' as const, reason: cardValidation.reason };
    }

    const voter = await this.getVoterByNIN(nin);
    if (!voter) {
      return { status: 'NOT_REGISTERED' as const };
    }
    if (voter.hasVotedElections && voter.hasVotedElections[electionId]) {
      return { status: 'ALREADY_VOTED' as const, voter };
    }
    return { status: 'ELIGIBLE_TO_VOTE' as const, voter };
  },

  // Émission d'un bulletin de vote (Scellement anonyme + prévention des doublons)
  async castVote(payload: CastVotePayload): Promise<{ success: boolean; receiptHash: string; timestamp: string }> {
    await delay(800);
    const targetNin = payload.nin || payload.voterNin || '';
    const voterIndex = voterRegistry.findIndex(
      (v) => v.nin.replace(/[- ]/g, '') === targetNin.replace(/[- ]/g, '')
    );

    if (voterIndex === -1) {
      throw new Error("Électeur non inscrit dans la base Dermalog CEP.");
    }

    const voter = voterRegistry[voterIndex]!;
    if (voter.hasVotedElections && voter.hasVotedElections[payload.electionId]) {
      throw new Error("Vous avez déjà émis un vote pour cette élection.");
    }

    // Mise à jour de l'émargement de l'électeur (marqué comme ayant voté)
    voterRegistry[voterIndex] = {
      ...voter,
      hasVotedElections: {
        ...voter.hasVotedElections,
        [payload.electionId]: true
      }
    };

    // Génération d'une preuve cryptographique anonyme (Tamper-evident receipt)
    const randomHex = Math.random().toString(36).substring(2, 14).toUpperCase();
    const receiptHash = `CEP-VOTE-2026-${randomHex}-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      receiptHash,
      timestamp: new Date().toISOString()
    };
  },

  // Inscription citoyenne Haïti (Création de carte Dermalog électorale)
  async registerVoter(data: {
    nin?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    department: string;
    commune: string;
    sectionCommunale?: string;
    address?: string;
    nif?: string;
  }): Promise<{ success: boolean; registrationCode: string; voter: DermalogVoter }> {
    await delay(700);
    const nin = data.nin || `00${Math.floor(Math.random() * 9 + 1)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(Math.random() * 9)}`;
    const newVoter: DermalogVoter = {
      nin,
      nif: data.nif || `10${Math.floor(Math.random() * 9 + 1)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(Math.random() * 9)}`,
      fullName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.dateOfBirth,
      dateOfBirth: data.dateOfBirth,
      cartePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      facePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isBiometricVerified: true,
      department: data.department,
      commune: data.commune,
      sectionCommunale: data.sectionCommunale || '1ère Section',
      address: data.address || `${data.commune}, Haïti`,
      isDiaspora: false,
      hasVotedElections: {}
    };
    voterRegistry.push(newVoter);
    const registrationCode = `REG-ONI-${Math.floor(Math.random() * 900000 + 100000)}`;
    return { success: true, registrationCode, voter: newVoter };
  },

  // Inscription Diaspora (Création avec Passeport Haïtien)
  async registerDiasporaVoter(data: {
    passportNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    countryOfResidence: string;
    city?: string;
    consularZone?: string;
  }): Promise<{ success: boolean; registrationCode: string; voter: DermalogVoter }> {
    await delay(700);
    const nin = `PASSPORT-${data.passportNumber.trim().toUpperCase()}`;
    const newDiasporaVoter: DermalogVoter = {
      nin,
      passportNumber: data.passportNumber.trim().toUpperCase(),
      fullName: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.dateOfBirth,
      dateOfBirth: data.dateOfBirth,
      cartePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      facePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isBiometricVerified: true,
      department: 'Diaspora',
      commune: data.countryOfResidence,
      address: `${data.city || 'Ville'}, ${data.countryOfResidence}`,
      isDiaspora: true,
      countryOfResidence: data.countryOfResidence,
      consularZone: data.consularZone || `Consulat Général d'Haïti à ${data.city || data.countryOfResidence}`,
      hasVotedElections: {}
    };
    voterRegistry.push(newDiasporaVoter);
    const registrationCode = `REG-DIASPORA-${Math.floor(Math.random() * 900000 + 100000)}`;
    return { success: true, registrationCode, voter: newDiasporaVoter };
  },

  async checkStatus(reference: string): Promise<{ found: boolean; voter?: DermalogVoter }> {
    await delay(500);
    const foundByNin = await this.getVoterByNIN(reference);
    if (foundByNin) return { found: true, voter: foundByNin };

    const foundByPass = await this.getVoterByPassport(reference);
    if (foundByPass) return { found: true, voter: foundByPass };

    return { found: false };
  },

  // Demandes de transfert de bureau et choix de vote en ligne
  transferRequestsRegistry: [] as Array<{
    requestId: string;
    electorNin: string;
    electorName: string;
    targetModality: 'ONLINE_Z' | 'NOMADIC' | 'OTHER_FIXED';
    reason: string;
    justificationNotes?: string;
    status: 'PENDING_ANALYSIS' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
  }>,

  async submitTransferRequest(data: {
    electorNin: string;
    electorName: string;
    targetModality: 'ONLINE_Z' | 'NOMADIC' | 'OTHER_FIXED';
    reason: string;
    justificationNotes?: string;
  }) {
    await delay(600);
    const requestId = `TRF-REQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReq = {
      requestId,
      electorNin: data.electorNin,
      electorName: data.electorName,
      targetModality: data.targetModality,
      reason: data.reason,
      justificationNotes: data.justificationNotes || '',
      status: 'PENDING_ANALYSIS' as const,
      submittedAt: new Date().toISOString()
    };
    this.transferRequestsRegistry.unshift(newReq);
    return { success: true, request: newReq };
  },

  async getTransferRequestsByNin(nin: string) {
    await delay(300);
    const clean = nin.trim().replace(/[- ]/g, '');
    return this.transferRequestsRegistry.filter(
      (r) => r.electorNin.trim().replace(/[- ]/g, '') === clean
    );
  }
};


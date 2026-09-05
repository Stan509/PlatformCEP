import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StatusIndicator } from '@cep/design-system';
import { api } from '../lib/api';
import { BiometricScanner } from '../components/BiometricScanner';
import { DIASPORA_COUNTRIES } from '../lib/mockData';
import type { DermalogVoter, Candidate } from '@cep/shared-types';
import { sampleElections } from '../lib/mockData';

type Mode = 'menu' | 'register' | 'vote';

export function Diaspora(): JSX.Element {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('menu');

  // Registration state
  const [regPassport, setRegPassport] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regCountry, setRegCountry] = useState(DIASPORA_COUNTRIES[0] || 'États-Unis (Miami, FL)');
  const [regCity, setRegCity] = useState('');
  const [regStep, setRegStep] = useState<'info' | 'biometrics' | 'done'>('info');
  const [tempVoter, setTempVoter] = useState<DermalogVoter | null>(null);
  const [regSuccessRef, setRegSuccessRef] = useState<string | null>(null);

  // Voting state
  const [votePassport, setVotePassport] = useState('PA-998877');
  const [voteStep, setVoteStep] = useState<'auth' | 'biometrics' | 'ballot' | 'success'>('auth');
  const [diasporaVoter, setDiasporaVoter] = useState<DermalogVoter | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [diasporaBallots, setDiasporaBallots] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [receiptHash, setReceiptHash] = useState<string | null>(null);

  // Handle Registration Step 1
  const startBiometricRegistration = () => {
    if (!regPassport.trim() || !regFirstName.trim() || !regLastName.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const mockV: DermalogVoter = {
      nin: `PASSPORT-${regPassport.trim().toUpperCase()}`,
      passportNumber: regPassport.trim().toUpperCase(),
      fullName: `${regFirstName} ${regLastName}`,
      firstName: regFirstName,
      lastName: regLastName,
      birthDate: '1988-04-12',
      dateOfBirth: '1988-04-12',
      gender: 'M',
      department: 'Diaspora',
      commune: regCountry,
      address: `${regCity || 'Ville'}, ${regCountry}`,
      cartePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      facePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isBiometricVerified: true,
      hasVotedElections: {},
      isDiaspora: true,
      countryOfResidence: regCountry
    };
    setTempVoter(mockV);
    setRegStep('biometrics');
  };

  const handleRegistrationComplete = async () => {
    if (!tempVoter) return;
    try {
      const res = await api.registerDiasporaVoter({
        passportNumber: tempVoter.passportNumber!,
        firstName: tempVoter.firstName || 'Citoyen',
        lastName: tempVoter.lastName || 'Diaspora',
        dateOfBirth: tempVoter.dateOfBirth || '1988-04-12',
        countryOfResidence: regCountry,
        city: regCity || 'Capitale'
      });

      if (res.success && res.registrationCode) {
        setRegSuccessRef(res.registrationCode);
        setRegStep('done');
      }
    } catch {
      alert('Erreur lors de l\'enregistrement diaspora.');
    }
  };

  // Handle Voting Auth
  const handleAuthDiaspora = async () => {
    setVoteError(null);
    try {
      const v = await api.getVoterByPassport(votePassport.trim());
      if (!v) {
        setVoteError('Passeport Haïtien non trouvé dans la base électorale de la Diaspora. Veuillez procéder à l\'inscription.');
        return;
      }
      setDiasporaVoter(v);
      setVoteStep('biometrics');
    } catch {
      setVoteError('Erreur de connexion avec le serveur électoral.');
    }
  };

  // Handle Voting Biometrics Success
  const handleDiasporaBiometricSuccess = () => {
    if (!diasporaVoter) return;
    // Diaspora voters vote on NATIONAL elections (e.g. Presidential)
    const presElection = sampleElections.find(e => e.type === 'PRESIDENTIAL' && e.status === 'OPEN');
    if (presElection) {
      const elId = presElection.electionId || presElection.id || 'haiti-general-2026';
      const candidates = api.getCandidatesForVoter(diasporaVoter, elId);
      const allCandidates = candidates.flatMap(c => c.candidates);
      setDiasporaBallots(allCandidates);
    }
    setVoteStep('ballot');
  };

  // Submit Diaspora Vote
  const handleSubmitDiasporaVote = async () => {
    if (!diasporaVoter || !selectedCandidateId) return;
    const presElection = sampleElections.find(e => e.type === 'PRESIDENTIAL');
    if (!presElection) return;

    try {
      const elId = presElection.electionId || presElection.id || 'haiti-general-2026';
      const res = await api.castVote({
        voterNin: diasporaVoter.nin,
        electionId: elId,
        selections: { PRESIDENT: selectedCandidateId }
      });
      if (res.success && res.receiptHash) {
        setReceiptHash(res.receiptHash);
        setVoteStep('success');
      }
    } catch {
      alert('Erreur lors du dépôt du vote diaspora.');
    }
  };

  return (
    <section style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      {/* Banner */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--cep-space-6)' }}>
        <span style={{ 
          background: '#002060', 
          color: '#FFF', 
          padding: '6px 16px', 
          borderRadius: 20, 
          fontSize: 'var(--cep-font-size-small)', 
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          🌐 HAÏTIEN K AP VIV NAN ETRAJE — DIASPORA
        </span>
        <h1 style={{ fontSize: 'var(--cep-font-size-h2)', marginTop: 'var(--cep-space-3)' }}>
          Portail Électoral de la Diaspora Haïtienne
        </h1>
        <p style={{ color: 'var(--cep-color-text-secondary)', maxWidth: 620, margin: 'var(--cep-space-2) auto 0' }}>
          Conformément à la Constitution, les citoyens haïtiens résidant à l'étranger disposent du droit de vote pour les scrutins nationaux (Président de la République & Référendum).
        </p>
      </div>

      {/* Main Mode Switcher */}
      {mode === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <Card title="📑 1. Inscription Électeur Diaspora" body={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem' }}>
                Vous résidez à l'étranger et possédez un passeport haïtien valide ? Enregistrez-vous sur le registre électoral consulaire avec vérification biométrique.
              </p>
              <Button block onClick={() => setMode('register')}>
                S'inscrire comme Électeur Diaspora →
              </Button>
            </div>
          } />

          <Card title="🗳️ 2. Voter en Ligne (Scrutin National)" body={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem' }}>
                Déjà inscrit avec votre passeport haïtien ? Accédez à l'isoloir sécurisé à distance pour exprimer votre vote présidentiel.
              </p>
              <Button block variant="secondary" onClick={() => setMode('vote')}>
                Accéder à l'Isoloir Diaspora →
              </Button>
            </div>
          } />
        </div>
      )}

      {/* REGISTRATION FLOW */}
      {mode === 'register' && (
        <div>
          <Button variant="secondary" onClick={() => { setMode('menu'); setRegStep('info'); }} style={{ marginBottom: '16px' }}>
            ← Retour au menu Diaspora
          </Button>

          {regStep === 'info' && (
            <Card title="Enregistrement Électeur Diaspora (Passeport Haïtien)" body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="cep-label">Numéro de Passeport Haïtien *</label>
                  <input
                    type="text"
                    className="cep-input"
                    placeholder="Ex: PA-998877"
                    value={regPassport}
                    onChange={(e) => setRegPassport(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="cep-label">Prénom *</label>
                    <input
                      type="text"
                      className="cep-input"
                      placeholder="Votre prénom"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="cep-label">Nom de famille *</label>
                    <input
                      type="text"
                      className="cep-input"
                      placeholder="Votre nom"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="cep-label">Pays de résidence *</label>
                    <select
                      className="cep-input"
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      style={{ appearance: 'auto' }}
                    >
                      {DIASPORA_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="cep-label">Ville de résidence *</label>
                    <input
                      type="text"
                      className="cep-input"
                      placeholder="Ex: Miami, Montréal, Paris"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                    />
                  </div>
                </div>

                <Button block onClick={startBiometricRegistration}>
                  Continuer vers la Capture Biométrique →
                </Button>
              </div>
            } />
          )}

          {regStep === 'biometrics' && tempVoter && (
            <BiometricScanner
              voter={tempVoter}
              onVerified={handleRegistrationComplete}
              onCancel={() => setRegStep('info')}
            />
          )}

          {regStep === 'done' && regSuccessRef && (
            <Card title="✅ Enregistrement Consulaire Confirmé" body={
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <StatusIndicator tone="success" label="Électeur Diaspora Validé" />
                <h2>Vous êtes désormais inscrit sur la liste électorale Diaspora CEP.</h2>
                <p>Code de confirmation consulaire : <strong>{regSuccessRef}</strong></p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Button onClick={() => { setMode('vote'); setVotePassport(regPassport || 'PA-998877'); }}>
                    Voter Maintenant sur le Scrutin National →
                  </Button>
                </div>
              </div>
            } />
          )}
        </div>
      )}

      {/* VOTING FLOW */}
      {mode === 'vote' && (
        <div>
          <Button variant="secondary" onClick={() => { setMode('menu'); setVoteStep('auth'); }} style={{ marginBottom: '16px' }}>
            ← Retour au menu Diaspora
          </Button>

          {voteStep === 'auth' && (
            <Card title="Authentification Électeur Diaspora (Passeport Haïtien)" body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: 'var(--cep-color-text-secondary)' }}>
                  Saisissez votre numéro de passeport haïtien pour démarrer la vérification biométrique faciale.
                </p>
                <div>
                  <label className="cep-label">Passeport Haïtien (Numéro):</label>
                  <input
                    type="text"
                    className="cep-input"
                    placeholder="Ex: PA-998877"
                    value={votePassport}
                    onChange={(e) => setVotePassport(e.target.value)}
                    style={{ fontSize: '1.1rem', letterSpacing: '1px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--cep-color-text-muted)', display: 'block', marginTop: '4px' }}>
                    Pour tester la démo : <code>PA-998877</code> (Jean-Claude Duval - États-Unis / Miami)
                  </span>
                </div>

                {voteError && (
                  <div style={{ padding: '12px', background: '#FFF0F0', color: 'darkred', borderLeft: '4px solid red' }}>
                    {voteError}
                  </div>
                )}

                <Button block onClick={handleAuthDiaspora} disabled={!votePassport.trim()}>
                  Scanner mon visage & Accéder au Bulletin →
                </Button>
              </div>
            } />
          )}

          {voteStep === 'biometrics' && diasporaVoter && (
            <BiometricScanner
              voter={diasporaVoter}
              onVerified={handleDiasporaBiometricSuccess}
              onCancel={() => setVoteStep('auth')}
            />
          )}

          {voteStep === 'ballot' && diasporaVoter && (
            <Card title="🗳️ Scrutin Présidentiel — Diaspora Haïtienne" body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#F0F6FF', padding: '12px 16px', borderRadius: '8px' }}>
                  <strong>Électeur : {diasporaVoter.fullName || `${diasporaVoter.firstName} ${diasporaVoter.lastName}`}</strong><br />
                  <span>Pays de vote : {diasporaVoter.countryOfResidence} | Passeport : {diasporaVoter.passportNumber}</span>
                </div>

                <h3>Choisissez le candidat Présidentiel de la République d'Haïti:</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {diasporaBallots.map(cand => {
                    const candId = cand.id || cand.candidateRef;
                    const isSelected = selectedCandidateId === candId;
                    return (
                      <div
                        key={candId}
                        onClick={() => setSelectedCandidateId(candId)}
                        style={{
                          border: isSelected ? '3px solid var(--cep-color-cep-blue)' : '1px solid var(--cep-color-border)',
                          background: isSelected ? '#EEF4FF' : 'white',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        <strong style={{ fontSize: '1.1rem', color: 'var(--cep-color-deep-blue)' }}>
                          {cand.firstName} {cand.lastName}
                        </strong>
                        <div style={{ color: 'var(--cep-color-cep-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                          {cand.party || cand.partyRef} ({cand.partyAcronym || cand.partyRef})
                        </div>
                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#555', marginTop: '6px' }}>
                          "{cand.slogan || 'Engagement pour Haïti'}"
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Button
                  block
                  disabled={!selectedCandidateId}
                  onClick={handleSubmitDiasporaVote}
                >
                  🔒 Soumettre & Sceller mon Vote Diaspora
                </Button>
              </div>
            } />
          )}

          {voteStep === 'success' && receiptHash && (
            <Card title="✅ Vote Diaspora Transmis avec Succès" body={
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <StatusIndicator tone="success" label="Vote Scellé" />
                <h2>Mèsi anpil ! Votre vote a été scellé dans l'urne consulaire.</h2>
                <div style={{ background: '#1E293B', color: '#38BDF8', padding: '16px', borderRadius: '8px', fontFamily: 'monospace' }}>
                  {receiptHash}
                </div>
                <Button block onClick={() => setMode('menu')}>Retour au Portail Diaspora</Button>
              </div>
            } />
          )}
        </div>
      )}
    </section>
  );
}

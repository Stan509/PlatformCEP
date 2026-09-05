import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StatusIndicator } from '@cep/design-system';
import { BiometricScanner } from '../components/BiometricScanner';
import { HAITI_DEPARTMENTS_AND_COMMUNES } from '../lib/mockData';
import { api } from '../lib/api';
import type { DermalogVoter } from '@cep/shared-types';
import { navigate } from '../router';

type Step = 'welcome' | 'card' | 'identity' | 'location' | 'biometrics' | 'confirm';
const ORDER: Step[] = ['welcome', 'card', 'identity', 'location', 'biometrics', 'confirm'];

export function Register(): JSX.Element {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('welcome');

  // Form State
  const [nin, setNin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('Ouest');
  const [commune, setCommune] = useState('Port-au-Prince');
  const [confirmRef, setConfirmRef] = useState<string | null>(null);

  const idx = ORDER.indexOf(step);

  const currentCommunes = HAITI_DEPARTMENTS_AND_COMMUNES[department] || ['Port-au-Prince'];

  const tempVoter: DermalogVoter = {
    nin: nin || '009-999-888-7',
    fullName: `${firstName || 'Citoyen'} ${lastName || 'Haïtien'}`,
    firstName: firstName || 'Citoyen',
    lastName: lastName || 'Haïtien',
    birthDate: dateOfBirth || '1990-01-01',
    dateOfBirth: dateOfBirth || '1990-01-01',
    gender: 'M',
    department,
    commune,
    address: address || `${commune}, ${department}`,
    cartePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    facePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isBiometricVerified: true,
    isDiaspora: false,
    hasVotedElections: {}
  };

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    const comms = HAITI_DEPARTMENTS_AND_COMMUNES[dept];
    if (comms && comms.length > 0 && comms[0]) {
      setCommune(comms[0]);
    }
  };

  const handleBiometricEnrollmentSuccess = async () => {
    try {
      const res = await api.registerVoter({
        nin: nin.trim(),
        firstName,
        lastName,
        dateOfBirth,
        department,
        commune,
        address
      });

      if (res.success && res.registrationCode) {
        setConfirmRef(res.registrationCode);
        setStep('confirm');
      }
    } catch {
      alert('Erreur lors de l\'enregistrement dans la base électorale.');
    }
  };

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      <div style={{ marginBottom: 'var(--cep-space-4)' }}>
        <p style={{ color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption-lg)' }}>
          Étape {idx + 1} / {ORDER.length} — Inscription Liste Électorale Nationale
        </p>
        <h1 style={{ fontSize: 'var(--cep-font-size-h2)', margin: 'var(--cep-space-1) 0 var(--cep-space-2)' }}>
          Demande d'Inscription Électeur CEP
        </h1>
      </div>

      <Card body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          {step === 'welcome' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '1rem' }}>
                Bienvenue sur le portail officiel du Conseil Électoral Provisoire (CEP). Ce formulaire vous permet de demander votre inscription ou mise à jour sur le registre électoral haïtien.
              </p>
              <div style={{ padding: '12px', background: '#F0F6FF', borderRadius: '8px', borderLeft: '4px solid var(--cep-color-deep-blue)' }}>
                <strong>Pièces requises :</strong> Carte Dermalog® (Carte d'Identité Unique / NIF) et présence devant la caméra pour la détection biométrique du visage.
              </div>
              <Button block onClick={() => setStep('card')}>
                Commencer mon Inscription →
              </Button>
            </div>
          )}

          {step === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>1. Numéro Carte Dermalog (CIN / NIF)</h3>
              <div>
                <label className="cep-label">Saisissez votre NIF/CIN (10 chiffres) *</label>
                <input
                  type="text"
                  className="cep-input"
                  placeholder="Ex: 004-987-654-1"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={() => setStep('welcome')}>Précédent</Button>
                <Button disabled={!nin.trim()} onClick={() => setStep('identity')}>Suivant →</Button>
              </div>
            </div>
          )}

          {step === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>2. Informations d'État Civil</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="cep-label">Prénom(s) *</label>
                  <input
                    type="text"
                    className="cep-input"
                    placeholder="Jean-Pierre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="cep-label">Nom de famille *</label>
                  <input
                    type="text"
                    className="cep-input"
                    placeholder="Alexandre"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="cep-label">Date de naissance *</label>
                <input
                  type="date"
                  className="cep-input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div>
                <label className="cep-label">Adresse Résidentielle Principale</label>
                <input
                  type="text"
                  className="cep-input"
                  placeholder="Rue, numéro et quartier"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={() => setStep('card')}>Précédent</Button>
                <Button disabled={!firstName || !lastName} onClick={() => setStep('location')}>Suivant →</Button>
              </div>
            </div>
          )}

          {step === 'location' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>3. Circonscription Géographique de Résidence</h3>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Votre lieu de résidence déterminera les candidats pour lesquels vous êtes habilité à voter (Département pour les Sénateurs, Commune pour le Député et Magistrat).
              </p>

              <div>
                <label className="cep-label">Département d'Haïti *</label>
                <select
                  className="cep-input"
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  style={{ appearance: 'auto' }}
                >
                  {Object.keys(HAITI_DEPARTMENTS_AND_COMMUNES).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="cep-label">Commune de Résidence *</label>
                <select
                  className="cep-input"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  style={{ appearance: 'auto' }}
                >
                  {currentCommunes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                <Button variant="secondary" onClick={() => setStep('identity')}>Précédent</Button>
                <Button onClick={() => setStep('biometrics')}>Continuer vers la Biométrie →</Button>
              </div>
            </div>
          )}

          {step === 'biometrics' && (
            <div>
              <BiometricScanner
                voter={tempVoter}
                onVerified={handleBiometricEnrollmentSuccess}
                onCancel={() => setStep('location')}
              />
            </div>
          )}

          {step === 'confirm' && confirmRef && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatusIndicator tone="success" label="Inscription Enregistrée" />
              <h2>Félicitations, vous êtes inscrit !</h2>
              <p style={{ color: 'var(--cep-color-text-secondary)' }}>
                Votre dossier d'inscription électorale a été pré-validé par le système avec l'Office National d'Identification (ONI).
              </p>
              <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid #DDD' }}>
                <div>N° de Confirmation d'Inscription :</div>
                <strong style={{ fontSize: '1.4rem', color: 'var(--cep-color-deep-blue)' }}>{confirmRef}</strong>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button onClick={() => navigate('vote')}>
                  Accéder à l'Isoloir de Vote Numérique →
                </Button>
              </div>
            </div>
          )}
        </div>
      } />
    </section>
  );
}

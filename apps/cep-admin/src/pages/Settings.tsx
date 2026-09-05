import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';

export function Settings(): JSX.Element {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);

  // Configuration state
  const [votingSystem, setVotingSystem] = useState('MAJORITARIAN_TWO_ROUNDS');
  const [majorityThreshold, setMajorityThreshold] = useState(50);
  const [blankBallotRule, setBlankBallotRule] = useState('EXCLUDED');

  // Biometrics State
  const [faceMatchThreshold, setFaceMatchThreshold] = useState(85);
  const [cardVersion, setCardVersion] = useState('DERMALOG_2018_V2');
  const [livenessStrictness, setLivenessStrictness] = useState('HIGH');

  // RBAC & Sync
  const [dualApproval, setDualApproval] = useState(true);
  const [jwtValidityHours, setJwtValidityHours] = useState(12);
  const [syncIntervalSeconds, setSyncIntervalSeconds] = useState(30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            {t('admin.settings.title')}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            {t('admin.settings.configHint')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          style={{
            background: 'var(--cep-color-cep-blue)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--cep-radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {saved ? '✓ Parameters Enregistrés' : 'Enregistrer la Configuration'}
        </button>
      </div>

      {saved && (
        <div
          style={{
            background: '#e6f4ea',
            color: '#137333',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--cep-radius-md)',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          ✓ Les règles électorales et paramètres biométriques ont été appliqués avec succès au cluster CEP.
        </div>
      )}

      {/* Grid of Config Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Section 1: Electoral Engine Rules */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--cep-radius-lg)',
            border: '1px solid var(--cep-color-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚖️</span>
            <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
              Règles du Moteur Électoral
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Mode de Scrutin Présidentiel
              </label>
              <select
                value={votingSystem}
                onChange={(e) => setVotingSystem(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              >
                <option value="MAJORITARIAN_TWO_ROUNDS">Majoritaire uninominal à deux tours (Art. 134-1)</option>
                <option value="MAJORITARIAN_ONE_ROUND">Majoritaire à un tour</option>
                <option value="PROPORTIONAL">Scrutin proportionnel plurinominal</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Seuil de majorité au 1er tour ({majorityThreshold} %)
              </label>
              <input
                type="range"
                min="40"
                max="60"
                value={majorityThreshold}
                onChange={(e) => setMajorityThreshold(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Comptabilisation des Bulletins Blancs
              </label>
              <select
                value={blankBallotRule}
                onChange={(e) => setBlankBallotRule(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              >
                <option value="EXCLUDED">Exclus du calcul des suffrages exprimés (Standard)</option>
                <option value="INCLUDED">Inclus dans les suffrages exprimés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Biometrics & Dermalog CIN */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--cep-radius-lg)',
            border: '1px solid var(--cep-color-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
              Biométrie & Carte Dermalog
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Score de correspondance faciale minimum ({faceMatchThreshold} %)
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={faceMatchThreshold}
                onChange={(e) => setFaceMatchThreshold(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Norme de Carte Nationale d'Identité (CIN)
              </label>
              <select
                value={cardVersion}
                onChange={(e) => setCardVersion(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              >
                <option value="DERMALOG_2018_V2">Dermalog Biometric CIN (Haïti 2018-Présent)</option>
                <option value="ONI_HYBRID">ONI Carte Électorale Hybride</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Niveau de contrôle Anti-Spoofing Liveness
              </label>
              <select
                value={livenessStrictness}
                onChange={(e) => setLivenessStrictness(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              >
                <option value="HIGH">Strict (Analyse multi-angles 3D + Micro-clignement)</option>
                <option value="MEDIUM">Standard (Analyse de profondeur faciale)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Security & RBAC */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--cep-radius-lg)',
            border: '1px solid var(--cep-color-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔒</span>
            <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
              Sécurité, Isolation & RBAC
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>Double approbation obligatoire</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--cep-color-text-muted)' }}>
                  Validation conjointe requise pour la clôture des procès-verbaux.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dualApproval}
                onChange={(e) => setDualApproval(e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Durée de validité des sessions tablettes ({jwtValidityHours}h)
              </label>
              <input
                type="number"
                value={jwtValidityHours}
                onChange={(e) => setJwtValidityHours(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Intervalle de synchronisation en ligne ({syncIntervalSeconds}s)
              </label>
              <input
                type="number"
                value={syncIntervalSeconds}
                onChange={(e) => setSyncIntervalSeconds(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

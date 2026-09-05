import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StatusIndicator, StateView } from '@cep/design-system';
import { api } from '../lib/api';
import { navigate } from '../router';
import type { DermalogVoter } from '@cep/shared-types';

type Phase = 'idle' | 'submitting' | 'result' | 'error';

export function CheckStatus(): JSX.Element {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [ref, setRef] = useState('004-123-456-7');
  const [voter, setVoter] = useState<DermalogVoter | null>(null);

  const submit = async () => {
    setPhase('submitting');
    try {
      // Try Dermalog NIN first, then Passport
      let v = await api.getVoterByNIN(ref.trim());
      if (!v && ref.includes('PA')) {
        v = await api.getVoterByPassport(ref.trim());
      }

      setVoter(v);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-5)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)', marginBottom: 'var(--cep-space-2)' }}>
        {t('pages.status.title')}
      </h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBottom: 'var(--cep-space-5)' }}>
        Consultez l'état de votre inscription sur la liste électorale nationale (ONI/CEP), votre centre de vote attribué et l'état de votre émargement.
      </p>

      <Card body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-2)' }}>
            <label className="cep-label">
              Numéro Carte Dermalog (CIN / NIF) ou Passeport Haïtien :
            </label>
            <input
              type="text"
              className="cep-input"
              placeholder="Ex: 004-123-456-7 ou PA-998877"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>

          <Button
            block
            isLoading={phase === 'submitting'}
            loadingText={t('pages.status.loading')}
            disabled={ref.trim() === ''}
            onClick={submit}
          >
            {t('pages.status.submit')}
          </Button>
        </div>
      } />

      {phase === 'result' && (
        <div style={{ marginTop: 'var(--cep-space-5)' }}>
          {voter ? (
            <Card
              title={<StatusIndicator tone="success" label="Électeur Enregistré & Actif" />}
              body={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)' }}>
                      {voter.fullName || `${voter.firstName} ${voter.lastName}`}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#555' }}>
                      Identifiant : <strong>{voter.nin}</strong> {voter.passportNumber ? `(Passeport: ${voter.passportNumber})` : ''}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Département</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '1rem' }}>{voter.department}</strong>
                    </div>

                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Commune de Vote</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '1rem' }}>{voter.commune}</strong>
                    </div>

                    <div style={{ background: '#FFF', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Centre de Vote Attribué</span>
                      <strong style={{ display: 'block', color: 'var(--cep-color-deep-blue)', fontSize: '0.9rem' }}>
                        Lycée National de {voter.commune}
                      </strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #EEE', paddingTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--cep-color-deep-blue)' }}>Historique Électoral & Émargements :</h4>
                    {Object.keys(voter.hasVotedElections).length > 0 ? (
                      <div style={{ padding: '10px 14px', background: '#E2F0D9', borderRadius: '6px', color: '#385723', fontSize: '0.85rem' }}>
                        ✓ Émarge(s) validé(s) pour : {Object.keys(voter.hasVotedElections).join(', ')}. <br />
                        <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Note : Vos choix électoraux demeurent anonymes et secrets.</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>Vous n'avez encore voté à aucun scrutin en cours.</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Button block onClick={() => navigate('vote')}>
                      Accéder à l'Isoloir pour Voter →
                    </Button>
                  </div>
                </div>
              }
            />
          ) : (
            <Card body={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', textAlign: 'center', padding: '16px' }}>
                <StateView
                  state="empty"
                  title="Numéro d'identifiant non trouvé"
                  description="Aucun électeur ne correspond à cet identifiant Dermalog / Passeport dans le registre électoral actuel."
                />
                <Button variant="primary" onClick={() => navigate('register')}>
                  S'inscrire comme Nouvel Électeur →
                </Button>
              </div>
            } />
          )}
        </div>
      )}

      {phase === 'error' && (
        <div style={{ marginTop: 'var(--cep-space-4)' }}>
          <StateView state="error" title={t('pages.status.errorTitle')} description={t('pages.status.supportCode')} />
        </div>
      )}
    </section>
  );
}

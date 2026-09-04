import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView } from '@cep/design-system';
import { api } from '../lib/api';
import { DEMO_PARTIES } from '../lib/mockData';
import { useAsync } from '../hooks/useAsync';

/**
 * Liste des candidats — NEUTRALITÉ ABSOLUE (spec §13).
 * Chaque carte est STRICTEMENT identique : même dimension, même hiérarchie,
 * même espace, même présentation. Ordre = ballot_index (officiel), jamais
 * par popularité. États : loading / error / empty / success.
 */
export function Candidates(): JSX.Element {
  const { t, lang } = useI18n();
  const state = useAsync(() => api.candidates(), []);

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-6)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('pages.candidates.title')}</h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBottom: 'var(--cep-space-5)' }}>
        {t('pages.candidates.subtitle')}
      </p>

      {state.state === 'loading' && <StateView state="loading" />}
      {state.state === 'error' && <StateView state="error" />}
      {state.state === 'empty' && (
        <StateView state="empty" title={t('pages.candidates.empty')} description={t('pages.candidates.emptyDetail')} />
      )}
      {state.state === 'success' && (
        <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {state.data.map((candidate) => {
            const party = DEMO_PARTIES.find((p) => p.partyRef === candidate.partyRef);
            return (
              <Card
                key={candidate.candidateRef}
                body={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-2)' }}>
                    <strong style={{ fontSize: 'var(--cep-font-size-h3)' }}>{candidate.firstName} {candidate.lastName}</strong>
                    <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                      {t('pages.candidates.post')} : {candidate.post}
                    </span>
                    <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                      {t('pages.candidates.party')} : {party ? party.name[lang] : '—'}
                    </span>
                    <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                      {t('pages.candidates.territory')} : {candidate.territory}
                    </span>
                    <span style={{ color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption)' }}>
                      N° {candidate.ballotIndex}
                    </span>
                    <Button variant="secondary" disabled>
                      {t('pages.candidates.viewProfile')}
                    </Button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

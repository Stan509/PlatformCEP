import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator } from '@cep/design-system';
import { navigate } from '../router';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';

const CYCLE_STEPS = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'] as const;
const TRUST_BY_STATUS: Record<string, 'info' | 'success' | 'warning'> = {
  OPEN: 'success',
  PROVISIONAL_RESULTS: 'warning',
  FINAL_VALIDATION: 'warning',
  FINAL_RESULTS: 'info',
  CLOSED: 'info',
};
const STATUS_LABEL_KEY: Record<string, string> = {
  OPEN: 'design_system.status.open',
  PROVISIONAL_RESULTS: 'design_system.status.provisional',
  FINAL_VALIDATION: 'design_system.status.provisional',
  FINAL_RESULTS: 'design_system.status.final',
  CLOSED: 'design_system.status.closed',
};

/** Accueil institutionnel — hero, cycle électoral, élections, informations. */
export function Home(): JSX.Element {
  const { t, lang } = useI18n();
  const elections = useAsync(() => api.elections(), []);

  return (
    <>
      <section style={{ background: 'var(--cep-color-light-blue)', padding: 'var(--cep-space-9) var(--cep-space-6)' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, var(--cep-font-size-h1))', maxWidth: '18ch' }}>
          {t('public.hero.title')}
        </h1>
        <p style={{ marginTop: 'var(--cep-space-4)', color: 'var(--cep-color-text-secondary)', maxWidth: '52ch' }}>
          {t('public.hero.subtitle')}
        </p>
        <div style={{ display: 'flex', gap: 'var(--cep-space-3)', marginTop: 'var(--cep-space-5)', flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('check-status')}>{t('public.hero.ctaVerify')}</Button>
          <Button variant="secondary" onClick={() => navigate('register')}>{t('public.hero.ctaRegister')}</Button>
          <Button variant="ghost" onClick={() => navigate('help')}>{t('public.hero.ctaUnderstand')}</Button>
        </div>
      </section>

      <section style={{ padding: 'var(--cep-space-7) var(--cep-space-6)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('public.cycle.title')}</h2>
        <div style={{ display: 'grid', gap: 'var(--cep-space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: 'var(--cep-space-5)' }}>
          {CYCLE_STEPS.map((step, i) => (
            <Card key={step} title={`${i + 1}`} body={<span style={{ fontSize: 'var(--cep-font-size-small)' }}>{t(`public.cycle.${step}`)}</span>} />
          ))}
        </div>
      </section>

      <section style={{ padding: 'var(--cep-space-7) var(--cep-space-6)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('public.nav.elections')}</h2>
        <div style={{ marginTop: 'var(--cep-space-4)' }}>
          {elections.state === 'loading' && <StateView state="loading" />}
          {elections.state === 'error' && <StateView state="error" />}
          {elections.state === 'empty' && <StateView state="empty" />}
          {elections.state === 'success' && (
            <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {elections.data.map((election) => (
                <Card
                  key={election.electionId}
                  title={election.name[lang]}
                  body={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
                      <StatusIndicator
                        tone={TRUST_BY_STATUS[election.status] ?? 'info'}
                        label={t(STATUS_LABEL_KEY[election.status] ?? 'design_system.status.open')}
                      />
                      <span style={{ fontSize: 'var(--cep-font-size-caption-lg)', color: 'var(--cep-color-text-secondary)' }}>
                        {new Date(election.startDate).toLocaleDateString()}
                      </span>
                      <Button variant="secondary" onClick={() => navigate('results')}>
                        {t('common.actions.submit')}
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: 'var(--cep-space-7) var(--cep-space-6)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <Card title={t('pages.results.title')} body={<Button variant="secondary" onClick={() => navigate('results')}>{t('common.actions.continue')}</Button>} />
          <Card title={t('pages.info.title')} body={<Button variant="secondary" onClick={() => navigate('info')}>{t('common.actions.continue')}</Button>} />
          <Card title={t('public.nav.candidates')} body={<Button variant="secondary" onClick={() => navigate('candidates')}>{t('common.actions.continue')}</Button>} />
        </div>
      </section>
    </>
  );
}

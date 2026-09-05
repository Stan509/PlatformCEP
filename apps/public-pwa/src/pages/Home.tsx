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

/** Accueil institutionnel CEP — Plateforme Électorale Haïtienne. */
export function Home(): JSX.Element {
  const { t, lang } = useI18n();
  const elections = useAsync(() => api.elections(), []);

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, #001A4D 0%, #002060 60%, #0B3C85 100%)', color: 'white', padding: 'var(--cep-space-9) var(--cep-space-6)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px' }}>
            🇭🇹 RÉPUBLIQUE D'HAÏTI — CONSEIL ÉLECTORAL PROVISOIRE
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', maxWidth: '22ch', color: 'white', lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Plateforme Nationale de Vote & Biométrie Électorale
          </h1>
          <p style={{ marginTop: 'var(--cep-space-4)', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '56ch', fontSize: '1.15rem', lineHeight: 1.5 }}>
            Voter de manière sécurisée avec votre carte Dermalog® (CIN / NIF) et votre passeport haïtien (Diaspora). Authentification par reconnaissance biométrique faciale.
          </p>
          <div style={{ display: 'flex', gap: 'var(--cep-space-4)', marginTop: 'var(--cep-space-6)', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('vote')}
              style={{
                background: '#F59E0B',
                color: '#001A4D',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '14px 28px',
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🗳️</span> Accéder à l'Isoloir (Voter en ligne)
            </button>

            <button
              onClick={() => navigate('check-status')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '14px 24px',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                cursor: 'pointer'
              }}
            >
              🔍 Vérifier mon Statut d'Électeur
            </button>

            <button
              onClick={() => navigate('diaspora')}
              style={{
                background: 'transparent',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '14px 24px',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                cursor: 'pointer'
              }}
            >
              🌐 Espace Diaspora Haïtienne
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ padding: 'var(--cep-space-7) var(--cep-space-6)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <Card title="🎴 Carte Dermalog® & Identité Unique" body={
            <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem' }}>
              Validation stricte des numéros d'identification unique (CIN/NIF) reliés à la base centrale de l'Office National d'Identification (ONI).
            </p>
          } />
          <Card title="📸 Biométrie Faciale Sécurisée" body={
            <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem' }}>
              Scan facial en direct devant caméra avec comparaison automatique du modèle facial officiel issu de la carte d'identité.
            </p>
          } />
          <Card title="📍 Circonscription Géographique" body={
            <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem' }}>
              Attribution exacte du bulletin selon la commune et le département : Président (National), Sénateur (Département), Député & Magistrat (Commune).
            </p>
          } />
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
                        Date d'ouverture: {new Date(election.startDate).toLocaleDateString()}
                      </span>
                      <Button onClick={() => navigate('vote')}>
                        Voter à ce Scrutin →
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

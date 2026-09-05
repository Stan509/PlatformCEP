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
      {/* Hero Banner — Modéré, institutionnel & harmonieux avec les tokens CSS */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--cep-color-light-blue) 0%, #F4F8FC 100%)',
          borderBottom: '1px solid var(--cep-color-border)',
          padding: 'var(--cep-space-8) var(--cep-space-5)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Institutional Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--cep-space-2)',
              background: 'var(--cep-color-white)',
              color: 'var(--cep-color-deep-blue)',
              border: '1px solid var(--cep-color-border)',
              padding: '6px 14px',
              borderRadius: 'var(--cep-radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: 'var(--cep-shadow-xs)',
              marginBottom: 'var(--cep-space-4)',
            }}
          >
            <span>🇭🇹</span> {t('public.hero.badge')}
          </div>

          {/* Hero Title */}
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              color: 'var(--cep-color-deep-blue)',
              lineHeight: 1.2,
              fontWeight: 800,
              maxWidth: '22ch',
              margin: '0 0 var(--cep-space-3) 0',
            }}
          >
            {t('public.hero.title')}
          </h1>

          {/* Hero Subtitle */}
          <p
            style={{
              color: 'var(--cep-color-text-secondary)',
              maxWidth: '56ch',
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              lineHeight: 1.5,
              margin: '0 0 var(--cep-space-6) 0',
            }}
          >
            {t('public.hero.subtitle')}
          </p>

          {/* Responsive CTAs */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--cep-space-3)',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => navigate('vote')}
              style={{
                background: 'var(--cep-color-cep-blue)',
                color: 'var(--cep-color-white)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '12px 24px',
                borderRadius: 'var(--cep-radius-full)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--cep-shadow-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🗳️</span> {t('public.hero.ctaVote')}
            </button>

            <button
              onClick={() => navigate('check-status')}
              style={{
                background: 'var(--cep-color-white)',
                color: 'var(--cep-color-deep-blue)',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '12px 20px',
                borderRadius: 'var(--cep-radius-full)',
                border: '1px solid var(--cep-color-border)',
                cursor: 'pointer',
                boxShadow: 'var(--cep-shadow-xs)',
              }}
            >
              🔍 {t('public.hero.ctaVerify')}
            </button>

            <button
              onClick={() => navigate('diaspora')}
              style={{
                background: 'transparent',
                color: 'var(--cep-color-cep-blue)',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '12px 20px',
                borderRadius: 'var(--cep-radius-full)',
                border: '1px solid var(--cep-color-cep-blue)',
                cursor: 'pointer',
              }}
            >
              🌐 {t('public.hero.ctaDiaspora')}
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid — Fully Responsive */}
      <section
        style={{
          padding: 'var(--cep-space-7) var(--cep-space-5)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--cep-space-4)',
          }}
        >
          <Card
            title={`🎴 ${t('public.features.dermalogTitle')}`}
            body={
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {t('public.features.dermalogDesc')}
              </p>
            }
          />
          <Card
            title={`📸 ${t('public.features.biometricsTitle')}`}
            body={
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {t('public.features.biometricsDesc')}
              </p>
            }
          />
          <Card
            title={`📍 ${t('public.features.territoryTitle')}`}
            body={
              <p style={{ color: 'var(--cep-color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {t('public.features.territoryDesc')}
              </p>
            }
          />
        </div>
      </section>

      {/* Cycle électoral */}
      <section
        style={{
          padding: 'var(--cep-space-6) var(--cep-space-5)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h2 style={{ fontSize: 'var(--cep-font-size-h2)', color: 'var(--cep-color-deep-blue)' }}>
          {t('public.cycle.title')}
        </h2>
        <div
          style={{
            display: 'grid',
            gap: 'var(--cep-space-3)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            marginTop: 'var(--cep-space-4)',
          }}
        >
          {CYCLE_STEPS.map((step, i) => (
            <Card
              key={step}
              title={`${i + 1}`}
              body={
                <span style={{ fontSize: 'var(--cep-font-size-small)', color: 'var(--cep-color-text-secondary)' }}>
                  {t(`public.cycle.${step}`)}
                </span>
              }
            />
          ))}
        </div>
      </section>

      {/* Liste des Élections Actives */}
      <section
        style={{
          padding: 'var(--cep-space-6) var(--cep-space-5)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h2 style={{ fontSize: 'var(--cep-font-size-h2)', color: 'var(--cep-color-deep-blue)' }}>
          {t('public.nav.elections')}
        </h2>
        <div style={{ marginTop: 'var(--cep-space-4)' }}>
          {elections.state === 'loading' && <StateView state="loading" />}
          {elections.state === 'error' && <StateView state="error" />}
          {elections.state === 'empty' && <StateView state="empty" />}
          {elections.state === 'success' && (
            <div
              style={{
                display: 'grid',
                gap: 'var(--cep-space-4)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              }}
            >
              {elections.data.map((election) => (
                <Card
                  key={election.electionId}
                  title={election.name[lang] || election.name.fr}
                  body={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)' }}>
                      <StatusIndicator
                        tone={TRUST_BY_STATUS[election.status] ?? 'info'}
                        label={t(STATUS_LABEL_KEY[election.status] ?? 'design_system.status.open')}
                      />
                      <span
                        style={{
                          fontSize: 'var(--cep-font-size-caption-lg)',
                          color: 'var(--cep-color-text-secondary)',
                        }}
                      >
                        {new Date(election.startDate).toLocaleDateString()}
                      </span>
                      <Button block onClick={() => navigate('vote')}>
                        {t('public.hero.ctaVote')} →
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

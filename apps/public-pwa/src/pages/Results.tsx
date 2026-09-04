import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator } from '@cep/design-system';
import type { ResultStatus } from '@cep/shared-types';
import { api } from '../lib/api';
import { useAsync } from '../hooks/useAsync';

const TRUST_LABEL: Record<ResultStatus, string> = {
  PROVISIONAL: 'pages.results.trustProvisional',
  PARTIAL: 'pages.results.trustPartial',
  CONSOLIDATED: 'pages.results.trustConsolidated',
  FINAL: 'pages.results.trustFinal',
};

/**
 * Publication des résultats (spec §16.11) — indicateurs de confiance clairs
 * (provisoire / partiel / consolidé / définitif). Aucun résultat non final
 * n'est présenté comme définitif. État vide par défaut (résultats pas publiés).
 */
export function Results(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => api.results(), []);

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--cep-space-8) var(--cep-space-6)', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--cep-font-size-h2)' }}>{t('pages.results.title')}</h1>
      <p style={{ color: 'var(--cep-color-text-secondary)', marginBottom: 'var(--cep-space-5)' }}>
        {t('pages.results.subtitle')}
      </p>

      <Card body={
        <div style={{ display: 'flex', gap: 'var(--cep-space-3)', flexWrap: 'wrap' }}>
          <StatusIndicator tone="warning" label={t(TRUST_LABEL.PROVISIONAL)} />
          <StatusIndicator tone="info" label={t(TRUST_LABEL.PARTIAL)} />
          <StatusIndicator tone="info" label={t(TRUST_LABEL.CONSOLIDATED)} />
          <StatusIndicator tone="success" label={t(TRUST_LABEL.FINAL)} />
        </div>
      } />

      <div style={{ marginTop: 'var(--cep-space-5)' }}>
        {state.state === 'loading' && <StateView state="loading" />}
        {state.state === 'error' && <StateView state="error" />}
        {state.state === 'empty' && (
          <StateView state="empty" title={t('pages.results.empty')} description={t('pages.results.emptyDetail')} />
        )}
        {state.state === 'success' && (
          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {state.data.map((result) => (
              <Card
                key={`${result.electionId}-${result.geographicNodeId}`}
                title={`${result.geographicNodeId} · ${t(TRUST_LABEL[result.confidence.status])}`}
                body={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-2)' }}>
                    <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                      {t('pages.results.lastUpdate')} : {new Date(result.confidence.updatedAt).toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
                      {t('pages.results.coverage')} : {Math.round(result.confidence.coverage * 100)}%
                    </span>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

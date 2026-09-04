import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator } from '@cep/design-system';
import { COMMAND_STATE } from '../lib/mockData';

interface MetricProps {
  label: string;
  value: number;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

/** Command Center — surveillance opérationnelle en temps réel (spec §21/§46). */
export function CommandCenter(): JSX.Element {
  const { t } = useI18n();

  const metric = (label: string, value: number, tone: MetricProps['tone']): MetricProps => ({ label, value, tone });
  const centerMetrics: MetricProps[] = [
    metric(t('admin.commandCenter.operational'), COMMAND_STATE.operational, 'success'),
    metric(t('admin.commandCenter.attention'), COMMAND_STATE.attention, 'warning'),
    metric(t('admin.commandCenter.incidentLabel'), COMMAND_STATE.incident, 'danger'),
  ];
  const deviceMetrics: MetricProps[] = [
    metric(t('admin.commandCenter.online'), COMMAND_STATE.online, 'success'),
    metric(t('admin.commandCenter.offline'), COMMAND_STATE.offline, 'neutral'),
    metric(t('admin.commandCenter.pending'), COMMAND_STATE.pending, 'warning'),
  ];
  const pvMetrics: MetricProps[] = [
    metric(t('admin.commandCenter.pvReceived'), COMMAND_STATE.pvReceived, 'info'),
    metric(t('admin.commandCenter.pvValidated'), COMMAND_STATE.pvValidated, 'success'),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)' }}>
      <h2 style={{ fontSize: 'var(--cep-font-size-h3)' }}>{t('admin.commandCenter.title')}</h2>

      <Card title={t('admin.commandCenter.operational')} body={<Metrics metrics={centerMetrics} />} />
      <Card title={t('admin.nav.devices')} body={<Metrics metrics={deviceMetrics} />} />
      <Card title={t('admin.commandCenter.pvReceived')} body={<Metrics metrics={pvMetrics} />} />

      {/* Carte territorio placeholder (neutralité — couleurs sémantiques uniquement). */}
      <Card title="Map" body={<StateView state="empty" title="Map" description={t('admin.commandCenter.perDayTitle')} />} />
    </div>
  );
}

function Metrics({ metrics }: { metrics: MetricProps[] }): JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
      {metrics.map((m) => (
        <div key={m.label} style={{ background: 'var(--cep-color-background)', borderRadius: 'var(--cep-radius-md)', padding: 'var(--cep-space-4)' }}>
          <StatusIndicator tone={m.tone} label={m.label} />
          <strong style={{ display: 'block', fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)', marginTop: 'var(--cep-space-2)' }}>
            {m.value.toLocaleString()}
          </strong>
        </div>
      ))}
    </div>
  );
}

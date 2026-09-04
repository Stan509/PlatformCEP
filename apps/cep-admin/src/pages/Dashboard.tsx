import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminElection } from '../lib/mockData';
import { ADMIN_KPIS } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Dashboard CEP — indicateurs globaux + table des élections (spec §20). */
export function Dashboard(): JSX.Element {
  const { t } = useI18n();
  const elections = useAsync(() => adminApi.elections(), []);

  const columns: TableColumn<AdminElection>[] = [
    { key: 'name', header: t('admin.elections.name'), accessor: (r) => r.name },
    { key: 'type', header: t('admin.elections.type'), accessor: (r) => r.type },
    { key: 'date', header: t('admin.elections.date'), accessor: (r) => r.date },
    { key: 'status', header: t('admin.elections.status'), accessor: (r) => <StatusIndicator tone="info" label={t(`admin.elections.${r.status}`)} /> },
    { key: 'candidates', header: t('admin.elections.candidates'), accessor: (r) => String(r.candidates) },
    { key: 'stations', header: t('admin.elections.stations'), accessor: (r) => String(r.stations) },
    { key: 'lastModified', header: t('admin.elections.lastModified'), accessor: (r) => r.lastModified },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)' }}>
      <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {ADMIN_KPIS.map((kpi) => (
          <Card key={kpi.key} title={<span style={{ fontSize: '0.875rem' }}>{t(`admin.dashboard.${kpi.key}`)}</span>} body={<strong style={{ fontSize: '1.5rem', color: 'var(--cep-color-deep-blue)' }}>{kpi.value}</strong>} />
        ))}
      </div>

      <Card title={t('admin.elections.title')} body={
        elections.state === 'loading' ? <StateView state="loading" /> :
        elections.state === 'empty' ? <StateView state="empty" /> :
        elections.state === 'error' ? <StateView state="error" /> :
        <Table columns={columns} data={elections.data} keyField={(r) => r.id} />
      } />
    </div>
  );
}

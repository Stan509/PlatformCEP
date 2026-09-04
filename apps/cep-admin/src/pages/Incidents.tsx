import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminIncident } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Gestion des incidents — workflow, escalade (spec §31 §30). */
export function Incidents(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.incidents(), []);

  const sevTone: Record<AdminIncident['severity'], 'neutral' | 'warning' | 'danger'> = {
    LOW: 'neutral',
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'danger',
  };
  const statusTone: Record<AdminIncident['status'], 'warning' | 'success'> = {
    OPEN: 'warning',
    RESOLVED: 'success',
  };

  const columns: TableColumn<AdminIncident>[] = [
    { key: 'category', header: t('admin.incidents.category'), accessor: (r: AdminIncident) => r.category },
    { key: 'severity', header: t('admin.incidents.severity'), accessor: (r: AdminIncident) => <StatusIndicator tone={sevTone[r.severity]} label={r.severity} /> },
    { key: 'status', header: t('admin.incidents.status'), accessor: (r: AdminIncident) => <StatusIndicator tone={statusTone[r.status]} label={t(`admin.incidents.status${r.status === 'OPEN' ? 'Open' : 'Resolved'}`)} /> },
    { key: 'reportedBy', header: t('admin.incidents.reportedBy'), accessor: (r: AdminIncident) => r.reportedBy },
    { key: 'reportedAt', header: t('admin.incidents.reportedAt'), accessor: (r: AdminIncident) => r.reportedAt },
  ];

  return (
    <Card title={t('admin.incidents.title')} body={
      state.state === 'loading' ? <StateView state="loading" /> :
      state.state === 'empty' ? <StateView state="empty" /> :
      state.state === 'error' ? <StateView state="error" /> :
      <Table columns={columns} data={state.data} keyField={(r: AdminIncident) => r.id} />
    } />
  );
}

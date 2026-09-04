import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminElection } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Gestion des élections — tableau, statuts, double approbation (spec §22). */
export function Elections(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.elections(), []);

  const tone: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    statusOpen: 'success',
    statusFinal: 'info',
    statusDraft: 'neutral',
  };

  const columns: TableColumn<AdminElection>[] = [
    { key: 'name', header: t('admin.elections.name'), accessor: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'type', header: t('admin.elections.type'), accessor: (r) => r.type },
    { key: 'date', header: t('admin.elections.date'), accessor: (r) => r.date },
    { key: 'status', header: t('admin.elections.status'), accessor: (r) => <StatusIndicator tone={tone[r.status] ?? 'info'} label={t(`admin.elections.${r.status}`)} /> },
    { key: 'stations', header: t('admin.elections.stations'), accessor: (r) => String(r.stations) },
    { key: 'actions', header: t('admin.devices.actions'), accessor: () => <Button size="sm" variant="secondary">{t('common.actions.continue')}</Button> },
  ];

  return (
    <Card title={t('admin.elections.title')} body={
      state.state === 'loading' ? <StateView state="loading" /> :
      state.state === 'empty' ? <StateView state="empty" /> :
      state.state === 'error' ? <StateView state="error" /> :
      <Table columns={columns} data={state.data} keyField={(r) => r.id} />
    } />
  );
}

import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminDevice } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Gestion des appareils — statut, dernière connexion/sync, actions (spec §31). */
export function Devices(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.devices(), []);

  const tone: Record<AdminDevice['status'], 'success' | 'danger' | 'warning'> = {
    ACTIVE: 'success',
    REVOKED: 'danger',
    SUSPENDED: 'warning',
  };

  const columns: TableColumn<AdminDevice>[] = [
    { key: 'deviceId', header: t('admin.devices.deviceId'), accessor: (r) => r.deviceId },
    { key: 'version', header: t('admin.devices.version'), accessor: (r) => r.version },
    { key: 'assignedUser', header: t('admin.devices.assignedUser'), accessor: (r) => r.assignedUser },
    { key: 'status', header: t('admin.devices.status'), accessor: (r) => <StatusIndicator tone={tone[r.status]} label={t(`admin.devices.status${r.status.charAt(0)}${r.status.slice(1).toLowerCase()}`)} /> },
    { key: 'lastSeen', header: t('admin.devices.lastSeen'), accessor: (r) => r.lastSeen },
    { key: 'lastSync', header: t('admin.devices.lastSync'), accessor: (r) => r.lastSync },
    { key: 'actions', header: t('admin.devices.actions'), accessor: () => (
      <div style={{ display: 'flex', gap: 'var(--cep-space-2)' }}>
        <Button size="sm" variant="secondary">{t('admin.devices.suspend')}</Button>
        <Button size="sm" variant="danger">{t('admin.devices.revoke')}</Button>
      </div>
    ) },
  ];

  return (
    <Card title={t('admin.devices.title')} body={
      state.state === 'loading' ? <StateView state="loading" /> :
      state.state === 'empty' ? <StateView state="empty" /> :
      state.state === 'error' ? <StateView state="error" /> :
      <Table columns={columns} data={state.data} keyField={(r) => r.id} />
    } />
  );
}

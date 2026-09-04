import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminRelease } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Release Manager APK — publication privée, signature, hash (spec §32-33). */
export function Releases(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.releases(), []);

  const tone: Record<AdminRelease['status'], 'success' | 'info' | 'danger'> = {
    SIGNED: 'info',
    PUBLISHED: 'success',
    REVOKED: 'danger',
  };

  const columns: TableColumn<AdminRelease>[] = [
    { key: 'version', header: t('admin.releases.version'), accessor: (r: AdminRelease) => r.version },
    { key: 'build', header: t('admin.releases.build'), accessor: (r: AdminRelease) => r.build },
    { key: 'hash', header: t('admin.releases.hash'), accessor: (r: AdminRelease) => r.hash },
    { key: 'signature', header: t('admin.releases.signature'), accessor: (r: AdminRelease) => r.signature },
    { key: 'status', header: t('admin.releases.status'), accessor: (r: AdminRelease) => <StatusIndicator tone={tone[r.status]} label={r.status} /> },
    { key: 'actions', header: t('admin.devices.actions'), accessor: () => <Button size="sm" variant="secondary">{t('admin.releases.publishPrivate')}</Button> },
  ];

  return (
    <Card title={t('admin.releases.title')} body={
      state.state === 'loading' ? <StateView state="loading" /> :
      state.state === 'empty' ? <StateView state="empty" /> :
      state.state === 'error' ? <StateView state="error" /> :
      <Table columns={columns} data={state.data} keyField={(r: AdminRelease) => r.id} />
    } />
  );
}

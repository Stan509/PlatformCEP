import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminAuditEvent } from '../lib/mockData';
import { adminApi } from '../lib/api';

/** Audit — journal immuable, tamper-evident (spec §35). */
export function Audit(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.audit(), []);

  const columns: TableColumn<AdminAuditEvent>[] = [
    { key: 'actor', header: t('admin.audit.actor'), accessor: (r) => r.actor },
    { key: 'action', header: t('admin.audit.action'), accessor: (r) => r.action },
    { key: 'object', header: t('admin.audit.object'), accessor: (r) => r.object },
    { key: 'outcome', header: t('admin.audit.outcome'), accessor: (r) => r.outcome },
    { key: 'correlationId', header: t('admin.audit.correlationId'), accessor: (r) => r.correlationId },
    { key: 'occurredAt', header: t('admin.audit.occurredAt'), accessor: (r) => r.occurredAt },
  ];

  return (
    <Card title={t('admin.audit.title')} body={
      state.state === 'loading' ? <StateView state="loading" /> :
      state.state === 'empty' ? <StateView state="empty" /> :
      state.state === 'error' ? <StateView state="error" /> :
      <Table columns={columns} data={state.data} keyField={(r) => r.id} />
    } />
  );
}

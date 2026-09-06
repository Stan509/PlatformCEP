import { useState } from 'react';
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
  const [search, setSearch] = useState('');

  const rawData = state.state === 'success' ? state.data : [];
  const filtered = rawData.filter((r) =>
    r.actor.toLowerCase().includes(search.toLowerCase()) ||
    r.action.toLowerCase().includes(search.toLowerCase()) ||
    r.object.toLowerCase().includes(search.toLowerCase()) ||
    r.correlationId.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<AdminAuditEvent>[] = [
    { key: 'actor', header: t('admin.audit.actor'), accessor: (r) => <strong>{r.actor}</strong> },
    { key: 'action', header: t('admin.audit.action'), accessor: (r) => <code style={{ color: '#003893', fontWeight: 700 }}>{r.action}</code> },
    { key: 'object', header: t('admin.audit.object'), accessor: (r) => r.object },
    { key: 'outcome', header: t('admin.audit.outcome'), accessor: (r) => <span style={{ padding: '2px 6px', borderRadius: 4, background: r.outcome === 'SUCCESS' ? '#e6f4ea' : '#fce8e6', color: r.outcome === 'SUCCESS' ? '#137333' : '#c5221f', fontWeight: 700, fontSize: '0.75rem' }}>{r.outcome}</span> },
    { key: 'correlationId', header: t('admin.audit.correlationId'), accessor: (r) => <code style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{r.correlationId}</code> },
    { key: 'occurredAt', header: t('admin.audit.occurredAt'), accessor: (r) => r.occurredAt },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: 'var(--cep-space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            🛡️ {t('admin.audit.title')} Cryptographique (Piste d'Audit Immuable)
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Journal horodaté et signé par hachage SHA-256. Non modifiable depuis l'interface d'administration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Export du journal d\'audit signé cryptographiquement en cours... (audit-log-2026.json)')}
          style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
        >
          📥 Exporter le Journal Signé
        </button>
      </div>

      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '0.8rem 1rem', borderRadius: 8, fontSize: '0.82rem', color: '#002d62' }}>
        🔒 <strong>Garantie d'Inviolabilité :</strong> Chaque événement est lié à l'empreinte cryptographique du précédent. Aucune entrée ne peut être altérée, supprimée ou masquée.
      </div>

      <div style={{ background: 'white', padding: '0.8rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
        <input
          type="text"
          placeholder="Filtrer la piste d'audit par utilisateur, action, ressource ou ID corrélation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
      </div>

      <Card title="Événements d'Audit Journalisés" body={
        state.state === 'loading' ? <StateView state="loading" /> :
        state.state === 'empty' ? <StateView state="empty" /> :
        state.state === 'error' ? <StateView state="error" /> :
        <Table columns={columns} data={filtered} keyField={(r) => r.id} />
      } />
    </div>
  );
}

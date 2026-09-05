import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminElection } from '../lib/mockData';
import { ADMIN_KPIS } from '../lib/mockData';
import { adminApi } from '../lib/api';

const DEPT_STATS = [
  { dept: 'Ouest (Port-au-Prince, Delmas, Carrefour...)', electors: '2 140 500', stations: 4850, sync: '99.6 %' },
  { dept: 'Artibonite (Gonaïves, Saint-Marc...)', electors: '980 200', stations: 2310, sync: '99.1 %' },
  { dept: 'Nord (Cap-Haïtien, Limonade...)', electors: '740 100', stations: 1820, sync: '99.8 %' },
  { dept: 'Sud (Les Cayes, Aquin...)', electors: '480 300', stations: 1140, sync: '99.0 %' },
  { dept: 'Centre (Hinche, Mirebalais...)', electors: '410 000', stations: 980, sync: '98.9 %' },
  { dept: 'Nord-Ouest (Port-de-Paix...)', electors: '390 400', stations: 920, sync: '99.2 %' },
  { dept: 'Sud-Est (Jacmel...)', electors: '360 200', stations: 840, sync: '99.5 %' },
  { dept: 'Grand\'Anse (Jérémie...)', electors: '190 800', stations: 460, sync: '98.5 %' },
  { dept: 'Nord-Est (Fort-Liberté, Ouanaminthe)', electors: '185 000', stations: 440, sync: '99.7 %' },
  { dept: 'Nippes (Miragoâne...)', electors: '164 690', stations: 390, sync: '99.4 %' },
];

export function Dashboard(): JSX.Element {
  const { t } = useI18n();
  const elections = useAsync(() => adminApi.elections(), []);

  const columns: TableColumn<AdminElection>[] = [
    { key: 'name', header: t('admin.elections.name'), accessor: (r) => <strong>{r.name}</strong> },
    { key: 'type', header: t('admin.elections.type'), accessor: (r) => r.type },
    { key: 'date', header: t('admin.elections.date'), accessor: (r) => r.date },
    { key: 'status', header: t('admin.elections.status'), accessor: (r) => <StatusIndicator tone="info" label={t(`admin.elections.${r.status}`)} /> },
    { key: 'candidates', header: t('admin.elections.candidates'), accessor: (r) => String(r.candidates) },
    { key: 'stations', header: t('admin.elections.stations'), accessor: (r) => String(r.stations) },
    { key: 'lastModified', header: t('admin.elections.lastModified'), accessor: (r) => r.lastModified },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)' }}>
      {/* Header Banner */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          {t('admin.dashboard.title')} Institutional CEP
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Vue d'ensemble en temps réel des 10 départements d'Haïti — Registre électoral et déploiement biométrique.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {ADMIN_KPIS.map((kpi) => (
          <Card
            key={kpi.key}
            title={<span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t(`admin.dashboard.${kpi.key}`)}</span>}
            body={<strong style={{ fontSize: '1.6rem', color: 'var(--cep-color-deep-blue)' }}>{kpi.value}</strong>}
          />
        ))}
      </div>

      {/* Departmental Electoral Coverage Breakdown */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Répartition Géographique des 10 Départements d'Haïti
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Département</th>
                <th style={{ padding: '0.75rem 1rem' }}>Électeurs Inscrits</th>
                <th style={{ padding: '0.75rem 1rem' }}>Bureaux de Vote (BV)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Taux de Synchronisation</th>
              </tr>
            </thead>
            <tbody>
              {DEPT_STATS.map((d, i) => (
                <tr key={d.dept} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--cep-color-deep-blue)' }}>{d.dept}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.electors}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.stations.toLocaleString()} BV</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#137333', fontWeight: 600 }}>{d.sync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Elections Table */}
      <Card
        title={t('admin.elections.title')}
        body={
          elections.state === 'loading' ? (
            <StateView state="loading" />
          ) : elections.state === 'empty' ? (
            <StateView state="empty" />
          ) : elections.state === 'error' ? (
            <StateView state="error" />
          ) : (
            <Table columns={columns} data={elections.data} keyField={(r) => r.id} />
          )
        }
      />
    </div>
  );
}

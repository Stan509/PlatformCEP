import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator } from '@cep/design-system';
import { COMMAND_STATE, ADMIN_ELECTIONS } from '../lib/mockData';
import type { VotingStationType, AssignmentTransferPayload } from '@cep/shared-types';

interface MetricProps {
  label: string;
  value: number;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

interface DemoStation {
  id: string;
  code: string;
  name: string;
  type: VotingStationType;
  department: string;
  commune: string;
  capacity: number;
  assignedElectors: number;
  participatedElectors: number;
  geofenceStatus: 'LOCATION_VALID' | 'LOCATION_INVALID' | 'LOCATION_UNKNOWN';
  status: 'PREPARED' | 'OPEN' | 'CLOSED' | 'TABULATED';
}

const DEMO_STATIONS: DemoStation[] = [
  {
    id: 'st-001',
    code: 'BV-PV-001',
    name: 'Lycée National de Pétion-Ville (Fixe #1)',
    type: 'FIXED',
    department: 'Ouest',
    commune: 'Pétion-Ville',
    capacity: 450,
    assignedElectors: 420,
    participatedElectors: 310,
    geofenceStatus: 'LOCATION_VALID',
    status: 'OPEN',
  },
  {
    id: 'st-002',
    code: 'BV-PV-002',
    name: 'École Nationale de Frères (Fixe #2)',
    type: 'FIXED',
    department: 'Ouest',
    commune: 'Pétion-Ville',
    capacity: 400,
    assignedElectors: 380,
    participatedElectors: 295,
    geofenceStatus: 'LOCATION_VALID',
    status: 'OPEN',
  },
  {
    id: 'st-003',
    code: 'BV-NOM-01',
    name: 'Unité Mobile Pétion-Ville / Laboule (Nomade #1)',
    type: 'NOMADIC',
    department: 'Ouest',
    commune: 'Pétion-Ville',
    capacity: 250,
    assignedElectors: 140,
    participatedElectors: 112,
    geofenceStatus: 'LOCATION_VALID',
    status: 'OPEN',
  },
  {
    id: 'st-004',
    code: 'BV-NOM-02',
    name: 'Unité Mobile Jacmel / Côte Sud (Nomade #2)',
    type: 'NOMADIC',
    department: 'Sud-Est',
    commune: 'Jacmel',
    capacity: 200,
    assignedElectors: 95,
    participatedElectors: 42,
    geofenceStatus: 'LOCATION_INVALID',
    status: 'OPEN',
  },
  {
    id: 'st-005',
    code: 'ONLINE-Z',
    name: 'Isoloir Virtuel Securisé PWA (Bureau Global Online-Z)',
    type: 'VIRTUAL',
    department: 'National / Diaspora',
    commune: 'Online PWA',
    capacity: 1000000,
    assignedElectors: 5000,
    participatedElectors: 3820,
    geofenceStatus: 'LOCATION_VALID',
    status: 'OPEN',
  },
];

/** Command Center — surveillance opérationnelle en temps réel (Bureaux Fixes/Nomades/Online-Z, Transferts & PV Tabulation). */
export function CommandCenter(): JSX.Element {
  const { t } = useI18n();
  const [stations, setStations] = useState<DemoStation[]>(DEMO_STATIONS);
  const [filterType, setFilterType] = useState<'ALL' | VotingStationType>('ALL');

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferElectorRef, setTransferElectorRef] = useState('CEP-2026-88491');
  const [sourceStationId, setSourceStationId] = useState('st-001');
  const [targetStationId, setTargetStationId] = useState('st-005');
  const [transferReason, setTransferReason] = useState('Autorisation de vote à distance / Déplacement certifié');
  const [transferMessage, setTransferMessage] = useState<string | null>(null);

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

  const filteredStations = filterType === 'ALL' ? stations : stations.filter((s) => s.type === filterType);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceStationId === targetStationId) {
      setTransferMessage('⚠️ Le bureau source et le bureau cible doivent être différents.');
      return;
    }

    setStations((prev) =>
      prev.map((st) => {
        if (st.id === sourceStationId) {
          return { ...st, assignedElectors: Math.max(0, st.assignedElectors - 1) };
        }
        if (st.id === targetStationId) {
          return { ...st, assignedElectors: st.assignedElectors + 1 };
        }
        return st;
      })
    );

    const auditRef = `AUD-TRF-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransferMessage(`✅ Transfert d'affectation réussi pour ${transferElectorRef}. Référence d'Audit: ${auditRef}. Le total national reste invariant.`);
    setTimeout(() => {
      setTransferModalOpen(false);
      setTransferMessage(null);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)', padding: 'var(--cep-space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            🚨 {t('admin.commandCenter.title')} CEP
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Surveillance globale des bureaux de vote (Fixes, Nomades avec Géofencing, et Virtuel Online-Z), transferts d'affectation et tabulation des PV.
          </p>
        </div>
        <Button variant="primary" onClick={() => setTransferModalOpen(true)}>
          ⇄ Transférer un Électeur (Fixe / Nomade / Online-Z)
        </Button>
      </div>

      {/* Scope Filter Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#003893' }}>🎯 Filtre de Périmètre (Scope) :</span>
        <select style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.85rem' }}>
          <option value="ALL">Périmètre National (Tous les Départements)</option>
          <option value="Ouest">Département de l'Ouest</option>
          <option value="Nord">Département du Nord</option>
          <option value="Artibonite">Département de l'Artibonite</option>
        </select>
        <select style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '0.85rem' }}>
          <option value="e1">Élections Générales 2026 (Scrutin Active)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Card title={t('admin.commandCenter.operational')} body={<Metrics metrics={centerMetrics} />} />
        <Card title={t('admin.nav.devices')} body={<Metrics metrics={deviceMetrics} />} />
        <Card title={t('admin.commandCenter.pvReceived')} body={<Metrics metrics={pvMetrics} />} />
      </div>

      {/* Voting Stations & Modalities Monitor */}
      <Card
        title="Supervision des Bureaux de Vote & Géofencing"
        body={
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(['ALL', 'FIXED', 'NOMADIC', 'VIRTUAL'] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? 'primary' : 'secondary'}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'ALL'
                    ? 'Tous les Bureaux'
                    : type === 'FIXED'
                    ? 'Bureaux Fixes'
                    : type === 'NOMADIC'
                    ? 'Bureaux Nomades'
                    : 'Bureau Virtuel (Online-Z)'}
                </Button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8F9FA', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Code & Nom du Bureau</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Type de Station</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Localisation & Géozone</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Électeurs Affectés</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Participations</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut Géofence</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut Bureau</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #EEE' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: 'var(--cep-color-deep-blue)' }}>{st.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{st.code}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: st.type === 'FIXED' ? '#EBF5FF' : st.type === 'NOMADIC' ? '#FFFBEB' : '#EDFDF5',
                            color: st.type === 'FIXED' ? '#1D4ED8' : st.type === 'NOMADIC' ? '#B45309' : '#047857',
                          }}
                        >
                          {st.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {st.department} — {st.commune}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong>{st.assignedElectors.toLocaleString()}</strong> / {st.capacity.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: 'var(--cep-color-cep-blue)' }}>{st.participatedElectors.toLocaleString()}</strong> (
                        {Math.round((st.participatedElectors / (st.assignedElectors || 1)) * 100)}%)
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {st.geofenceStatus === 'LOCATION_VALID' ? (
                          <StatusIndicator tone="success" label="Zone GPS Valide" />
                        ) : st.geofenceStatus === 'LOCATION_INVALID' ? (
                          <StatusIndicator tone="danger" label="⚠️ Hors Zone Autorisée" />
                        ) : (
                          <StatusIndicator tone="warning" label="Position Inconnue" />
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusIndicator tone="success" label={st.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      {/* Transfer Elector Modal */}
      {transferModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--cep-radius-lg)',
              width: '100%',
              maxWidth: 540,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--cep-color-deep-blue)' }}>
              ⇄ Transfert d'Affectation Électorale Atomique
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'gray' }}>
              Transférez un électeur d'un bureau fixe à un bureau nomade ou virtuel (Online-Z) sans altérer le total national.
            </p>

            {transferMessage && (
              <div style={{ padding: '10px', borderRadius: 4, background: '#F0FDF4', color: '#166534', fontSize: '0.85rem' }}>
                {transferMessage}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Référence / NIN de l'Électeur
                </label>
                <input
                  type="text"
                  required
                  value={transferElectorRef}
                  onChange={(e) => setTransferElectorRef(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Bureau Source Actuel
                </label>
                <select
                  value={sourceStationId}
                  onChange={(e) => setSourceStationId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type}) — {st.assignedElectors} électeurs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Bureau Cible Destinataire
                </label>
                <select
                  value={targetStationId}
                  onChange={(e) => setTargetStationId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type}) — {st.assignedElectors} électeurs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Motif Opérationnel du Transfert
                </label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="secondary" onClick={() => setTransferModalOpen(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Exécuter le Transfert Atomique
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
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


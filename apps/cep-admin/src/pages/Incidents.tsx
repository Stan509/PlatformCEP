import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

export type IncidentCategory = 'TECHNICAL' | 'SECURITY' | 'ELECTORAL' | 'DEVICE' | 'NETWORK' | 'STATION' | 'PV' | 'MANDATE' | 'OTHER';
export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface IncidentItem {
  id: string;
  category: IncidentCategory;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  department: string;
  commune: string;
  pollingStationCode?: string;
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  description: string;
}

const INITIAL_INCIDENTS: IncidentItem[] = [
  { id: 'inc-01', category: 'SECURITY', title: 'Suspicion d\'altération matériel BIOPAD', severity: 'CRITICAL', status: 'INVESTIGATING', department: 'Nord', commune: 'Cap-Haïtien', pollingStationCode: 'BV-CAP-004', reportedBy: 'Col. Jacques Roche', assignedTo: 'Ing. Fritz Bernard', reportedAt: '2026-11-15T09:12', description: 'Le capteur biométrique a signalé un descellement physique lors du démarrage.' },
  { id: 'inc-02', category: 'ELECTORAL', title: 'Réserve portée au PV par le mandataire #18', severity: 'MEDIUM', status: 'ASSIGNED', department: 'Nord', commune: 'Cap-Haïtien', pollingStationCode: 'BV-CAP-004', reportedBy: 'Jean-Yves Théodore (Mandataire)', assignedTo: 'Superviseur BED Nord', reportedAt: '2026-11-15T18:45', description: 'Contestation de 2 bulletins considérés nuls lors du dépouillement.' },
  { id: 'inc-03', category: 'NETWORK', title: 'Baisse temporaire de débit 4G Digicel', severity: 'LOW', status: 'RESOLVED', department: 'Ouest', commune: 'Port-au-Prince', pollingStationCode: 'BV-PAP-012', reportedBy: 'Marc-Antoine Toussaint (Agent APK)', assignedTo: 'Équipe Support IT', reportedAt: '2026-11-15T14:20', description: 'Commutation automatique sur le mode hors ligne (offline-first local db).' },
  { id: 'inc-04', category: 'MANDATE', title: 'Demande d\'accréditation contestée sur place', severity: 'HIGH', status: 'OPEN', department: 'Artibonite', commune: 'Gonaïves', pollingStationCode: 'BV-GON-001', reportedBy: 'Emmanuelle François', reportedAt: '2026-11-15T07:30', description: 'Badge d\'accès non reconnu par le contrôleur de la station.' },
];

export function Incidents(): JSX.Element {
  const { t } = useI18n();
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetAction, setTargetAction] = useState<{ incident: IncidentItem; nextStatus: IncidentStatus; label: string } | null>(null);

  const filtered = categoryFilter === 'ALL' ? incidents : incidents.filter((i) => i.category === categoryFilter);

  const handleActionClick = (incident: IncidentItem, nextStatus: IncidentStatus, label: string) => {
    setTargetAction({ incident, nextStatus, label });
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!targetAction) return;
    const { incident, nextStatus } = targetAction;

    setIncidents((prev) =>
      prev.map((item) => (item.id === incident.id ? { ...item, status: nextStatus } : item))
    );

    if (selectedIncident?.id === incident.id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    setModalOpen(false);
    setTargetAction(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          🚨 Gestion & Escalade des Incidents de Terrain (Workflow CEP)
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Suivi des signalements techniques, de sécurité, électoraux et mandataires (OPEN ➔ ASSIGNED ➔ INVESTIGATING ➔ RESOLVED ➔ CLOSED).
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrer par Catégorie d'Incident :</span>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="ALL">Toutes les Catégories ({incidents.length})</option>
          <option value="SECURITY">SECURITY (Sécurité & Intrusion)</option>
          <option value="ELECTORAL">ELECTORAL (Règles & Scrutin)</option>
          <option value="DEVICE">DEVICE (Matériel BIOPAD)</option>
          <option value="NETWORK">NETWORK (Réseau & Sync)</option>
          <option value="MANDATE">MANDATE (Accréditations)</option>
        </select>
      </div>

      {/* Incidents Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Sévérité / Titre</th>
              <th style={{ padding: '0.8rem 1rem' }}>Catégorie</th>
              <th style={{ padding: '0.8rem 1rem' }}>Localisation & Station</th>
              <th style={{ padding: '0.8rem 1rem' }}>Déclarant / Assigné</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut Workflow</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions Escalade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => (
              <tr key={inc.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: inc.severity === 'CRITICAL' ? '#fce8e6' : inc.severity === 'HIGH' ? '#fff3cd' : '#f8f9fa', color: inc.severity === 'CRITICAL' ? '#c5221f' : '#b06000', marginRight: 6 }}>
                    {inc.severity}
                  </span>
                  <strong>{inc.title}</strong>
                </td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: '#003893' }}>{inc.category}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div>{inc.department} ({inc.commune})</div>
                  {inc.pollingStationCode && <code style={{ fontSize: '0.78rem', color: '#555' }}>{inc.pollingStationCode}</code>}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div>{inc.reportedBy}</div>
                  {inc.assignedTo && <div style={{ fontSize: '0.78rem', color: '#137333' }}>👤 {inc.assignedTo}</div>}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: inc.status === 'CLOSED' ? '#e6f4ea' : inc.status === 'RESOLVED' ? '#eef4ff' : inc.status === 'INVESTIGATING' ? '#fff3cd' : '#fce8e6', color: inc.status === 'CLOSED' || inc.status === 'RESOLVED' ? '#137333' : '#c5221f' }}>
                    {inc.status}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(inc)}
                      style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Détails
                    </button>
                    {inc.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(inc, 'INVESTIGATING', 'Démarrer l\'enquête')}
                        style={{ background: '#fef7e0', color: '#b06000', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Enquêter
                      </button>
                    )}
                    {inc.status === 'INVESTIGATING' && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(inc, 'RESOLVED', 'Marquer comme résolu')}
                        style={{ background: '#e6f4ea', color: '#137333', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Résoudre
                      </button>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(inc, 'CLOSED', 'Clôturer définitivement')}
                        style={{ background: '#137333', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Fermer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedIncident && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1500 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 540, height: '100%', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.3rem' }}>🚨 Rapport d'Incident & Historique</h2>
              <button type="button" onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
              <div><strong>Titre :</strong> {selectedIncident.title}</div>
              <div><strong>Catégorie :</strong> {selectedIncident.category}</div>
              <div><strong>Sévérité :</strong> <span style={{ fontWeight: 800, color: '#c5221f' }}>{selectedIncident.severity}</span></div>
              <div><strong>Déclaration :</strong> Par {selectedIncident.reportedBy} le {selectedIncident.reportedAt.replace('T', ' ')}</div>
              <div><strong>Responsable d'enquête :</strong> {selectedIncident.assignedTo || 'Non encore assigné'}</div>
              <div><strong>Statut :</strong> <span style={{ fontWeight: 800, color: '#003893' }}>{selectedIncident.status}</span></div>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 6px', color: '#002d62' }}>Description du problème :</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#444', lineHeight: 1.4 }}>{selectedIncident.description}</p>
            </div>

            <button type="button" onClick={() => setSelectedIncident(null)} style={{ marginTop: 'auto', background: '#003893', color: 'white', border: 'none', padding: '0.7rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
              Fermer le rapport
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {targetAction && (
        <ConfirmationModal
          isOpen={modalOpen}
          title={`Action Workflow Incident : ${targetAction.label}`}
          actionName={targetAction.label}
          targetResource={`${targetAction.incident.title} (${targetAction.incident.id})`}
          consequenceSummary={`Le statut de cet incident passera de ${targetAction.incident.status} ➔ ${targetAction.nextStatus}.`}
          tone={targetAction.nextStatus === 'CLOSED' ? 'primary' : 'warning'}
          onConfirm={handleConfirmAction}
          onCancel={() => { setModalOpen(false); setTargetAction(null); }}
        />
      )}
    </div>
  );
}

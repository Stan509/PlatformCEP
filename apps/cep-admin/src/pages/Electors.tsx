import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface ElectorRecord {
  id: string;
  cin: string;
  fullName: string;
  birthDate: string;
  department: string;
  commune: string;
  sectionCommunale: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  activeStationCode: string;
  activeStationType: 'FIXED' | 'NOMADIC' | 'VIRTUAL';
  registeredAt: string;
  hasVoted: boolean;
}

const INITIAL_ELECTORS: ElectorRecord[] = [
  { id: 'el-1001', cin: '004-123-456-7', fullName: 'Jean-Baptiste Pierrot', birthDate: '1984-05-12', department: 'Ouest', commune: 'Port-au-Prince', sectionCommunale: 'Turgeau', status: 'ACTIVE', activeStationCode: 'BV-PAP-012', activeStationType: 'FIXED', registeredAt: '2025-02-10', hasVoted: true },
  { id: 'el-1002', cin: '001-998-321-4', fullName: 'Marie-Florence Saint-Juste', birthDate: '1992-11-23', department: 'Ouest', commune: 'Pétion-Ville', sectionCommunale: 'Montagne Noire', status: 'ACTIVE', activeStationCode: 'BV-PAP-013', activeStationType: 'NOMADIC', registeredAt: '2025-03-01', hasVoted: false },
  { id: 'el-1003', cin: '003-445-890-1', fullName: 'Claudel Hyppolite', birthDate: '1979-01-04', department: 'Nord', commune: 'Cap-Haïtien', sectionCommunale: 'Bande du Nord', status: 'ACTIVE', activeStationCode: 'BV-CAP-004', activeStationType: 'FIXED', registeredAt: '2025-01-15', hasVoted: true },
  { id: 'el-1004', cin: '008-112-233-9', fullName: 'Marie-Antoinette Joseph (Diaspora)', birthDate: '1988-08-30', department: 'Ouest', commune: 'Port-au-Prince', sectionCommunale: 'Diaspora Consulat Miami', status: 'ACTIVE', activeStationCode: 'BV-ONLINE-Z', activeStationType: 'VIRTUAL', registeredAt: '2025-04-12', hasVoted: true },
  { id: 'el-1005', cin: '005-776-543-2', fullName: 'Dieudonné Moïse', birthDate: '1995-07-19', department: 'Artibonite', commune: 'Gonaïves', sectionCommunale: 'Pont Tamarin', status: 'PENDING', activeStationCode: 'BV-GON-001', activeStationType: 'FIXED', registeredAt: '2026-08-01', hasVoted: false },
];

interface ElectorsProps {
  user: UserAccount;
}

export function Electors({ user }: ElectorsProps): JSX.Element {
  const [electors, setElectors] = useState<ElectorRecord[]>(INITIAL_ELECTORS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedElector, setSelectedElector] = useState<ElectorRecord | null>(null);

  // Confirmation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'SUSPEND' | 'APPROVE' | 'REJECT'; elector: ElectorRecord } | null>(null);

  const filtered = electors.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.cin.includes(search) ||
      e.commune.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleActionClick = (type: 'SUSPEND' | 'APPROVE' | 'REJECT', elector: ElectorRecord) => {
    setPendingAction({ type, elector });
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { type, elector } = pendingAction;

    setElectors((prev) =>
      prev.map((item) => {
        if (item.id === elector.id) {
          const nextStatus = type === 'SUSPEND' ? 'SUSPENDED' : type === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );

    if (selectedElector?.id === elector.id) {
      setSelectedElector((prev) => (prev ? { ...prev, status: type === 'SUSPEND' ? 'SUSPENDED' : type === 'APPROVE' ? 'ACTIVE' : 'REJECTED' } : null));
    }

    setModalOpen(false);
    setPendingAction(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            📇 Registre Électoral National & Identification Citoyenne
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Base souveraine d'inscription des ~5.84M d'électeurs d'Haïti. Vérification biométrique Dermalog® et minimisation strict (Privacy by Design).
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher par CIN (ex: 004-123...), nom ou commune..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 260, padding: '0.55rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ padding: '0.55rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="ALL">Tous les Départements</option>
          <option value="Ouest">Ouest</option>
          <option value="Nord">Nord</option>
          <option value="Artibonite">Artibonite</option>
          <option value="Sud">Sud</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.55rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="ALL">Tous les Statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="PENDING">En Attente</option>
          <option value="SUSPENDED">Suspendus</option>
        </select>
      </div>

      {/* Electors Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Identifiant CIN / Ref</th>
              <th style={{ padding: '0.8rem 1rem' }}>Nom & Prénom</th>
              <th style={{ padding: '0.8rem 1rem' }}>Département / Commune</th>
              <th style={{ padding: '0.8rem 1rem' }}>Affectation Bureau (BV)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#003893' }}>{e.cin}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{e.fullName}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{e.department} ({e.commune})</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ background: e.activeStationType === 'VIRTUAL' ? '#f3e5f5' : e.activeStationType === 'NOMADIC' ? '#fff3cd' : '#eef4ff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem', color: '#003893' }}>
                    {e.activeStationCode} ({e.activeStationType})
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: e.status === 'ACTIVE' ? '#e6f4ea' : e.status === 'PENDING' ? '#fef7e0' : '#fce8e6', color: e.status === 'ACTIVE' ? '#137333' : e.status === 'PENDING' ? '#b06000' : '#c5221f' }}>
                    {e.status}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedElector(e)}
                    style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginRight: 6 }}
                  >
                    Fiche Électeur
                  </button>
                  {e.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => handleActionClick('SUSPEND', e)}
                      style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Suspendre
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActionClick('APPROVE', e)}
                      style={{ background: '#e6f4ea', color: '#137333', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Activer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Elector Detail Drawer Modal */}
      {selectedElector && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1500 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 540, height: '100%', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '-5px 0 20px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.3rem' }}>📇 Fiche Individuelle de l'Électeur</h2>
              <button type="button" onClick={() => setSelectedElector(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
              <div><strong>Nom complet :</strong> {selectedElector.fullName}</div>
              <div><strong>CIN ONI Dermalog :</strong> <code style={{ fontWeight: 700, color: '#003893' }}>{selectedElector.cin}</code></div>
              <div><strong>Date de naissance :</strong> {selectedElector.birthDate}</div>
              <div><strong>Résidence électorale :</strong> {selectedElector.department} — {selectedElector.commune} ({selectedElector.sectionCommunale})</div>
              <div><strong>Date d'inscription :</strong> {selectedElector.registeredAt}</div>
            </div>

            <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 8px', color: '#002d62' }}>📍 Affectation Électorale Active</h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Code Bureau : <strong>{selectedElector.activeStationCode}</strong></div>
                <div>Modalité de vote : <strong>{selectedElector.activeStationType}</strong></div>
                <div>Participation enregistrée : <strong>{selectedElector.hasVoted ? '✅ VOTE EFFECTUÉ (Jeton jeté)' : '⏳ NON ENCORE VOTÉ'}</strong></div>
              </div>
            </div>

            <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '0.8rem', borderRadius: 8, fontSize: '0.8rem', color: '#002d62' }}>
              🔒 <strong>Confidentialité Absolue :</strong> Le jeton de participation prouve uniquement que l'électeur a voté. Le bulletin reste entièrement anonyme et séparé.
            </div>

            <button type="button" onClick={() => setSelectedElector(null)} style={{ marginTop: 'auto', background: '#003893', color: 'white', border: 'none', padding: '0.7rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
              Fermer la fiche
            </button>
          </div>
        </div>
      )}

      {/* Sensitive Action Modal */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={modalOpen}
          title={pendingAction.type === 'SUSPEND' ? 'Suspendre cet électeur' : 'Activer cet électeur'}
          actionName={pendingAction.type === 'SUSPEND' ? 'Suspension du droit de vote' : 'Homologation d\'inscription'}
          targetResource={`${pendingAction.elector.fullName} (${pendingAction.elector.cin})`}
          consequenceSummary={pendingAction.type === 'SUSPEND' ? 'L\'électeur ne pourra plus voter ni recevoir de jeton lors du scrutin.' : 'L\'électeur recevra son affectation active de vote.'}
          tone={pendingAction.type === 'SUSPEND' ? 'danger' : 'primary'}
          onConfirm={handleConfirmAction}
          onCancel={() => { setModalOpen(false); setPendingAction(null); }}
        />
      )}
    </div>
  );
}

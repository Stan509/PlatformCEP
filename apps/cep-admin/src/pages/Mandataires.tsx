import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

export type MandateStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'PENDING_CEP_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'REJECTED';

interface MandateItem {
  id: string;
  mandataireName: string;
  phone: string;
  representedType: 'CANDIDATE' | 'PARTY';
  representedName: string;
  electionName: string;
  department: string;
  commune: string;
  stationCode: string;
  modality: 'PHYSICAL' | 'ONLINE' | 'BOTH';
  validFrom: string;
  validTo: string;
  status: MandateStatus;
}

const INITIAL_MANDATES: MandateItem[] = [
  {
    id: 'm-101',
    mandataireName: 'Pierre-Richard Alexis',
    phone: '+509 3712-4490',
    representedType: 'CANDIDATE',
    representedName: 'Jean-Charles Moïse #14 (Pitit Desalin)',
    electionName: 'Élections Générales 2026',
    department: 'Ouest',
    commune: 'Port-au-Prince',
    stationCode: 'BV-PAP-012',
    modality: 'PHYSICAL',
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'm-102',
    mandataireName: 'Claudette Saint-Germain',
    phone: '+509 3844-9011',
    representedType: 'PARTY',
    representedName: 'RDNP (Rassemblement des Démocrates)',
    electionName: 'Élections Générales 2026',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    stationCode: 'BV-CAP-004 + ONLINE-Z',
    modality: 'BOTH',
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    status: 'APPROVED',
  },
  {
    id: 'm-103',
    mandataireName: 'Jean-Yves Théodore',
    phone: '+509 3690-1122',
    representedType: 'CANDIDATE',
    representedName: 'Marie-Antoinette Duclaire #18',
    electionName: 'Élections Municipales Cap-Haïtien',
    department: 'Nord',
    commune: 'Cap-Haïtien',
    stationCode: 'BV-CAP-004',
    modality: 'PHYSICAL',
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    status: 'PENDING_CEP_REVIEW',
  },
  {
    id: 'm-104',
    mandataireName: 'Emmanuelle François',
    phone: '+509 3410-0099',
    representedType: 'PARTY',
    representedName: 'LAPEH',
    electionName: 'Élections Générales 2026',
    department: 'Artibonite',
    commune: 'Gonaïves',
    stationCode: 'BV-GON-001',
    modality: 'PHYSICAL',
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    status: 'PROPOSED',
  },
];

interface MandatairesProps {
  user: UserAccount;
}

export function Mandataires({ user }: MandatairesProps): JSX.Element {
  const [mandates, setMandates] = useState<MandateItem[]>(INITIAL_MANDATES);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMandate, setSelectedMandate] = useState<MandateItem | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ mandate: MandateItem; targetStatus: MandateStatus; actionLabel: string } | null>(null);

  const filtered = selectedStatus === 'ALL' ? mandates : mandates.filter((m) => m.status === selectedStatus);

  const handleAction = (mandate: MandateItem, targetStatus: MandateStatus, actionLabel: string) => {
    setPendingAction({ mandate, targetStatus, actionLabel });
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { mandate, targetStatus } = pendingAction;

    setMandates((prev) =>
      prev.map((item) => (item.id === mandate.id ? { ...item, status: targetStatus } : item))
    );

    if (selectedMandate?.id === mandate.id) {
      setSelectedMandate((prev) => (prev ? { ...prev, status: targetStatus } : null));
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
            📋 Registre des Accréditations & Workflow Mandataires CEP
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Workflow d'accréditation en 8 états (DRAFT ➔ PROPOSED ➔ REVIEW ➔ APPROVED ➔ ACTIVE ➔ SUSPENDED / REVOKED).
          </p>
        </div>
      </div>

      {/* Workflow Rule Note */}
      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '0.9rem', borderRadius: 8, fontSize: '0.85rem', color: '#002d62' }}>
        ⚠️ <strong>Règle Workflow Strict :</strong> Aucun mandat n'est automatiquement mis à l'état <code>ACTIVE</code> lors de sa création. Chaque demande doit obligatoirement passer par l'examen CEP et l'homologation formelle.
      </div>

      {/* Filter Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrer par Statut Workflow :</span>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="ALL">Tous les Statuts ({mandates.length})</option>
          <option value="PROPOSED">PROPOSED (Proposés)</option>
          <option value="PENDING_CEP_REVIEW">PENDING_CEP_REVIEW (En examen CEP)</option>
          <option value="APPROVED">APPROVED (Approuvés)</option>
          <option value="ACTIVE">ACTIVE (Actifs)</option>
          <option value="SUSPENDED">SUSPENDED (Suspendus)</option>
          <option value="REVOKED">REVOKED (Révoqués)</option>
        </select>
      </div>

      {/* Mandates Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Nom du Mandataire</th>
              <th style={{ padding: '0.8rem 1rem' }}>Entité Représentée</th>
              <th style={{ padding: '0.8rem 1rem' }}>Département / Commune</th>
              <th style={{ padding: '0.8rem 1rem' }}>Modalité</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut Workflow</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions CEP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <strong>{m.mandataireName}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>📞 {m.phone}</div>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: m.representedType === 'CANDIDATE' ? '#eef4ff' : '#e6f4ea', color: '#003893', marginRight: 6 }}>
                    {m.representedType}
                  </span>
                  {m.representedName}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>{m.department} ({m.commune})</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem', background: m.modality === 'BOTH' ? '#f3e5f5' : '#f8f9fa', color: '#003893' }}>
                    {m.modality}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: m.status === 'ACTIVE' ? '#e6f4ea' : m.status === 'APPROVED' ? '#eef4ff' : m.status === 'REVOKED' || m.status === 'REJECTED' ? '#fce8e6' : '#fef7e0', color: m.status === 'ACTIVE' ? '#137333' : m.status === 'REVOKED' ? '#c5221f' : '#b06000' }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedMandate(m)}
                      style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Détail
                    </button>
                    {m.status === 'PROPOSED' && (
                      <button
                        type="button"
                        onClick={() => handleAction(m, 'PENDING_CEP_REVIEW', 'Mettre en examen CEP')}
                        style={{ background: '#fef7e0', color: '#b06000', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Examiner
                      </button>
                    )}
                    {(m.status === 'PENDING_CEP_REVIEW' || m.status === 'PROPOSED') && (
                      <button
                        type="button"
                        onClick={() => handleAction(m, 'APPROVED', 'Approuver le mandat')}
                        style={{ background: '#e6f4ea', color: '#137333', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Approuver
                      </button>
                    )}
                    {m.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleAction(m, 'ACTIVE', 'Activer l\'accréditation')}
                        style={{ background: '#137333', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Activer
                      </button>
                    )}
                    {m.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleAction(m, 'REVOKED', 'Révoquer l\'accréditation')}
                        style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Révoquer
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
      {selectedMandate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1500 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 540, height: '100%', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.3rem' }}>📜 Fiche d'Accréditation Mandataire</h2>
              <button type="button" onClick={() => setSelectedMandate(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
              <div><strong>Mandataire :</strong> {selectedMandate.mandataireName}</div>
              <div><strong>Téléphone :</strong> {selectedMandate.phone}</div>
              <div><strong>Type d'entité :</strong> {selectedMandate.representedType}</div>
              <div><strong>Entité représentée :</strong> {selectedMandate.representedName}</div>
              <div><strong>Scrutin :</strong> {selectedMandate.electionName}</div>
              <div><strong>Périmètre :</strong> {selectedMandate.department} ({selectedMandate.commune})</div>
              <div><strong>Bureaux autorisés :</strong> {selectedMandate.stationCode}</div>
              <div><strong>Modalités :</strong> {selectedMandate.modality}</div>
              <div><strong>Période de validité :</strong> {selectedMandate.validFrom} au {selectedMandate.validTo}</div>
              <div><strong>Statut workflow :</strong> <span style={{ fontWeight: 800, color: '#003893' }}>{selectedMandate.status}</span></div>
            </div>

            <button type="button" onClick={() => setSelectedMandate(null)} style={{ marginTop: 'auto', background: '#003893', color: 'white', border: 'none', padding: '0.7rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
              Fermer la fiche
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={modalOpen}
          title={`Action Workflow : ${pendingAction.actionLabel}`}
          actionName={pendingAction.actionLabel}
          targetResource={`${pendingAction.mandate.mandataireName} (${pendingAction.mandate.representedName})`}
          consequenceSummary={`Le statut du mandat sera mis à jour de ${pendingAction.mandate.status} ➔ ${pendingAction.targetStatus}.`}
          tone={pendingAction.targetStatus === 'REVOKED' ? 'danger' : 'primary'}
          onConfirm={handleConfirmAction}
          onCancel={() => { setModalOpen(false); setPendingAction(null); }}
        />
      )}
    </div>
  );
}

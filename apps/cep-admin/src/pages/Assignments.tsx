import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface AssignmentRecord {
  id: string;
  electorName: string;
  electorCin: string;
  electionName: string;
  currentStationCode: string;
  currentStationType: 'FIXED' | 'NOMADIC' | 'VIRTUAL';
  assignedAt: string;
  isActive: boolean;
  department: string;
  commune: string;
}

const INITIAL_ASSIGNMENTS: AssignmentRecord[] = [
  { id: 'asg-01', electorName: 'Jean-Baptiste Pierrot', electorCin: '004-123-456-7', electionName: 'Élections Générales d\'Haïti 2026', currentStationCode: 'BV-PAP-012', currentStationType: 'FIXED', assignedAt: '2026-08-10', isActive: true, department: 'Ouest', commune: 'Port-au-Prince' },
  { id: 'asg-02', electorName: 'Marie-Florence Saint-Juste', electorCin: '001-998-321-4', electionName: 'Élections Générales d\'Haïti 2026', currentStationCode: 'BV-PAP-013', currentStationType: 'NOMADIC', assignedAt: '2026-08-15', isActive: true, department: 'Ouest', commune: 'Pétion-Ville' },
  { id: 'asg-03', electorName: 'Claudel Hyppolite', electorCin: '003-445-890-1', electionName: 'Élections Générales d\'Haïti 2026', currentStationCode: 'BV-CAP-004', currentStationType: 'FIXED', assignedAt: '2026-08-11', isActive: true, department: 'Nord', commune: 'Cap-Haïtien' },
  { id: 'asg-04', electorName: 'Marie-Antoinette Joseph (Diaspora)', electorCin: '008-112-233-9', electionName: 'Élections Générales d\'Haïti 2026', currentStationCode: 'BV-ONLINE-Z', currentStationType: 'VIRTUAL', assignedAt: '2026-08-20', isActive: true, department: 'Ouest', commune: 'Port-au-Prince' },
];

interface AssignmentsProps {
  user: UserAccount;
}

export function Assignments({ user }: AssignmentsProps): JSX.Element {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>(INITIAL_ASSIGNMENTS);
  const [transferTarget, setTransferTarget] = useState<AssignmentRecord | null>(null);
  const [targetType, setTargetType] = useState<'FIXED' | 'NOMADIC' | 'VIRTUAL'>('NOMADIC');
  const [targetCode, setTargetCode] = useState('BV-PAP-013');
  const [reason, setReason] = useState('Déplacement professionnel / Observateur terrain');

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenTransfer = (asg: AssignmentRecord) => {
    setTransferTarget(asg);
    setTargetType(asg.currentStationType === 'FIXED' ? 'NOMADIC' : 'FIXED');
    setTargetCode(asg.currentStationType === 'FIXED' ? 'BV-PAP-013 (Unité Nomade)' : 'BV-PAP-012 (Fixe)');
  };

  const handleExecuteTransfer = () => {
    if (!transferTarget) return;

    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id === transferTarget.id) {
          return {
            ...item,
            currentStationType: targetType,
            currentStationCode: targetCode,
            assignedAt: new Date().toISOString().substring(0, 10),
          };
        }
        return item;
      })
    );

    setModalOpen(false);
    setTransferTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          🔁 Gestion des Affectations Électorales & Transferts de Bureau
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Contrôle strict de l'Affectation Active Unique (Single Active Assignment) et transferts certifiés (FIXED ➔ NOMADIC / FIXED ➔ ONLINE-Z).
        </p>
      </div>

      {/* Preservation Rule Banner */}
      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '1rem', borderRadius: 8, fontSize: '0.85rem', color: '#002d62' }}>
        <strong>⚖️ Règle Juridique d'Affectation :</strong> Un électeur possède strictement <strong>UNE seule affectation active</strong> à la fois. Le transfert déplace l'affectation sans créer de doublon ni modifier le total électoral national.
      </div>

      {/* Assignments Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Électeur & CIN</th>
              <th style={{ padding: '0.8rem 1rem' }}>Scrutin Attribué</th>
              <th style={{ padding: '0.8rem 1rem' }}>Bureau Actif (BV)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Modalité</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut Affectation</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions Transfert</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((asg) => (
              <tr key={asg.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <strong>{asg.electorName}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'monospace' }}>{asg.electorCin}</div>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>{asg.electionName}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#003893' }}>{asg.currentStationCode}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem', background: asg.currentStationType === 'VIRTUAL' ? '#f3e5f5' : asg.currentStationType === 'NOMADIC' ? '#fff3cd' : '#eef4ff', color: '#003893' }}>
                    {asg.currentStationType}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: '#e6f4ea', color: '#137333' }}>
                    AFFECTATION UNIQUE ACTIVE
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenTransfer(asg)}
                    style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Transferer Bureau
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transfer Form Drawer/Modal */}
      {transferTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1600, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, color: '#002d62' }}>🔁 Transfert d'Affectation Électorale</h3>

            <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: 6, fontSize: '0.85rem' }}>
              Électeur : <strong>{transferTarget.electorName}</strong> ({transferTarget.electorCin})<br />
              Affectation Actuelle : <strong>{transferTarget.currentStationCode} ({transferTarget.currentStationType})</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Nouvelle Modalité Cible</label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="NOMADIC">NOMADIC (Bureau Nomade Terrestre)</option>
                  <option value="VIRTUAL">ONLINE-Z (Circonspection Virtuelle)</option>
                  <option value="FIXED">FIXED (Bureau Fixe Physique)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Code Bureau de Destination</label>
                <input type="text" value={targetCode} onChange={(e) => setTargetCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Motif Officiel du Transfert</label>
                <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setTransferTarget(null)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="button" onClick={() => setModalOpen(true)} style={{ background: '#003893', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>
                Valider le Transfert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {transferTarget && (
        <ConfirmationModal
          isOpen={modalOpen}
          title="Confirmer le transfert d'affectation"
          actionName="Transfert d'affectation électorale"
          targetResource={`${transferTarget.electorName} ➔ ${targetCode} (${targetType})`}
          consequenceSummary={`L'affectation précédente (${transferTarget.currentStationCode}) sera désactivée. L'électeur ne pourra voter QUE dans le nouveau bureau.`}
          tone="primary"
          onConfirm={handleExecuteTransfer}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

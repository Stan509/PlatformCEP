import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface PVItem {
  id: string;
  stationCode: string;
  department: string;
  commune: string;
  receivedAt: string;
  ballotsCast: number;
  blankBallots: number;
  nullBallots: number;
  hash: string;
  signatureStatus: 'MTLS_VALID' | 'SIGNATURE_INVALID' | 'PENDING';
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED';
}

const INITIAL_PVS: PVItem[] = [
  { id: 'pv-001', stationCode: 'BV-PAP-012', department: 'Ouest', commune: 'Port-au-Prince', receivedAt: '2026-11-15T18:30:00Z', ballotsCast: 420, blankBallots: 4, nullBallots: 2, hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', signatureStatus: 'MTLS_VALID', status: 'VALIDATED' },
  { id: 'pv-002', stationCode: 'BV-CAP-004', department: 'Nord', commune: 'Cap-Haïtien', receivedAt: '2026-11-15T19:15:00Z', ballotsCast: 184, blankBallots: 1, nullBallots: 1, hash: 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2', signatureStatus: 'MTLS_VALID', status: 'UNDER_REVIEW' },
  { id: 'pv-003', stationCode: 'BV-PAP-013', department: 'Ouest', commune: 'Pétion-Ville', receivedAt: '2026-11-15T19:40:00Z', ballotsCast: 245, blankBallots: 2, nullBallots: 0, hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284ddd200126d9069b', signatureStatus: 'MTLS_VALID', status: 'RECEIVED' },
];

interface PVPageProps {
  user: UserAccount;
}

export function PVPage({ user }: PVPageProps): JSX.Element {
  const [pvList, setPvList] = useState<PVItem[]>(INITIAL_PVS);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPv, setTargetPv] = useState<{ pv: PVItem; action: 'VALIDATE' | 'REJECT' } | null>(null);

  const handleAction = (pv: PVItem, action: 'VALIDATE' | 'REJECT') => {
    setTargetPv({ pv, action });
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (!targetPv) return;
    const { pv, action } = targetPv;

    setPvList((prev) =>
      prev.map((item) => {
        if (item.id === pv.id) {
          return { ...item, status: action === 'VALIDATE' ? 'VALIDATED' : 'REJECTED' };
        }
        return item;
      })
    );

    setModalOpen(false);
    setTargetPv(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          📄 Homologation & Inspection des Procès-Verbaux (PV)
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Contrôle cryptographique SHA-256, validation mTLS et intégration des PV dans la tabulation nationale.
        </p>
      </div>

      {/* PV Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Code Bureau (BV)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Localisation</th>
              <th style={{ padding: '0.8rem 1rem' }}>Réception</th>
              <th style={{ padding: '0.8rem 1rem' }}>Bulletins Exprimés</th>
              <th style={{ padding: '0.8rem 1rem' }}>Empreinte Hash SHA-256</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut PV</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pvList.map((pv) => (
              <tr key={pv.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#003893' }}>{pv.stationCode}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{pv.department} ({pv.commune})</td>
                <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem' }}>{pv.receivedAt.substring(0, 16).replace('T', ' ')}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <strong>{pv.ballotsCast}</strong> (Blancs: {pv.blankBallots}, Nuls: {pv.nullBallots})
                </td>
                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#555' }}>
                  {pv.hash.substring(0, 16)}...
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: pv.status === 'VALIDATED' ? '#e6f4ea' : pv.status === 'REJECTED' ? '#fce8e6' : '#fef7e0', color: pv.status === 'VALIDATED' ? '#137333' : pv.status === 'REJECTED' ? '#c5221f' : '#b06000' }}>
                    {pv.status}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {pv.status !== 'VALIDATED' && (
                      <button
                        type="button"
                        onClick={() => handleAction(pv, 'VALIDATE')}
                        style={{ background: '#137333', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Valider
                      </button>
                    )}
                    {pv.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleAction(pv, 'REJECT')}
                        style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Rejeter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {targetPv && (
        <ConfirmationModal
          isOpen={modalOpen}
          title={targetPv.action === 'VALIDATE' ? 'Valider officiellement ce PV' : 'Rejeter ce PV'}
          actionName={targetPv.action === 'VALIDATE' ? 'Homologation légale du Procès-Verbal' : 'Rejet d\'un PV litigieux'}
          targetResource={`${targetPv.pv.stationCode} (${targetPv.pv.department})`}
          consequenceSummary={targetPv.action === 'VALIDATE' ? 'Les chiffres de ce PV seront intégrés aux résultats officiels consolidés.' : 'Le PV sera écarté de la tabulation et transmis au bureau du contentieux.'}
          tone={targetPv.action === 'VALIDATE' ? 'primary' : 'danger'}
          onConfirm={handleConfirm}
          onCancel={() => { setModalOpen(false); setTargetPv(null); }}
        />
      )}
    </div>
  );
}

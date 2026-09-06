import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface TallyItem {
  stationCode: string;
  stationName: string;
  department: string;
  commune: string;
  officialVotes: number;
  mandataireVotes: number;
  discrepancy: number;
  status: 'MATCHED' | 'DISCREPANCY_ALERT' | 'PENDING_VALIDATION';
}

const INITIAL_TALLIES: TallyItem[] = [
  { stationCode: 'BV-PAP-012', stationName: 'Lycée Alexandre Pétion (#012)', department: 'Ouest', commune: 'Port-au-Prince', officialVotes: 420, mandataireVotes: 420, discrepancy: 0, status: 'MATCHED' },
  { stationCode: 'BV-CAP-004', stationName: 'École Nationale Citadelle (#004)', department: 'Nord', commune: 'Cap-Haïtien', officialVotes: 182, mandataireVotes: 184, discrepancy: 2, status: 'DISCREPANCY_ALERT' },
  { stationCode: 'BV-PAP-013', stationName: 'Bureau Nomade Pétion-Ville (#013)', department: 'Ouest', commune: 'Pétion-Ville', officialVotes: 245, mandataireVotes: 245, discrepancy: 0, status: 'MATCHED' },
  { stationCode: 'BV-GON-001', stationName: 'Lycée St-Charles (#001)', department: 'Artibonite', commune: 'Gonaïves', officialVotes: 310, mandataireVotes: 310, discrepancy: 0, status: 'PENDING_VALIDATION' },
];

interface CountPageProps {
  user: UserAccount;
}

export function CountPage({ user }: CountPageProps): JSX.Element {
  const [tallies, setTallies] = useState<TallyItem[]>(INITIAL_TALLIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTally, setSelectedTally] = useState<TallyItem | null>(null);

  const handleValidate = (tally: TallyItem) => {
    setSelectedTally(tally);
    setModalOpen(true);
  };

  const handleConfirmValidation = () => {
    if (!selectedTally) return;

    setTallies((prev) =>
      prev.map((t) => (t.stationCode === selectedTally.stationCode ? { ...t, status: 'MATCHED', discrepancy: 0 } : t))
    );

    setModalOpen(false);
    setSelectedTally(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          🔢 Comptage Officiel & Décompte Contradictoire des Mandataires
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Réconciliation contradictoire entre le décompte officiel du bureau de vote et les relevés des mandataires de partis.
        </p>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>BUREAUX CONCORDANTS</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#137333', marginTop: 2 }}>3 / 4</strong>
        </div>
        <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', borderTop: '4px solid #c5221f' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>ÉCARTS MANDATAIRES</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#c5221f', marginTop: 2 }}>1 ALERTE (2 voix)</strong>
        </div>
      </div>

      {/* Tallies Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Code & Nom Bureau</th>
              <th style={{ padding: '0.8rem 1rem' }}>Département / Commune</th>
              <th style={{ padding: '0.8rem 1rem' }}>Total Décompte CEP</th>
              <th style={{ padding: '0.8rem 1rem' }}>Total Relevé Mandataires</th>
              <th style={{ padding: '0.8rem 1rem' }}>Écart Constaté</th>
              <th style={{ padding: '0.8rem 1rem' }}>Statut Réconciliation</th>
              <th style={{ padding: '0.8rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tallies.map((t) => (
              <tr key={t.stationCode} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <strong>{t.stationCode}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>{t.stationName}</div>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>{t.department} ({t.commune})</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#003893' }}>{t.officialVotes} voix</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#3c4043' }}>{t.mandataireVotes} voix</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: t.discrepancy > 0 ? '#c5221f' : '#137333' }}>
                  {t.discrepancy > 0 ? `+${t.discrepancy} voix` : '0 (Conforme)'}
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: t.status === 'MATCHED' ? '#e6f4ea' : t.status === 'DISCREPANCY_ALERT' ? '#fce8e6' : '#fef7e0', color: t.status === 'MATCHED' ? '#137333' : t.status === 'DISCREPANCY_ALERT' ? '#c5221f' : '#b06000' }}>
                    {t.status === 'MATCHED' ? 'CONFORME' : t.status === 'DISCREPANCY_ALERT' ? 'LITIGE / ÉCART' : 'EN ATTENTE'}
                  </span>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  {t.status !== 'MATCHED' && (
                    <button
                      type="button"
                      onClick={() => handleValidate(t)}
                      style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Arbitrer & Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTally && (
        <ConfirmationModal
          isOpen={modalOpen}
          title="Valider la réconciliation du décompte"
          actionName="Homologation de comptage contradictoire"
          targetResource={`${selectedTally.stationCode} (${selectedTally.stationName})`}
          consequenceSummary={`L'écart de ${selectedTally.discrepancy} voix sera arbitré par le CEP et le procès-verbal sera définitivement validé pour la tabulation.`}
          tone="primary"
          onConfirm={handleConfirmValidation}
          onCancel={() => { setModalOpen(false); setSelectedTally(null); }}
        />
      )}
    </div>
  );
}

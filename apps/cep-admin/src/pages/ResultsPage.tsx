import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface CandidateResultRow {
  number: string;
  name: string;
  party: string;
  post: string;
  votes: number;
  percentage: number;
  status: 'LEADING' | 'SECOND' | 'QUALIFIED';
}

const RESULTS_DATA: CandidateResultRow[] = [
  { number: '#14', name: 'Jean-Charles Moïse', party: 'Pitit Desalin', post: 'Président', votes: 1420500, percentage: 34.2, status: 'LEADING' },
  { number: '#07', name: 'Mirlande Manigat', party: 'RDNP', post: 'Président', votes: 1210400, percentage: 29.1, status: 'SECOND' },
  { number: '#22', name: 'Steven Benoît', party: 'LAPEH', post: 'Sénateur (Ouest)', votes: 450200, percentage: 41.5, status: 'QUALIFIED' },
  { number: '#03', name: 'Jerry Tardieu', party: 'En Avant', post: 'Député (Pétion-Ville)', votes: 88400, percentage: 52.8, status: 'QUALIFIED' },
];

interface ResultsPageProps {
  user: UserAccount;
}

export function ResultsPage({ user }: ResultsPageProps): JSX.Element {
  const [resultStage, setResultStage] = useState<'PROVISIONAL' | 'PARTIAL' | 'CONSOLIDATED' | 'PUBLISHED'>('PROVISIONAL');
  const [modalOpen, setModalOpen] = useState(false);

  const handlePublishClick = () => {
    setModalOpen(true);
  };

  const handleConfirmPublish = () => {
    setResultStage('PUBLISHED');
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            🏆 Résultats Électoraux & Consolidation des Procès-Verbaux
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Niveaux de confiance des résultats (Bruts ➔ Vérifiés ➔ Provisoires ➔ Publiés par Décret CEP).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '4px 10px', borderRadius: 4, background: resultStage === 'PUBLISHED' ? '#e6f4ea' : '#fef7e0', color: resultStage === 'PUBLISHED' ? '#137333' : '#b06000' }}>
            Statut Actuel : {resultStage === 'PUBLISHED' ? 'OFFICIELLEMENT PUBLIÉ' : 'RÉSULTATS PROVISOIRES (82.5%)'}
          </span>
          {resultStage !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={handlePublishClick}
              style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
            >
              🚀 Publier les Résultats Officiels
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}># Bulletin</th>
              <th style={{ padding: '0.8rem 1rem' }}>Nom du Candidat</th>
              <th style={{ padding: '0.8rem 1rem' }}>Parti Politique</th>
              <th style={{ padding: '0.8rem 1rem' }}>Poste Visé</th>
              <th style={{ padding: '0.8rem 1rem' }}>Suffrages Exprimés</th>
              <th style={{ padding: '0.8rem 1rem' }}>Pourcentage %</th>
              <th style={{ padding: '0.8rem 1rem' }}>Position</th>
            </tr>
          </thead>
          <tbody>
            {RESULTS_DATA.map((r) => (
              <tr key={r.number} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#003893' }}>{r.number}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>{r.name}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{r.party}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{r.post}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#002d62' }}>{r.votes.toLocaleString()} voix</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#137333' }}>{r.percentage} %</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', background: r.status === 'LEADING' ? '#eef4ff' : '#f8f9fa', color: '#003893' }}>
                    {r.status === 'LEADING' ? '🥇 En Tête' : r.status === 'SECOND' ? '🥈 Deuxième' : '✅ Qualifié'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        title="Publication légale des résultats électoraux"
        actionName="Publication officielle des résultats par le CEP"
        targetResource="Élections Générales d'Haïti 2026 (e1)"
        consequenceSummary="Les résultats seront rendus publics sur le portail citoyen et deviendront juridiquement exécutoires."
        tone="primary"
        onConfirm={handleConfirmPublish}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';

interface ParticipationStat {
  department: string;
  eligible: number;
  participantsTotal: number;
  physical: number;
  nomadic: number;
  onlineZ: number;
  turnoutPercent: number;
}

const STATS: ParticipationStat[] = [
  { department: 'Ouest', eligible: 2140500, participantsTotal: 1476945, physical: 1100000, nomadic: 220000, onlineZ: 156945, turnoutPercent: 69.0 },
  { department: 'Artibonite', eligible: 980200, participantsTotal: 656734, physical: 520000, nomadic: 136734, onlineZ: 0, turnoutPercent: 67.0 },
  { department: 'Nord', eligible: 740100, participantsTotal: 532872, physical: 410000, nomadic: 82000, onlineZ: 40872, turnoutPercent: 72.0 },
  { department: 'Sud', eligible: 480300, participantsTotal: 312195, physical: 260000, nomadic: 52195, onlineZ: 0, turnoutPercent: 65.0 },
  { department: 'Centre', eligible: 410000, participantsTotal: 258300, physical: 210000, nomadic: 48300, onlineZ: 0, turnoutPercent: 63.0 },
];

interface ParticipationPageProps {
  user: UserAccount;
}

export function ParticipationPage({ user }: ParticipationPageProps): JSX.Element {
  const [selectedDept, setSelectedDept] = useState('ALL');

  const filtered = selectedDept === 'ALL' ? STATS : STATS.filter((s) => s.department === selectedDept);

  const totalEligible = filtered.reduce((acc, s) => acc + s.eligible, 0);
  const totalVoted = filtered.reduce((acc, s) => acc + s.participantsTotal, 0);
  const avgTurnout = totalEligible > 0 ? ((totalVoted / totalEligible) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          📊 Statistiques de Participation Électorale en Temps Réel
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Taux de participation agrégés par département et modalités (Physique, Nomade, ONLINE-Z).
        </p>
      </div>

      {/* Secret Vote Warning Box */}
      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '1rem', borderRadius: 8, fontSize: '0.85rem', color: '#002d62' }}>
        🔒 <strong>Garantie Absolue de Secret du Vote :</strong> Les données de participation mesurent uniquement le volume de citoyens ayant exercé leur droit de vote. Aucun lien n'existe ni ne peut être déduit entre l'identité de l'électeur et son choix électoral.
      </div>

      {/* Filter */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrer par Département :</span>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="ALL">Tous les Départements</option>
          {STATS.map((s) => (
            <option key={s.department} value={s.department}>{s.department}</option>
          ))}
        </select>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #003893' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>ÉLECTEURS ÉLIGIBLES</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 4 }}>{totalEligible.toLocaleString()}</strong>
        </div>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>VOTANTS COMPTABILISÉS</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', marginTop: 4 }}>{totalVoted.toLocaleString()}</strong>
        </div>
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #9c27b0' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>TAUX DE PARTICIPATION</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#9c27b0', marginTop: 4 }}>{avgTurnout} %</strong>
        </div>
      </div>

      {/* Table Breakdown */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Département</th>
              <th style={{ padding: '0.8rem 1rem' }}>Électeurs Éligibles</th>
              <th style={{ padding: '0.8rem 1rem' }}>Votants Physique (FIXED)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Votants Nomade (NOMADIC)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Votants Virtuel (ONLINE-Z)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Taux Global</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.department} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#002d62' }}>{s.department}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{s.eligible.toLocaleString()}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{s.physical.toLocaleString()}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{s.nomadic.toLocaleString()}</td>
                <td style={{ padding: '0.8rem 1rem' }}>{s.onlineZ > 0 ? s.onlineZ.toLocaleString() : 'N/A (Desactive)'}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#137333' }}>{s.turnoutPercent} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

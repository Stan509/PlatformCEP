import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { adminApi } from '../lib/api';
import type { AdminCandidate, ElectoralMandataire, UserAccount } from '../lib/mockData';
import { getCommunesByDepartmentName } from '../lib/haitiGeo';

interface CandidatePortalProps {
  user: UserAccount;
  onLogout: () => void;
}

export function CandidatePortal({ user, onLogout }: CandidatePortalProps): JSX.Element {
  const [candidate, setCandidate] = useState<AdminCandidate | null>(null);
  const [mandataires, setMandataires] = useState<ElectoralMandataire[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Mandataire pour Candidat Indépendant
  const [modalOpen, setModalOpen] = useState(false);
  const [mandatFullName, setMandatFullName] = useState('');
  const [mandatDept, setMandatDept] = useState('Ouest');
  const [mandatCommune, setMandatCommune] = useState('Port-au-Prince');
  const [mandatBvCode, setMandatBvCode] = useState('BV-PAP-012');
  const [mandatBvName, setMandatBvName] = useState('Lycée Alexandre Pétion');
  const [mandatPhone, setMandatPhone] = useState('+509 3700-0000');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, mList] = await Promise.all([
        adminApi.candidates(),
        adminApi.mandataires(),
      ]);

      const myCandidate = cList.find((c) => c.id === user.candidateId || c.name.toLowerCase() === user.fullName.toLowerCase()) || cList[0];
      setCandidate(myCandidate || null);

      if (myCandidate) {
        setMandataires(mList.filter((m) => m.candidateId === myCandidate.id || m.candidateName === myCandidate.name));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isIndependent = Boolean(
    candidate &&
    (candidate.partyId === 'INDENT' || candidate.party.toLowerCase().includes('indépendant') || candidate.party === 'Candidat Indépendant')
  );

  const handleMandatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    const newMandat: ElectoralMandataire = {
      id: `m-${Date.now()}`,
      fullName: mandatFullName,
      partyId: 'INDENT',
      partyName: 'Candidat Indépendant',
      candidateId: candidate.id,
      candidateName: candidate.name,
      department: mandatDept,
      commune: mandatCommune,
      pollingStationCode: mandatBvCode,
      pollingStationName: mandatBvName,
      phone: mandatPhone,
      status: 'ACTIVE',
      remarksCount: 0,
    };

    const updated = await adminApi.saveMandataire(newMandat);
    setMandataires(updated.filter((m) => m.candidateId === candidate.id || m.candidateName === candidate.name));
    setModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar */}
      <header
        style={{
          background: 'var(--cep-color-deep-blue, #002d62)',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👁️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Espace Candidat Observateur — Suivi Officiel en Direct</h1>
            <span style={{ fontSize: '0.85rem', color: '#a2c4ec' }}>
              Candidat Authentifié : {user.fullName} | Accréditation & Suivi du Scrutin
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: '#c5221f',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Candidate Identity Card */}
        {candidate && (
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              border: '2px solid var(--cep-color-cep-blue)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #002d62' }}
              />
              <div>
                <span style={{ background: '#002d62', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
                  BULLETIN {candidate.number || '#14'}
                </span>
                <h2 style={{ margin: '4px 0 0', color: 'var(--cep-color-deep-blue)', fontSize: '1.5rem' }}>
                  {candidate.name}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'gray' }}>
                  Poste : <strong>{candidate.post}</strong> | Affiliation : <strong>{candidate.party}</strong> | Territoire : <strong>{candidate.territory}</strong>
                </p>
                <span style={{ display: 'inline-block', marginTop: 6, background: '#e6f4ea', color: '#137333', fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem' }}>
                  ✓ Dossier de Candidature Approuvé et Publié au Journal Officiel
                </span>
              </div>
            </div>

            {/* Mandataire Registration Button ONLY for Independent Candidates */}
            {isIndependent && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  background: '#137333',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Accréditer un Mandataire (Candidat Indépendant)
              </button>
            )}
          </div>
        )}

        {/* Notice for Party-Affiliated / Presidential Councilors Candidates */}
        {!isIndependent && candidate && (
          <div style={{ background: '#eef4ff', borderLeft: '4px solid #0d6efd', padding: '1rem 1.25rem', borderRadius: 8, fontSize: '0.88rem', color: '#0d2e5c' }}>
            ℹ️ <strong>Règle Électorale Mandataires :</strong> En tant que candidat rattaché à un Parti Politique (<strong>{candidate.party}</strong>), l'accréditation et l'affectation des mandataires dans les bureaux de vote sont gérées centralement par la direction de votre Parti Politique. Vous recevez ici en temps réel le flux des observations et procès-verbaux de vos mandataires.
          </div>
        )}

        {/* Live Vote Metrics for this Candidate */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Total Suffrages Exprimés (En Direct)</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>1 420 500 voix</strong>
            <span style={{ fontSize: '0.82rem', color: '#137333', fontWeight: 600 }}>● 34.2 % des voix comptabilisées</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Bureaux Reçus à la Tabulation</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>11 450 / 13 850</strong>
            <span style={{ fontSize: '0.82rem', color: '#0d6efd', fontWeight: 600 }}>Taux de couverture: 82.6 %</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Mandataires Déployés</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>
              {isIndependent ? mandataires.length : 1420} mandataires
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#137333', fontWeight: 600 }}>Circonscription couverte</span>
          </div>
        </div>

        {/* Mandataires Feed for Independent Candidate */}
        {isIndependent && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
              📋 Vos Mandataires Accrédités (Candidat Indépendant)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Mandataire Accrédité</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Département & Commune</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Bureau de Vote (BV)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Téléphone</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut Accréditation</th>
                  </tr>
                </thead>
                <tbody>
                  {mandataires.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'gray' }}>
                        Aucun mandataire accrédité pour le moment. Cliquez sur "+ Accréditer un Mandataire" ci-dessus.
                      </td>
                    </tr>
                  ) : (
                    mandataires.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.fullName}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{m.department} — {m.commune}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <code style={{ color: '#0d6efd', fontWeight: 700 }}>{m.pollingStationCode}</code> ({m.pollingStationName})
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{m.phone}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                            ✓ Accrédité CEP (Indépendant)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Observations Feed */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            📡 Remontées Directes des Mandataires & Observateurs de Terrain
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
              <strong style={{ color: 'var(--cep-color-deep-blue)' }}>Mandataire Pierre-Richard Alexis (Port-au-Prince - BV-PAP-012)</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#444' }}>
                "Ouverture régulière à 06h00. Décompte contradictoire parallèle achevé : 184 voix obtenues sur 420 exprimés dans ce bureau."
              </p>
              <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block', marginTop: 4 }}>Transmis il y a 25 min</span>
            </div>

            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
              <strong style={{ color: 'var(--cep-color-deep-blue)' }}>Mandataire Jean-Marc Delva (Cap-Haïtien - BV-CAP-004)</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#444' }}>
                "Présence effective des observateurs. Dépouillement régulier et procès-verbal signé sans incident."
              </p>
              <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block', marginTop: 4 }}>Transmis il y a 1 h</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Accréditer Mandataire pour Candidat Indépendant */}
      {modalOpen && isIndependent && candidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              Accréditer un Mandataire (Candidat Indépendant: {candidate.name})
            </h2>
            <form onSubmit={handleMandatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom Complet du Mandataire</label>
                <input type="text" required value={mandatFullName} onChange={(e) => setMandatFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Département</label>
                  <select value={mandatDept} onChange={(e) => setMandatDept(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    {['Ouest', 'Artibonite', 'Nord', 'Sud', 'Grand\'Anse', 'Centre', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Nippes'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Commune</label>
                  <select value={mandatCommune} onChange={(e) => setMandatCommune(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    {getCommunesByDepartmentName(mandatDept).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code Bureau de Vote (BV)</label>
                  <input type="text" required value={mandatBvCode} onChange={(e) => setMandatBvCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom du Centre / Bureau</label>
                  <input type="text" required value={mandatBvName} onChange={(e) => setMandatBvName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Numéro Téléphone</label>
                <input type="text" required value={mandatPhone} onChange={(e) => setMandatPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#eee', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                  Valider l'Accréditation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


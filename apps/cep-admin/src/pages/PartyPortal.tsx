import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { adminApi } from '../lib/api';
import type { AdminCandidate, ElectoralMandataire, PoliticalParty, UserAccount } from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

interface PartyPortalProps {
  user: UserAccount;
  onLogout: () => void;
}

export function PartyPortal({ user, onLogout }: PartyPortalProps): JSX.Element {
  const [party, setParty] = useState<PoliticalParty | null>(null);
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [mandataires, setMandataires] = useState<ElectoralMandataire[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Mandataire
  const [modalOpen, setModalOpen] = useState(false);
  const [mandatFullName, setMandatFullName] = useState('');
  const [mandatDept, setMandatDept] = useState('Ouest');
  const [mandatCommune, setMandatCommune] = useState('Port-au-Prince');
  const [mandatBvCode, setMandatBvCode] = useState('BV-PAP-012');
  const [mandatBvName, setMandatBvName] = useState('Lycée Alexandre Pétion');
  const [mandatPhone, setMandatPhone] = useState('+509 3700-0000');

  const loadPartyData = async () => {
    setLoading(true);
    try {
      const [pList, cList, mList] = await Promise.all([
        adminApi.parties(),
        adminApi.candidates(),
        adminApi.mandataires(),
      ]);

      const myParty = pList.find((p) => p.id === user.partyId || p.acronym === 'PITIT') || pList[0];
      setParty(myParty || null);

      if (myParty) {
        setCandidates(cList.filter((c) => c.partyId === myParty.id || c.party === myParty.name));
        setMandataires(mList.filter((m) => m.partyId === myParty.id || m.partyName === myParty.name));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartyData();
  }, []);

  const handleMandatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party) return;

    const newMandat: ElectoralMandataire = {
      id: `m-${Date.now()}`,
      fullName: mandatFullName,
      partyId: party.id,
      partyName: party.name,
      department: mandatDept,
      commune: mandatCommune,
      pollingStationCode: mandatBvCode,
      pollingStationName: mandatBvName,
      phone: mandatPhone,
      status: 'ACTIVE',
      remarksCount: 0,
    };

    const updated = await adminApi.saveMandataire(newMandat);
    setMandataires(updated.filter((m) => m.partyId === party.id || m.partyName === party.name));
    setModalOpen(false);
  };

  const currentCommunes = getCommunesByDepartmentName(mandatDept);

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
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Espace Dédié Parti Politique Officiel</h1>
            <span style={{ fontSize: '0.85rem', color: '#a2c4ec' }}>
              Compte Officiel : {user.fullName} | Accréditation & Suivi des Mandataires
            </span>
          </div>
        </div>

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
      </header>

      <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Party Identity Card */}
        {party && (
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
                src={party.logoUrl}
                alt={party.acronym}
                style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '2px solid #ccc' }}
              />
              <div>
                <span style={{ background: '#002d62', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
                  {party.acronym}
                </span>
                <h2 style={{ margin: '4px 0 0', color: 'var(--cep-color-deep-blue)', fontSize: '1.5rem' }}>
                  {party.name}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'gray' }}>
                  Représentant Légal : <strong>{party.leaderName}</strong> | Siège : <strong>{party.address}</strong>
                </p>
              </div>
            </div>

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
              + Accréditer un Mandataire pour le Parti
            </button>
          </div>
        )}

        {/* Party Registered Candidates List */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            👤 Candidates de Votre Parti Politique Accrédités par le CEP
          </h3>

          {loading ? (
            <div>Chargement...</div>
          ) : candidates.length === 0 ? (
            <p style={{ color: 'gray' }}>Aucun candidat enregistré pour ce parti.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {candidates.map((c) => (
                <div key={c.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <img src={c.photoUrl} alt={c.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block' }}>{c.name} ({c.number})</strong>
                      <span style={{ fontSize: '0.8rem', color: 'gray' }}>{c.post} — {c.territory}</span>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#555', fontStyle: 'italic' }}>"{c.slogan}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mandataires List for Party */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            📋 Mandataires Déployés par Votre Parti dans les Bureaux de Vote
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
                {mandataires.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.fullName}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{m.department} — {m.commune}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <code style={{ color: '#0d6efd', fontWeight: 700 }}>{m.pollingStationCode}</code> ({m.pollingStationName})
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{m.phone}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                        ✓ Accrédité CEP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Accréditer Mandataire */}
      {modalOpen && party && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              Accréditer un Mandataire pour {party.name}
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
                    {HAITI_DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Commune</label>
                  <select value={mandatCommune} onChange={(e) => setMandatCommune(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    {currentCommunes.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code BV</label>
                  <input type="text" required value={mandatBvCode} onChange={(e) => setMandatBvCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom du Centre de Vote</label>
                  <input type="text" required value={mandatBvName} onChange={(e) => setMandatBvName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Téléphone Mandataire</label>
                <input type="text" required value={mandatPhone} onChange={(e) => setMandatPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Accréditer Mandataire</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

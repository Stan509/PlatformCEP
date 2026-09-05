import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type { ElectoralMandataire, PoliticalParty } from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

export function Parties(): JSX.Element {
  const { t } = useI18n();
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [mandataires, setMandataires] = useState<ElectoralMandataire[]>([]);
  const [loading, setLoading] = useState(true);

  // Party Modal State
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null);
  const [partyName, setPartyName] = useState('');
  const [partyAcronym, setPartyAcronym] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Mandataire Modal State
  const [mandatModalOpen, setMandatModalOpen] = useState(false);
  const [mandatFullName, setMandatFullName] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [mandatDept, setMandatDept] = useState('Ouest');
  const [mandatCommune, setMandatCommune] = useState('Port-au-Prince');
  const [mandatBvCode, setMandatBvCode] = useState('BV-PAP-012');
  const [mandatBvName, setMandatBvName] = useState('Lycée Alexandre Pétion');
  const [mandatPhone, setMandatPhone] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, mList] = await Promise.all([adminApi.parties(), adminApi.mandataires()]);
      setParties(pList);
      setMandataires(mList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreatePartyModal = () => {
    setEditingParty(null);
    setPartyName('');
    setPartyAcronym('');
    setLeaderName('');
    setAddress('');
    setLogoUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80');
    setPartyModalOpen(true);
  };

  const openEditPartyModal = (p: PoliticalParty) => {
    setEditingParty(p);
    setPartyName(p.name);
    setPartyAcronym(p.acronym);
    setLeaderName(p.leaderName);
    setAddress(p.address);
    setLogoUrl(p.logoUrl);
    setPartyModalOpen(true);
  };

  const handlePartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partyData: PoliticalParty = {
      id: editingParty ? editingParty.id : `p-${Date.now()}`,
      name: partyName,
      acronym: partyAcronym,
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80',
      leaderName,
      legalStatus: 'RECOGNIZED',
      address,
      mandatairesCount: editingParty ? editingParty.mandatairesCount : 0,
      candidatesCount: editingParty ? editingParty.candidatesCount : 0,
    };

    const updated = await adminApi.saveParty(partyData);
    setParties(updated);
    setPartyModalOpen(false);
  };

  const openAssignMandataireModal = (partyId?: string) => {
    setSelectedPartyId(partyId || parties[0]?.id || 'p1');
    setMandatFullName('');
    setMandatDept('Ouest');
    setMandatCommune('Port-au-Prince');
    setMandatBvCode('BV-PAP-012');
    setMandatBvName('Lycée Alexandre Pétion');
    setMandatPhone('+509 3700-0000');
    setMandatModalOpen(true);
  };

  const handleMandatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partyObj = parties.find((p) => p.id === selectedPartyId);
    const newMandat: ElectoralMandataire = {
      id: `m-${Date.now()}`,
      fullName: mandatFullName,
      partyId: selectedPartyId,
      partyName: partyObj ? partyObj.name : 'Parti Politique',
      department: mandatDept,
      commune: mandatCommune,
      pollingStationCode: mandatBvCode,
      pollingStationName: mandatBvName,
      phone: mandatPhone,
      status: 'ACTIVE',
      remarksCount: 0,
    };

    const updated = await adminApi.saveMandataire(newMandat);
    setMandataires(updated);
    setMandatModalOpen(false);

    // Update mandataire count on party
    if (partyObj) {
      partyObj.mandatairesCount += 1;
      await adminApi.saveParty(partyObj);
    }
  };

  const handleDeleteParty = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce parti politique ?')) {
      const updated = await adminApi.deleteParty(id);
      setParties(updated);
    }
  };

  const currentCommunes = getCommunesByDepartmentName(mandatDept);

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            Gestion des Partis Politiques & Mandataires
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Reconnaissance légale des partis politiques et accréditation des mandataires électoraux par bureau de vote.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={openCreatePartyModal}
            style={{
              background: 'var(--cep-color-cep-blue)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--cep-radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Nouveau Parti Politique
          </button>
          <button
            type="button"
            onClick={() => openAssignMandataireModal()}
            style={{
              background: '#137333',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--cep-radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Affecter un Mandataire
          </button>
        </div>
      </div>

      {/* Political Parties Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {loading ? (
          <div>{t('common.loading')}</div>
        ) : (
          parties.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'white',
                borderRadius: 'var(--cep-radius-lg)',
                border: '1px solid var(--cep-color-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={p.logoUrl}
                  alt={p.acronym}
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid #ccc' }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--cep-color-deep-blue)' }}>{p.name}</h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--cep-color-cep-blue)' }}>
                    Sigle: {p.acronym}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4, background: '#f8f9fa', padding: '0.6rem 0.8rem', borderRadius: 6 }}>
                <div><strong>Représentant Légal:</strong> {p.leaderName}</div>
                <div><strong>Siège Social:</strong> {p.address}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 4 }}>
                  <span><strong>Candidats:</strong> {p.candidatesCount}</span>
                  <span><strong>Mandataires Accrédités:</strong> {p.mandatairesCount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <button
                  type="button"
                  onClick={() => openAssignMandataireModal(p.id)}
                  style={{
                    background: '#e0e8f5',
                    color: '#003893',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Mandataire pour ce parti
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => openEditPartyModal(p)}
                    style={{ background: '#f1f3f4', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteParty(p.id)}
                    style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mandataires Table */}
      <div style={{ background: 'white', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Registre des Mandataires Électoraux Accrédités sur le Terrain
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Nom du Mandataire</th>
                <th style={{ padding: '0.75rem 1rem' }}>Parti / Candidat</th>
                <th style={{ padding: '0.75rem 1rem' }}>Zone & Bureau d'Affectation</th>
                <th style={{ padding: '0.75rem 1rem' }}>Téléphone</th>
                <th style={{ padding: '0.75rem 1rem' }}>Statut Accréditation</th>
              </tr>
            </thead>
            <tbody>
              {mandataires.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--cep-color-deep-blue)' }}>
                    {m.fullName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>{m.partyName}</div>
                    {m.candidateName && <span style={{ fontSize: '0.78rem', color: 'gray' }}>Soutient: {m.candidateName}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>{m.department} — {m.commune}</div>
                    <code style={{ fontSize: '0.75rem', color: '#0d6efd' }}>{m.pollingStationCode} ({m.pollingStationName})</code>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{m.phone}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                      Accrédité CEP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit Party */}
      {partyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              {editingParty ? 'Modifier le Parti Politique' : 'Enregistrer un Parti Politique'}
            </h2>
            <form onSubmit={handlePartySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom du Parti</label>
                <input type="text" required value={partyName} onChange={(e) => setPartyName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Sigle / Acronyme</label>
                  <input type="text" required value={partyAcronym} onChange={(e) => setPartyAcronym(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Représentant Légal</label>
                  <input type="text" required value={leaderName} onChange={(e) => setLeaderName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Adresse du Siège Social</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>URL Logo Officiel</label>
                <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setPartyModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: 'var(--cep-color-cep-blue)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign Mandataire */}
      {mandatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              Accréditer un Mandataire Électoral
            </h2>
            <form onSubmit={handleMandatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom complet du Mandataire</label>
                <input type="text" required value={mandatFullName} onChange={(e) => setMandatFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Parti Politique ou Candidat Indépendant</label>
                <select value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.acronym})</option>
                  ))}
                </select>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code Bureau (BV)</label>
                  <input type="text" required value={mandatBvCode} onChange={(e) => setMandatBvCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom du Centre de Vote</label>
                  <input type="text" required value={mandatBvName} onChange={(e) => setMandatBvName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Téléphone de Contact</label>
                <input type="text" required value={mandatPhone} onChange={(e) => setMandatPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setMandatModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Accréditer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { adminApi } from '../lib/api';
import type { MandataireRemark, UserAccount } from '../lib/mockData';

interface MandatairePortalProps {
  user: UserAccount;
  onLogout: () => void;
}

export function MandatairePortal({ user, onLogout }: MandatairePortalProps): JSX.Element {
  const [remarks, setRemarks] = useState<MandataireRemark[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<'REGULARITY' | 'ANOMALY' | 'DISPUTE' | 'TALLY_CHECK'>('REGULARITY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tallyVotes, setTallyVotes] = useState(180);

  const loadRemarks = async () => {
    const list = await adminApi.remarks();
    setRemarks(list);
  };

  useEffect(() => {
    loadRemarks();
  }, []);

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: MandataireRemark = {
      id: `mr-${Date.now()}`,
      mandataireId: user.mandataireId || 'm1',
      mandataireName: user.fullName,
      partyName: 'Pitit Desalin',
      pollingStationCode: user.pollingStationCode || 'BV-PAP-012',
      category,
      title,
      description,
      tallyVotes: Number(tallyVotes),
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
    };

    const updated = await adminApi.addRemark(newRem);
    setRemarks(updated);
    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
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
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Espace Mandataire Électoral Accrédité</h1>
            <span style={{ fontSize: '0.85rem', color: '#a2c4ec' }}>
              Affecté à : Département {user.department || 'Ouest'}, Commune de {user.commune || 'Port-au-Prince'} ({user.pollingStationCode || 'BV-PAP-012'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.fullName}</span>
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

      {/* Main Body */}
      <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Polling Station Tally Summary Banner */}
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            border: '2px solid var(--cep-color-cep-blue, #003893)',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'gray', fontWeight: 700 }}>
              Bureau de Vote d'Affectation Officielle
            </span>
            <h2 style={{ margin: '4px 0 0', color: 'var(--cep-color-deep-blue)', fontSize: '1.4rem' }}>
              Bureau {user.pollingStationCode || 'BV-PAP-012'} — Lycée Alexandre Pétion
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'gray' }}>
              Inscrits sur la liste d'émargement : <strong>450 électeurs</strong> | Suffrages exprimés : <strong>420 bulletins</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              background: 'var(--cep-color-cep-blue)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            + Consigner une Remarque / Comptage Contradictoire
          </button>
        </div>

        {/* Live Candidate Tally in this Polling Station */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            📊 Décompte Parallèle des Voix dans le Bureau ({user.pollingStationCode || 'BV-PAP-012'})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '2px solid #003893', padding: '1rem', borderRadius: 8, background: '#f0f4fa' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003893' }}>#14 JEAN-CHARLES MOÏSE (Pitit Desalin)</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 4 }}>184 voix</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 600 }}>43.8 % des suffrages exprimés</span>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8, background: 'white' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#555' }}>#07 MIRLANDE MANIGAT (RDNP)</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#333', marginTop: 4 }}>152 voix</strong>
              <span style={{ fontSize: '0.78rem', color: 'gray' }}>36.2 % des suffrages exprimés</span>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8, background: 'white' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#555' }}>#22 STEVEN BENOÎT (LAPEH)</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#333', marginTop: 4 }}>64 voix</strong>
              <span style={{ fontSize: '0.78rem', color: 'gray' }}>15.2 % des suffrages exprimés</span>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8, background: 'white' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#555' }}>BULLETINS BLANCS / NULS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#333', marginTop: 4 }}>20 bulletins</strong>
              <span style={{ fontSize: '0.78rem', color: 'gray' }}>4.8 %</span>
            </div>
          </div>
        </div>

        {/* Mandataire Remarks & Dispute Register */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            📝 Registre des Remarques & Contestations Transmises au CEP
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {remarks.map((r) => (
              <div
                key={r.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: '1rem',
                  background: r.category === 'ANOMALY' || r.category === 'DISPUTE' ? '#fff8f7' : '#f8f9fa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--cep-color-deep-blue)', fontSize: '1rem' }}>{r.title}</strong>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: r.status === 'VALIDATED' ? '#e6f4ea' : '#fef7e0',
                      color: r.status === 'VALIDATED' ? '#137333' : '#b06000',
                    }}
                  >
                    {r.status === 'VALIDATED' ? 'Validé par le CEP' : 'En examen par la BEC'}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#444' }}>{r.description}</p>
                <div style={{ fontSize: '0.78rem', color: 'gray', marginTop: 6, display: 'flex', gap: '1rem' }}>
                  <span>Décompte consigné: <strong>{r.tallyVotes} voix</strong></span>
                  <span>Date: {r.reportedAt}</span>
                  <span>Mandataire: {r.mandataireName} ({r.partyName})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Add Remark */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              Consigner une Remarque / Procès-Verbal Contradictoire
            </h2>
            <form onSubmit={handleAddRemark} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Type d'observation</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="REGULARITY">Régularité de l'ouverture et émargement</option>
                  <option value="TALLY_CHECK">Décompte contradictoire parallèle</option>
                  <option value="ANOMALY">Signalement d'anomalie de procédure</option>
                  <option value="DISPUTE">Contestation officielle de bulletin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Titre de l'observation</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Vérification du décompte contradictoire" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description détaillée</label>
                <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Précisez les faits, numéro de bulletin ou réserve sur la dépouille..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Total Voix Dénombrées pour le Candidat</label>
                <input type="number" required value={tallyVotes} onChange={(e) => setTallyVotes(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: 'var(--cep-color-cep-blue)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Transmettre au CEP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

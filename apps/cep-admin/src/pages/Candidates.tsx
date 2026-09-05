import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type { AdminCandidate, AdminElection } from '../lib/mockData';

const POST_OPTIONS = ['Président', 'Sénateur', 'Député', 'Maire'];
const STATUS_OPTIONS: Array<'APPROVED' | 'PENDING' | 'REJECTED'> = ['APPROVED', 'PENDING', 'REJECTED'];

export function Candidates(): JSX.Element {
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postFilter, setPostFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<AdminCandidate | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [post, setPost] = useState('Président');
  const [territory, setTerritory] = useState('National');
  const [slogan, setSlogan] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [electionId, setElectionId] = useState('e1');
  const [status, setStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, eList] = await Promise.all([adminApi.candidates(), adminApi.elections()]);
      setCandidates(cList);
      setElections(eList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCandidate(null);
    setName('');
    setParty('');
    setPost('Président');
    setTerritory('National');
    setSlogan('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setElectionId(elections[0]?.id || 'e1');
    setStatus('APPROVED');
    setModalOpen(true);
  };

  const openEditModal = (c: AdminCandidate) => {
    setEditingCandidate(c);
    setName(c.name);
    setParty(c.party);
    setPost(c.post);
    setTerritory(c.territory);
    setSlogan(c.slogan);
    setPhotoUrl(c.photoUrl);
    setElectionId(c.electionId);
    setStatus(c.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidateData: AdminCandidate = {
      id: editingCandidate ? editingCandidate.id : `c-${Date.now()}`,
      name,
      party,
      post,
      territory,
      slogan,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      electionId,
      status,
    };

    const updated = await adminApi.saveCandidate(candidateData);
    setCandidates(updated);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      const updated = await adminApi.deleteCandidate(id);
      setCandidates(updated);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.party.toLowerCase().includes(search.toLowerCase()) ||
      c.territory.toLowerCase().includes(search.toLowerCase());
    const matchesPost = postFilter === 'ALL' || c.post === postFilter;
    return matchesSearch && matchesPost;
  });

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            Gestion des Candidats
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Enregistrement et validation officielle des candidatures par poste et circonscription.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          style={{
            background: 'var(--cep-color-cep-blue)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--cep-radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          + Ajouter un Candidat
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          background: 'white',
          padding: 'var(--cep-space-3)',
          borderRadius: 'var(--cep-radius-md)',
          border: '1px solid var(--cep-color-border)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Rechercher par nom, parti, circonscription..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 240,
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--cep-radius-sm)',
            border: '1px solid var(--cep-color-border)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cep-color-text-muted)' }}>Filtrer par poste:</span>
          <select
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--cep-radius-sm)',
              border: '1px solid var(--cep-color-border)',
            }}
          >
            <option value="ALL">Tous les postes</option>
            {POST_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate List Grid */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cep-color-text-muted)' }}>{t('common.loading')}</div>
      ) : filteredCandidates.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: 'var(--cep-radius-md)', border: '1px solid var(--cep-color-border)' }}>
          Aucun candidat ne correspond aux critères.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'white',
                borderRadius: 'var(--cep-radius-md)',
                border: '1px solid var(--cep-color-border)',
                padding: 'var(--cep-space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={c.photoUrl}
                  alt={c.name}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cep-color-cep-blue)' }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--cep-color-deep-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </h3>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(0, 56, 147, 0.1)',
                      color: 'var(--cep-color-cep-blue)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {c.party}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>
                  <strong>Poste:</strong> {c.post}
                </div>
                <div>
                  <strong>Territoire:</strong> {c.territory}
                </div>
                {c.slogan && (
                  <div style={{ fontStyle: 'italic', color: 'var(--cep-color-text-muted)' }}>
                    "{c.slogan}"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: c.status === 'APPROVED' ? '#e6f4ea' : c.status === 'PENDING' ? '#fef7e0' : '#fce8e6',
                    color: c.status === 'APPROVED' ? '#137333' : c.status === 'PENDING' ? '#b06000' : '#c5221f',
                  }}
                >
                  {c.status === 'APPROVED' ? 'Approuvé' : c.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    style={{
                      background: '#f1f3f4',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    style={{
                      background: '#fce8e6',
                      color: '#c5221f',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD Candidat */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--cep-radius-lg)',
              width: '100%',
              maxWidth: 540,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--cep-color-deep-blue)' }}>
              {editingCandidate ? 'Modifier le candidat' : 'Ajouter un nouveau candidat'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom complet</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Parti / Rassemblement</label>
                  <input
                    type="text"
                    required
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Poste</label>
                  <select
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  >
                    {POST_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Territoire / Circonscription</label>
                <input
                  type="text"
                  required
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Slogan de campagne</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>URL Photo officielle</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Élection associée</label>
                  <select
                    value={electionId}
                    onChange={(e) => setElectionId(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  >
                    {elections.map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Statut du dossier</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st === 'APPROVED' ? 'Approuvé' : st === 'PENDING' ? 'En attente' : 'Rejeté'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: '#f1f3f4',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--cep-color-cep-blue)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.2rem',
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

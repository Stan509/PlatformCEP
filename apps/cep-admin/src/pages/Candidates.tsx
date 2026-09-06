import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type { AdminCandidate, AdminElection } from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName, getSectionsCommunales } from '../lib/haitiGeo';

const POST_OPTIONS = ['Président', 'Sénateur', 'Député', 'Maire', 'ASEC/DSEC'];
const STATUS_OPTIONS: Array<'APPROVED' | 'PENDING' | 'REJECTED'> = ['APPROVED', 'PENDING', 'REJECTED'];

export function Candidates(): JSX.Element {
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [registeredParties, setRegisteredParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postFilter, setPostFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<AdminCandidate | null>(null);

  // Form fields
  const [number, setNumber] = useState('#10');
  const [name, setName] = useState('');
  const [isIndependent, setIsIndependent] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [party, setParty] = useState('');
  const [post, setPost] = useState('Président');
  const [selectedDept, setSelectedDept] = useState('Ouest');
  const [selectedCommune, setSelectedCommune] = useState('Port-au-Prince');
  const [selectedSection, setSelectedSection] = useState('');
  const [slogan, setSlogan] = useState('');
  const [policySummary, setPolicySummary] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [electionId, setElectionId] = useState('e1');
  const [status, setStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, eList, pList] = await Promise.all([
        adminApi.candidates(),
        adminApi.elections(),
        adminApi.parties(),
      ]);
      setCandidates(cList);
      setElections(eList);
      setRegisteredParties(pList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCandidate(null);
    setNumber(`#${Math.floor(Math.random() * 80 + 10)}`);
    setName('');
    setIsIndependent(false);
    const defaultParty = registeredParties[0];
    setSelectedPartyId(defaultParty?.id || '');
    setParty(defaultParty ? `${defaultParty.name} (${defaultParty.acronym})` : 'Candidat Indépendant');
    setPost('Président');
    setSelectedDept('Ouest');
    setSelectedCommune('Port-au-Prince');
    setSelectedSection('');
    setSlogan('');
    setPolicySummary('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setElectionId(elections[0]?.id || 'e1');
    setStatus('APPROVED');
    setModalOpen(true);
  };

  const openEditModal = (c: AdminCandidate) => {
    setEditingCandidate(c);
    setNumber(c.number || `#${Math.floor(Math.random() * 80 + 10)}`);
    setName(c.name);
    const isInd = c.party.includes('Indépendant') || c.partyId === 'INDENT';
    setIsIndependent(isInd);
    setParty(c.party);
    setSelectedPartyId(c.partyId || '');
    setPost(c.post);
    setSelectedDept(c.department || 'Ouest');
    setSelectedCommune(c.commune || 'Port-au-Prince');
    setSelectedSection(c.sectionCommunale || '');
    setSlogan(c.slogan);
    setPolicySummary(c.policySummary || '');
    setPhotoUrl(c.photoUrl);
    setElectionId(c.electionId);
    setStatus(c.status);
    setModalOpen(true);
  };

  const handlePartySelect = (partyId: string) => {
    setSelectedPartyId(partyId);
    const found = registeredParties.find((p) => p.id === partyId);
    if (found) {
      setParty(`${found.name} (${found.acronym})`);
    }
  };

  const computeTerritoryLabel = () => {
    if (post === 'Président') return 'National (Haïti)';
    if (post === 'Sénateur') return `Département du ${selectedDept}`;
    if (post === 'Député') return `Circonscription de ${selectedCommune} (${selectedDept})`;
    if (post === 'Maire') return `Commune de ${selectedCommune} (${selectedDept})`;
    return `Section ${selectedSection || 'Communale'} (${selectedCommune})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPartyName = isIndependent ? 'Candidat Indépendant' : party || 'Candidat Indépendant';
    const finalPartyId = isIndependent ? 'INDENT' : selectedPartyId;

    const candidateData: AdminCandidate = {
      id: editingCandidate ? editingCandidate.id : `c-${Date.now()}`,
      number,
      name,
      party: finalPartyName,
      partyId: finalPartyId,
      post,
      territory: computeTerritoryLabel(),
      department: post === 'Président' ? undefined : selectedDept,
      commune: ['Président', 'Sénateur'].includes(post) ? undefined : selectedCommune,
      sectionCommunale: selectedSection || undefined,
      slogan,
      policySummary,
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

  const safeCandidates = Array.isArray(candidates) ? candidates : [];

  const filteredCandidates = safeCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.party.toLowerCase().includes(search.toLowerCase()) ||
      c.territory.toLowerCase().includes(search.toLowerCase()) ||
      (c.number && c.number.toLowerCase().includes(search.toLowerCase()));
    const matchesPost = postFilter === 'ALL' || c.post === postFilter;
    return matchesSearch && matchesPost;
  });

  const currentCommunes = getCommunesByDepartmentName(selectedDept);
  const currentSections = getSectionsCommunales(selectedDept, selectedCommune);

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-4)' }}>
      {/* Navigation rapide du Pôle Électoral */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#eef3fb', padding: '6px', borderRadius: 10, border: '1px solid #d0e0f8' }}>
        <button
          type="button"
          onClick={() => { window.location.hash = '#elections'; }}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'transparent', color: '#003893', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
        >
          🗳️ Scrutins Électoraux
        </button>
        <button
          type="button"
          onClick={() => { window.location.hash = '#candidates'; }}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#003893', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
        >
          👤 Candidats & Programmes
        </button>
        <button
          type="button"
          onClick={() => { window.location.hash = '#parties'; }}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'transparent', color: '#003893', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
        >
          🏛️ Partis Politiques
        </button>
        <button
          type="button"
          onClick={() => { window.location.hash = '#mandataire'; }}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'transparent', color: '#003893', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
        >
          📋 Portail Mandataires V2
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            Gestion des Candidats & Programmes Politiques
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Numérotation officielle sur bulletin, enregistrement géographique et synthèse des lignes politiques.
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
          + Enregistrer un Candidat
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
          placeholder="Rechercher par nom, numéro #14, parti, circonscription..."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.2rem' }}>
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'white',
                borderRadius: 'var(--cep-radius-md)',
                border: '1px solid var(--cep-color-border)',
                padding: 'var(--cep-space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                position: 'relative',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
            >
              {/* Top Banner with Number & Photo */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--cep-color-cep-blue)' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      background: 'var(--cep-color-deep-blue)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: 10,
                      border: '2px solid white',
                    }}
                  >
                    {c.number || '#--'}
                  </span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--cep-color-deep-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </h3>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(0, 56, 147, 0.1)',
                      color: 'var(--cep-color-cep-blue)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {c.party}
                  </span>
                </div>
              </div>

              {/* Territory & Post */}
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4, background: '#f8f9fa', padding: '0.6rem 0.8rem', borderRadius: 6 }}>
                <div><strong>Poste Visé:</strong> {c.post}</div>
                <div><strong>Circonscription:</strong> {c.territory}</div>
                {c.slogan && (
                  <div style={{ fontStyle: 'italic', color: 'var(--cep-color-text-muted)', marginTop: 2 }}>
                    "{c.slogan}"
                  </div>
                )}
              </div>

              {/* Policy Platform Summary */}
              {c.policySummary && (
                <div style={{ fontSize: '0.82rem', color: '#333', lineHeight: 1.4, borderLeft: '3px solid var(--cep-color-cep-blue)', paddingLeft: '0.6rem' }}>
                  <strong>Ligne Politique & Programme:</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--cep-color-text-secondary)' }}>
                    {c.policySummary}
                  </p>
                </div>
              )}

              {/* Footer status & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #eee', marginTop: 'auto' }}>
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
                  {c.status === 'APPROVED' ? 'Dossier Validé' : c.status === 'PENDING' ? 'En Examen' : 'Rejeté'}
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

      {/* Modal CRUD Candidat avec Sélection Géographique Haïti */}
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
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--cep-color-deep-blue)' }}>
              {editingCandidate ? 'Modifier le dossier du candidat' : 'Enregistrer un nouveau candidat'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Numéro Bulletin</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="ex: #14"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cep-color-deep-blue)' }}>
                  🏛️ Affiliation Politique
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="radio"
                      name="affiliation"
                      checked={!isIndependent}
                      onChange={() => {
                        setIsIndependent(false);
                        const firstP = registeredParties[0];
                        if (firstP) handlePartySelect(firstP.id);
                      }}
                    />
                    Parti Politique Enregistré
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="radio"
                      name="affiliation"
                      checked={isIndependent}
                      onChange={() => {
                        setIsIndependent(true);
                        setParty('Candidat Indépendant');
                        setSelectedPartyId('INDENT');
                      }}
                    />
                    Candidat Indépendant
                  </label>
                </div>

                {!isIndependent ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>Sélectionner le Parti Officiel *</label>
                    <select
                      value={selectedPartyId}
                      onChange={(e) => handlePartySelect(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                    >
                      {registeredParties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.acronym})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ padding: '6px 10px', background: '#eef4ff', color: 'var(--cep-color-deep-blue)', borderRadius: 4, fontSize: '0.82rem', fontWeight: 600 }}>
                    ℹ️ Ce candidat sera enregistré sous le statut de <strong>"Candidat Indépendant"</strong> (Sans parti rattaché).
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Poste Convoité</label>
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


              {/* Geographical Selection in Cascade based on post */}
              {post !== 'Président' && (
                <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cep-color-deep-blue)' }}>
                    🎯 Ciblage Géographique d'Haïti
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>Département</label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                      >
                        {HAITI_DEPARTMENTS.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name} (Chef-lieu: {d.chefLieu})
                          </option>
                        ))}
                      </select>
                    </div>

                    {['Député', 'Maire', 'ASEC/DSEC'].includes(post) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>Commune</label>
                        <select
                          value={selectedCommune}
                          onChange={(e) => setSelectedCommune(e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                        >
                          {currentCommunes.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {post === 'ASEC/DSEC' && currentSections.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>Section Communale</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                      >
                        <option value="">Sélectionner une section</option>
                        {currentSections.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ fontSize: '0.78rem', color: 'gray', fontStyle: 'italic' }}>
                    Portée résultante : <strong>{computeTerritoryLabel()}</strong>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Slogan de Campagne</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Synthèse du Programme Politique</label>
                <textarea
                  rows={3}
                  value={policySummary}
                  onChange={(e) => setPolicySummary(e.target.value)}
                  placeholder="Grandes lignes politiques, réformes économiques, sécurité..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>URL Photo Officielle</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Élection</label>
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

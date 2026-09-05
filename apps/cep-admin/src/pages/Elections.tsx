import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator, Table } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminElection } from '../lib/mockData';
import { adminApi } from '../lib/api';

const STATUS_KEYS = [
  'statusDraft',
  'statusPublished',
  'statusOpen',
  'statusClosed',
  'statusTabulation',
  'statusFinal',
];

const ELECTION_TYPES = [
  { value: 'generale_2026', label: 'Élection Générale 2026 (Président, Sénat, Députés, Maïries)' },
  { value: 'presidentielle', label: 'Élection Présidentielle' },
  { value: 'legislative', label: 'Élections Législatives' },
  { value: 'municipale', label: 'Élections Municipales et Locales' },
  { value: 'referendum', label: 'Référendum Constitutionnel' },
];

export function Elections(): JSX.Element {
  const { t } = useI18n();
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal CRUD State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<AdminElection | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('generale_2026');
  const [date, setDate] = useState('2026-11-15');
  const [status, setStatus] = useState('statusDraft');
  const [stations, setStations] = useState(4982);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.elections();
      setElections(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tone: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    statusOpen: 'success',
    statusPublished: 'info',
    statusDraft: 'neutral',
    statusClosed: 'warning',
    statusTabulation: 'info',
    statusFinal: 'neutral',
  };

  const openCreateModal = () => {
    setEditingElection(null);
    setName('');
    setType('generale_2026');
    setDate('2026-11-15');
    setStatus('statusDraft');
    setStations(4982);
    setModalOpen(true);
  };

  const openEditModal = (r: AdminElection) => {
    setEditingElection(r);
    setName(r.name);
    setType(r.type);
    setDate(r.date);
    setStatus(r.status);
    setStations(r.stations);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const electionData: AdminElection = {
      id: editingElection ? editingElection.id : `e-${Date.now()}`,
      name,
      type,
      date,
      status,
      candidates: editingElection ? editingElection.candidates : 0,
      stations: Number(stations),
      lastModified: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };

    const updated = await adminApi.saveElection(electionData);
    setElections(updated);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette élection ?')) {
      const updated = await adminApi.deleteElection(id);
      setElections(updated);
    }
  };

  const columns: TableColumn<AdminElection>[] = [
    { key: 'name', header: t('admin.elections.name'), accessor: (r) => <strong>{r.name}</strong>, sortable: true, sortValue: (r) => r.name },
    { key: 'type', header: t('admin.elections.type'), accessor: (r) => r.type },
    { key: 'date', header: t('admin.elections.date'), accessor: (r) => r.date },
    {
      key: 'status',
      header: t('admin.elections.status'),
      accessor: (r) => <StatusIndicator tone={tone[r.status] ?? 'info'} label={t(`admin.elections.${r.status}`)} />,
    },
    { key: 'stations', header: t('admin.elections.stations'), accessor: (r) => String(r.stations) },
    {
      key: 'actions',
      header: t('admin.devices.actions'),
      accessor: (r) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="secondary" onClick={() => openEditModal(r)}>
            Modifier / Statut
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            {t('admin.elections.title')}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Création, configuration du scrutin, gestion du calendrier et validation des cycles électoraux.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          + Créer une Élection
        </Button>
      </div>

      <Card
        title="Liste des Scrutins Électoraux"
        body={
          loading ? (
            <StateView state="loading" />
          ) : elections.length === 0 ? (
            <StateView state="empty" />
          ) : (
            <Table columns={columns} data={elections} keyField={(r) => r.id} />
          )
        }
      />

      {/* Modal CRUD Election */}
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
              {editingElection ? 'Modifier l\'élection' : 'Créer une nouvelle élection'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom de l'élection</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Élection Présidentielle et Législative 2026"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Type de scrutin</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                >
                  {ELECTION_TYPES.map((tItem) => (
                    <option key={tItem.value} value={tItem.value}>
                      {tItem.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Date du scrutin</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nombre de bureaux prévu</label>
                  <input
                    type="number"
                    required
                    value={stations}
                    onChange={(e) => setStations(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Modalités de vote autorisées</label>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  <label><input type="checkbox" defaultChecked /> Bureaux Fixes</label>
                  <label><input type="checkbox" defaultChecked /> Bureaux Nomades</label>
                  <label><input type="checkbox" defaultChecked /> Bureau Virtuel Online-Z</label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Politique Diaspora</label>
                <select style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}>
                  <option value="CONSULAR_AND_ONLINE">Vote Consulaire + Vote en Ligne PWA</option>
                  <option value="CONSULAR_ONLY">Vote Consulaire Uniquement</option>
                  <option value="REGISTRATION_ONLY">Enregistrement Uniquement (Sans Vote)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Statut du scrutin</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--cep-color-border)' }}
                >
                  {STATUS_KEYS.map((stKey) => (
                    <option key={stKey} value={stKey}>
                      {t(`admin.elections.${stKey}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


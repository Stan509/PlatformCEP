import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type { ApkAgentUser } from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

export function ApkManager(): JSX.Element {
  const { t } = useI18n();
  const [agents, setAgents] = useState<ApkAgentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<ApkAgentUser | null>(null);

  // Form Fields
  const [type, setType] = useState<'FIELD' | 'POLLING_STATION'>('FIELD');
  const [agentCode, setAgentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Ouest');
  const [commune, setCommune] = useState('Port-au-Prince');
  const [coveredSections, setCoveredSections] = useState('Turgeau, Morne l\'Hôpital');
  const [pollingStationCode, setPollingStationCode] = useState('BV-PAP-012');
  const [pollingStationName, setPollingStationName] = useState('Lycée Alexandre Pétion');
  const [address, setAddress] = useState('Rue Monseigneur Guilloux, Port-au-Prince');

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await adminApi.apkAgents();
      setAgents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const openCreateModal = (agentType: 'FIELD' | 'POLLING_STATION') => {
    setEditingAgent(null);
    setType(agentType);
    setAgentCode(agentType === 'FIELD' ? `AGT-FLD-${Math.floor(Math.random() * 800 + 100)}` : `AGT-POL-BV-${Math.floor(Math.random() * 80 + 10)}`);
    setFullName('');
    setPhone('+509 3700-0000');
    setDept('Ouest');
    setCommune('Port-au-Prince');
    setCoveredSections('Turgeau, Morne l\'Hôpital');
    setPollingStationCode('BV-PAP-012');
    setPollingStationName('Lycée Alexandre Pétion');
    setAddress('Rue Monseigneur Guilloux, Port-au-Prince');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const agentData: ApkAgentUser = {
      id: editingAgent ? editingAgent.id : `a-${Date.now()}`,
      type,
      agentCode,
      fullName,
      phone,
      department: dept,
      commune,
      coveredSections: type === 'FIELD' ? coveredSections : undefined,
      pollingStationCode: type === 'POLLING_STATION' ? pollingStationCode : undefined,
      pollingStationName: type === 'POLLING_STATION' ? pollingStationName : undefined,
      address: type === 'POLLING_STATION' ? address : undefined,
      status: 'ACTIVE',
    };

    const updated = await adminApi.saveApkAgent(agentData);
    setAgents(updated);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur APK ?')) {
      const updated = await adminApi.deleteApkAgent(id);
      setAgents(updated);
    }
  };

  const currentCommunes = getCommunesByDepartmentName(dept);

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            Gestion des Utilisateurs d'APKs Mobile
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Accréditation et clés d'accès des agents APK de terrain (Recensement) et agents de bureau de vote (Émargement).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => openCreateModal('FIELD')}
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
            + Agent APK Terrain
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('POLLING_STATION')}
            style={{
              background: '#0d6efd',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--cep-radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Agent APK Bureau de Vote
          </button>
        </div>
      </div>

      {/* Agents Table List */}
      <div style={{ background: 'white', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Registre des Utilisateurs Accrédités par Application APK
        </h3>

        {loading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code & Nom de l'Agent</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type Application APK</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Localisation & Zone Couverte</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Adresse Physique / Bureau</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Téléphone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block' }}>{a.fullName}</strong>
                      <code style={{ fontSize: '0.75rem', color: 'gray' }}>{a.agentCode}</code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: a.type === 'FIELD' ? '#e0e8f5' : '#e6f4ea',
                          color: a.type === 'FIELD' ? '#003893' : '#137333',
                        }}
                      >
                        {a.type === 'FIELD' ? '📱 APK Terrain' : '🗳️ APK Bureau de Vote'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div>{a.department} — {a.commune}</div>
                      {a.coveredSections && <span style={{ fontSize: '0.78rem', color: 'gray' }}>Sections: {a.coveredSections}</span>}
                      {a.pollingStationCode && <code style={{ fontSize: '0.75rem', color: '#0d6efd' }}>{a.pollingStationCode}</code>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {a.address ? (
                        <div>
                          <strong>{a.pollingStationName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'gray' }}>{a.address}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'gray', fontStyle: 'italic' }}>Agent Itinérant (Mobile)</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{a.phone}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Agent */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              Enregistrer un Agent pour {type === 'FIELD' ? 'APK Terrain' : 'APK Bureau de Vote'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code Identifiant</label>
                  <input type="text" required value={agentCode} onChange={(e) => setAgentCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom Complet de l'Agent</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Département</label>
                  <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    {HAITI_DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Commune</label>
                  <select value={commune} onChange={(e) => setCommune(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    {currentCommunes.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {type === 'FIELD' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Sections Communales Couvertes</label>
                  <input type="text" required value={coveredSections} onChange={(e) => setCoveredSections(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code Bureau (BV)</label>
                      <input type="text" required value={pollingStationCode} onChange={(e) => setPollingStationCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom du Centre de Vote</label>
                      <input type="text" required value={pollingStationName} onChange={(e) => setPollingStationName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Adresse Physique Exacte du Bureau</label>
                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Téléphone Portable Agent</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: 'var(--cep-color-cep-blue)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Accréditer Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

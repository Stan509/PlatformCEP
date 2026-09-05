import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type {
  AdminCandidate,
  AdminElection,
  ElectoralMandataire,
  MandataireRemark,
  UserAccount,
} from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

interface CandidatePortalProps {
  user: UserAccount;
  onLogout: () => void;
}

type CandidateView =
  | 'dashboard'
  | 'candidature'
  | 'party'
  | 'mandataires'
  | 'accreditation'
  | 'coverage'
  | 'bureaux'
  | 'online'
  | 'participation'
  | 'decompte'
  | 'pv'
  | 'incidents'
  | 'observations'
  | 'results'
  | 'profile';

interface CandidateIncidentReport {
  id: string;
  stationCode: string;
  category: 'HARDWARE' | 'PROCEDURE' | 'ACCESS' | 'SECURITY' | 'OTHER';
  description: string;
  reportedAt: string;
  status: 'SUBMITTED' | 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
}

export function CandidatePortal({ user, onLogout }: CandidatePortalProps): JSX.Element {
  const { lang, setLang } = useI18n();
  const [activeView, setActiveView] = useState<CandidateView>('dashboard');
  const [candidate, setCandidate] = useState<AdminCandidate | null>(null);
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('elec-2027-pres');
  const [mandataires, setMandataires] = useState<ElectoralMandataire[]>([]);
  const [remarks, setRemarks] = useState<MandataireRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal Mandataire (pour Candidat Indépendant ou Proposition)
  const [modalOpen, setModalOpen] = useState(false);
  const [mandatFullName, setMandatFullName] = useState('');
  const [mandatPhone, setMandatPhone] = useState('+509 3700-0000');
  const [mandatDept, setMandatDept] = useState('Ouest');
  const [mandatCommune, setMandatCommune] = useState('Port-au-Prince');
  const [mandatBvCode, setMandatBvCode] = useState('BV-PAP-012');
  const [mandatBvName, setMandatBvName] = useState('Lycée Alexandre Pétion');

  // Incidents
  const [incidents, setIncidents] = useState<CandidateIncidentReport[]>([
    {
      id: 'INC-CAND-2026-001',
      stationCode: 'BV-PAP-012',
      category: 'PROCEDURE',
      description: 'Divergence constatée lors du premier comptage contradictoire des bulletins non attribués.',
      reportedAt: '2026-09-05 09:30',
      status: 'UNDER_REVIEW',
    },
  ]);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incStation, setIncStation] = useState('BV-PAP-012');
  const [incCategory, setIncCategory] = useState<CandidateIncidentReport['category']>('PROCEDURE');
  const [incDesc, setIncDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, eList, mList, rList] = await Promise.all([
        adminApi.candidates(),
        adminApi.elections(),
        adminApi.mandataires(),
        adminApi.remarks(),
      ]);

      setElections(eList);

      const myCandidate = cList.find((c) => c.id === user.candidateId || c.name.toLowerCase() === user.fullName.toLowerCase()) || cList[0];
      setCandidate(myCandidate || null);

      if (myCandidate) {
        setMandataires(mList.filter((m) => m.candidateId === myCandidate.id || m.candidateName === myCandidate.name || m.partyName === myCandidate.party));
        setRemarks(rList.filter((r) => r.partyName === myCandidate.party));
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
      partyId: isIndependent ? 'INDENT' : candidate.partyId || 'p1',
      partyName: isIndependent ? 'Candidat Indépendant' : candidate.party,
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
    setMandatFullName('');
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: CandidateIncidentReport = {
      id: `INC-CAND-2026-${Math.floor(100 + Math.random() * 900)}`,
      stationCode: incStation,
      category: incCategory,
      description: incDesc,
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
    };
    setIncidents([newInc, ...incidents]);
    setIncidentModalOpen(false);
    setIncDesc('');
  };

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

  const navItems: { id: CandidateView; label: string; icon: string; badge?: number; show: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', show: true },
    { id: 'candidature', label: 'Ma Candidature', icon: '📜', show: true },
    { id: 'party', label: 'Mon Parti', icon: '🏛️', show: true },
    { id: 'mandataires', label: 'Mes Mandataires', icon: '👥', badge: mandataires.length, show: true },
    { id: 'accreditation', label: 'Accréditation', icon: '➕', show: true },
    { id: 'coverage', label: 'Ma Couverture', icon: '🗺️', show: true },
    { id: 'bureaux', label: 'Mes Bureaux', icon: '🏢', show: true },
    { id: 'online', label: 'Online-Z', icon: '🌐', show: true },
    { id: 'participation', label: 'Participation', icon: '👥', show: true },
    { id: 'decompte', label: 'Décompte Parallèle', icon: '📊', show: true },
    { id: 'pv', label: 'Procès-Verbaux', icon: '📄', show: true },
    { id: 'incidents', label: 'Incidents', icon: '🚨', badge: activeIncidentsCount, show: true },
    { id: 'observations', label: 'Observations', icon: '📝', show: true },
    { id: 'results', label: 'Mes Résultats', icon: '📈', show: true },
    { id: 'profile', label: 'Profil & Compte', icon: '👤', show: true },
  ];

  const mobilePrimaryNav = navItems.filter((i) => ['dashboard', 'candidature', 'decompte', 'incidents'].includes(i.id));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: '1.2rem', color: '#002d62', fontWeight: 600 }}>🔄 Chargement du Portail Candidat...</div>
      </div>
    );
  }

  const selectedElection = elections.find((e) => e.id === selectedElectionId) || elections[0];

  return (
    <div className="candidate-layout-root" style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      <style>{`
        .candidate-container {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
        }
        .candidate-desktop-sidebar {
          display: none;
        }
        .candidate-mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 62px;
          background: #002d62;
          color: white;
          border-top: 1px solid rgba(255,255,255,0.15);
          z-index: 990;
          align-items: center;
          justify-content: space-around;
        }
        .candidate-main-area {
          flex: 1;
          padding-bottom: 75px;
        }
        @media (min-width: 768px) {
          .candidate-container {
            flex-direction: row;
          }
          .candidate-desktop-sidebar {
            display: flex;
            width: 230px;
            flex-shrink: 0;
            flex-direction: column;
            background: linear-gradient(180deg, #002d62 0%, #001430 100%);
            color: white;
            padding: 0.8rem 0.5rem;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: hidden;
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
          }
          .candidate-mobile-bottom-nav {
            display: none;
          }
          .candidate-main-area {
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <div className="candidate-container">
        {/* ==================== DESKTOP & TABLET SIDEBAR ==================== */}
        <aside className="candidate-desktop-sidebar">
          <div style={{ padding: '0.4rem 0.6rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            <strong style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.5px' }}>CEP CANDIDAT</strong>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'flex-start' }}>
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  style={{
                    textAlign: 'left',
                    border: 'none',
                    background: isActive ? '#003893' : 'transparent',
                    color: isActive ? 'white' : '#a2c4ec',
                    padding: '0.42rem 0.6rem',
                    borderRadius: 5,
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{ background: item.id === 'incidents' ? '#c5221f' : '#003893', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '0.4rem', marginTop: 'auto' }}>
            <button
              type="button"
              onClick={onLogout}
              style={{
                width: '100%',
                background: 'rgba(197,34,31,0.15)',
                border: '1px solid #c5221f',
                color: '#ff8080',
                padding: '0.45rem 0.6rem',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🚪</span>
              <span>Se Déconnecter</span>
            </button>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="candidate-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Header with Candidate Credentials & Language Options */}
          <header style={{ background: '#002d62', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {candidate?.photoUrl ? (
                <img src={candidate.photoUrl} alt={candidate.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
              ) : (
                <span style={{ fontSize: '1.3rem' }}>👤</span>
              )}
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                  {candidate ? `${candidate.name} (${candidate.number})` : 'Portail Candidat'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#a2c4ec' }}>
                  {candidate?.post} | {candidate?.party}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              {/* Election Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                <span style={{ fontSize: '0.75rem', color: '#a2c4ec' }}>Élection :</span>
                <select
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  {elections.map((e) => (
                    <option key={e.id} value={e.id} style={{ color: '#333' }}>
                      {e.name} ({e.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Switcher */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: 2 }}>
                {(['ht', 'fr', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    style={{
                      border: 'none',
                      background: lang === l ? '#003893' : 'transparent',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l === 'ht' ? 'Kreyòl' : l}
                  </button>
                ))}
              </div>

              <span style={{ background: '#137333', color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                ✓ Candidat Homologué CEP
              </span>
            </div>
          </header>

          <div style={{ maxWidth: 1150, width: '100%', margin: '1.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* VIEW 1: DASHBOARD */}
            {activeView === 'dashboard' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>SUFFRAGES EXPRIMÉS (COMPTÉS)</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>1 420 500 voix</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700 }}>● 34.2 % des suffrages (Rang #1)</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>BUREAUX DÉPOUILLÉS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>11 450 / 13 850</strong>
                    <span style={{ fontSize: '0.75rem', color: '#003893', fontWeight: 600 }}>Taux de couverture: 82.6 %</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>MANDATAIRES DÉDIÉS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>{mandataires.length} mandataires</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333' }}>Surveillance terrain</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>INCIDENTS CONCERNANT VOTRE CANDIDATURE</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: activeIncidentsCount > 0 ? '#c5221f' : '#137333', marginTop: 2 }}>{activeIncidentsCount}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>Sous revue CEP</span>
                  </div>
                </div>

                {/* Candidate Information Notice */}
                {!isIndependent && candidate && (
                  <div style={{ background: '#eef4ff', borderLeft: '4px solid #003893', padding: '1rem 1.25rem', borderRadius: 8, fontSize: '0.85rem', color: '#002d62' }}>
                    ℹ️ <strong>Mandats & Représentation :</strong> En tant que candidat investi par <strong>{candidate.party}</strong>, la gestion d'ensemble des mandataires est coordonnée par la direction de votre Parti Politique. Le flux des procès-verbaux et décomptes vous est directement accessible ci-dessous.
                  </div>
                )}
              </>
            )}

            {/* VIEW 2: CANDIDATURE */}
            {activeView === 'candidature' && candidate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <img src={candidate.photoUrl} alt={candidate.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #002d62' }} />
                <div>
                  <span style={{ background: '#002d62', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>BULLETIN {candidate.number || '#14'}</span>
                  <h2 style={{ margin: '4px 0 0', color: '#002d62', fontSize: '1.5rem' }}>{candidate.name}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'gray' }}>
                    Poste : <strong>{candidate.post}</strong> | Affiliation : <strong>{candidate.party}</strong> | Territoire : <strong>{candidate.territory}</strong>
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#555', fontStyle: 'italic' }}>"{candidate.slogan}"</p>
                  <span style={{ display: 'inline-block', marginTop: 8, background: '#e6f4ea', color: '#137333', fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem' }}>
                    ✓ Dossier de Candidature Publié au Journal Officiel
                  </span>
                </div>
              </div>
            )}

            {/* VIEW 3: MON PARTI */}
            {activeView === 'party' && candidate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.8rem', color: '#002d62', fontSize: '1.2rem' }}>🏛️ Parti Politique de Rattachement</h2>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#002d62', display: 'block' }}>{candidate.party}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'gray' }}>Statut Legal: Accrédité CEP</span>
                </div>
              </div>
            )}

            {/* VIEW 4: MES MANDATAIRES */}
            {activeView === 'mandataires' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.2rem' }}>👥 Mandataires Accrédités pour votre Surveillance</h2>
                  {isIndependent && (
                    <button type="button" onClick={() => setModalOpen(true)} style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                      + Accréditer un Mandataire
                    </button>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Mandataire</th>
                        <th style={{ padding: '0.6rem' }}>Département / Commune</th>
                        <th style={{ padding: '0.6rem' }}>Bureau de Vote</th>
                        <th style={{ padding: '0.6rem' }}>Téléphone</th>
                        <th style={{ padding: '0.6rem' }}>Statut CEP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandataires.map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.6rem', fontWeight: 600 }}>{m.fullName}</td>
                          <td style={{ padding: '0.6rem' }}>{m.department} — {m.commune}</td>
                          <td style={{ padding: '0.6rem' }}><code style={{ color: '#003893', fontWeight: 700 }}>{m.pollingStationCode}</code></td>
                          <td style={{ padding: '0.6rem' }}>{m.phone}</td>
                          <td style={{ padding: '0.6rem' }}>
                            <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>✓ Accrédité</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 5: ACCREDITATION */}
            {activeView === 'accreditation' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', maxWidth: 650 }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>➕ Demande de Proposition de Mandataire</h2>
                <form onSubmit={handleMandatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Nom Complet du Mandataire</label>
                    <input type="text" required value={mandatFullName} onChange={(e) => setMandatFullName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Téléphone Officiel</label>
                    <input type="text" required value={mandatPhone} onChange={(e) => setMandatPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Département</label>
                      <select value={mandatDept} onChange={(e) => setMandatDept(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                        {HAITI_DEPARTMENTS.map((d) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Commune</label>
                      <select value={mandatCommune} onChange={(e) => setMandatCommune(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                        {getCommunesByDepartmentName(mandatDept).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Code Bureau de Vote (BV)</label>
                    <input type="text" required value={mandatBvCode} onChange={(e) => setMandatBvCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" style={{ background: '#002d62', color: 'white', border: 'none', padding: '0.7rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                    Proposer au Workflow CEP
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 6: COVERAGE */}
            {activeView === 'coverage' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>🗺️ Couverture Territoriale dans votre Circonscription</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {HAITI_DEPARTMENTS.slice(0, 4).map((dept) => (
                    <div key={dept.name} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#002d62', display: 'block' }}>{dept.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700, display: 'block', marginTop: 4 }}>87% bureaux surveillés</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 7: BUREAUX */}
            {activeView === 'bureaux' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>🏢 Bureaux de Vote Concernés</h2>
                <p style={{ fontSize: '0.85rem', color: 'gray' }}>Inventaire des centres de vote où vous possédez une représentation.</p>
              </div>
            )}

            {/* VIEW 8: ONLINE-Z */}
            {activeView === 'online' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.2rem' }}>🌐 Online-Z : Circonscription Virtuelle Diaspora</h2>
                <p style={{ color: 'gray', fontSize: '0.85rem' }}>Statistiques agrégées du vote en ligne (Secret du vote garanti).</p>
              </div>
            )}

            {/* VIEW 9: PARTICIPATION */}
            {activeView === 'participation' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>👥 Taux de Participation dans votre Territoire</h2>
                <strong style={{ fontSize: '1.8rem', color: '#002d62' }}>68.4 %</strong>
              </div>
            )}

            {/* VIEW 10: DECOMPTE PARALLELE */}
            {activeView === 'decompte' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.2rem' }}>📊 Décompte Parallèle de vos Mandataires vs CEP</h2>
                <div style={{ background: '#e6f4ea', borderLeft: '4px solid #137333', padding: '0.8rem', borderRadius: 6, fontSize: '0.85rem', color: '#137333', marginBottom: '1rem' }}>
                  ✓ Réconciliation Arithmétique : <strong>420 voix exprimées = Total déclaré</strong> (0 écart critique).
                </div>
              </div>
            )}

            {/* VIEW 11: PV */}
            {activeView === 'pv' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>📄 Procès-Verbaux de votre Circonscription</h2>
                <p style={{ fontSize: '0.85rem', color: 'gray' }}>PV scannés et homologués par le CEP.</p>
              </div>
            )}

            {/* VIEW 12: INCIDENTS */}
            {activeView === 'incidents' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.2rem' }}>🚨 Incidents Remontés par vos Mandataires</h2>
                  <button type="button" onClick={() => setIncidentModalOpen(true)} style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    + Signaler un Incident
                  </button>
                </div>
                {incidents.map((inc) => (
                  <div key={inc.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, marginBottom: '0.8rem' }}>
                    <strong style={{ color: '#002d62' }}>{inc.id} | Bureau {inc.stationCode}</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{inc.description}</p>
                    <span style={{ fontSize: '0.75rem', color: '#856404', fontWeight: 700 }}>Statut CEP: {inc.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 13: OBSERVATIONS */}
            {activeView === 'observations' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>📝 Observations & Contestations Déposées</h2>
                {remarks.length === 0 ? <p style={{ color: 'gray', fontSize: '0.85rem' }}>Aucune réserve en cours.</p> : null}
              </div>
            )}

            {/* VIEW 14: RESULTS */}
            {activeView === 'results' && candidate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.2rem' }}>📊 Résultats Détaillés pour {candidate.name} ({selectedElection.name})</h2>
                <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '0.8rem', borderRadius: 6, fontSize: '0.82rem', color: '#856404', marginBottom: '1rem' }}>
                  ⚠️ Statut CEP : <strong>RÉSULTATS PROVISOIRES</strong> (82.5% dépouillé).
                </div>
                <strong style={{ fontSize: '1.5rem', color: '#002d62', display: 'block' }}>1 420 500 voix (34.2 %)</strong>
              </div>
            )}

            {/* VIEW 15: PROFILE */}
            {activeView === 'profile' && candidate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', maxWidth: 600 }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>👤 Compte Officiel Candidat</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                  <div><strong>Candidat :</strong> {candidate.name} ({candidate.number})</div>
                  <div><strong>Poste :</strong> {candidate.post}</div>
                  <div><strong>Parti :</strong> {candidate.party}</div>
                  <div><strong>Identifiant Compte :</strong> <code>{user.username}</code></div>
                  <div><strong>Homologation CEP :</strong> <span style={{ color: '#137333', fontWeight: 700 }}>VALIDE</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav className="candidate-mobile-bottom-nav">
        {mobilePrimaryNav.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? '#66b2ff' : 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: '0.7rem',
                gap: 2,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.7rem',
            gap: 2,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>☰</span>
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#002d62', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '1.2rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.6rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>👤 Menu Candidat</strong>
              <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
                  style={{
                    background: activeView === item.id ? '#003893' : 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: 'none',
                    padding: '0.7rem',
                    borderRadius: 8,
                    textAlign: 'left',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {incidentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 480, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#002d62' }}>Signaler un Incident au CEP</h3>
            <form onSubmit={handleReportIncident} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Bureau de Vote Concerné</label>
                <input type="text" required value={incStation} onChange={(e) => setIncStation(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Catégorie</label>
                <select value={incCategory} onChange={(e) => setIncCategory(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="PROCEDURE">Inobservation des Procédures</option>
                  <option value="HARDWARE">Panne ou Problème de BIOPAD</option>
                  <option value="ACCESS">Accès Refusé au Mandataire</option>
                  <option value="SECURITY">Incident de Sécurité</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Description Détaillée</label>
                <textarea required rows={3} value={incDesc} onChange={(e) => setIncDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIncidentModalOpen(false)} style={{ background: '#eee', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Transmettre au CEP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type {
  AdminCandidate,
  AdminElection,
  ElectoralMandataire,
  ElectoralMandate,
  MandataireRemark,
  PoliticalParty,
  UserAccount,
} from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

interface PartyPortalProps {
  user: UserAccount;
  onLogout: () => void;
}

type PartyView =
  | 'dashboard'
  | 'party'
  | 'elections'
  | 'candidates'
  | 'mandataires'
  | 'accreditation'
  | 'coverage'
  | 'bureaux'
  | 'online'
  | 'participation'
  | 'pv'
  | 'incidents'
  | 'observations'
  | 'results'
  | 'profile';

interface PartyIncidentReport {
  id: string;
  stationCode: string;
  category: 'HARDWARE' | 'PROCEDURE' | 'ACCESS' | 'SECURITY' | 'OTHER';
  description: string;
  reportedAt: string;
  status: 'SUBMITTED' | 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  mandataireName: string;
}

interface PartyNotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'ACCREDITATION' | 'PV' | 'INCIDENT' | 'RESPONSE' | 'RESULT';
}

export function PartyPortal({ user, onLogout }: PartyPortalProps): JSX.Element {
  const { lang, setLang } = useI18n();
  const [activeView, setActiveView] = useState<PartyView>('dashboard');
  const [party, setParty] = useState<PoliticalParty | null>(null);
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('elec-2027-pres');
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [mandataires, setMandataires] = useState<ElectoralMandataire[]>([]);
  const [mandatesV2, setMandatesV2] = useState<ElectoralMandate[]>([]);
  const [remarks, setRemarks] = useState<MandataireRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Accreditation Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [mandatFullName, setMandatFullName] = useState('');
  const [mandatEmail, setMandatEmail] = useState('');
  const [mandatPhone, setMandatPhone] = useState('+509 3700-0000');
  const [mandatDept, setMandatDept] = useState('Ouest');
  const [mandatCommune, setMandatCommune] = useState('Port-au-Prince');
  const [mandatBvCode, setMandatBvCode] = useState('BV-PAP-012');
  const [mandatBvName, setMandatBvName] = useState('Lycée Alexandre Pétion');
  const [mandatEntityType, setMandatEntityType] = useState<'PARTY' | 'CANDIDATE'>('PARTY');
  const [mandatTargetCandidateId, setMandatTargetCandidateId] = useState<string>('');

  // Institutional Incident Modal Form
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incStation, setIncStation] = useState('BV-PAP-012');
  const [incCategory, setIncCategory] = useState<PartyIncidentReport['category']>('PROCEDURE');
  const [incDesc, setIncDesc] = useState('');

  // Incidents & Notifications
  const [incidents, setIncidents] = useState<PartyIncidentReport[]>([
    {
      id: 'INC-PARTY-2026-001',
      stationCode: 'BV-PAP-012',
      category: 'PROCEDURE',
      description: 'Retard de 45 minutes dans l\'ouverture des urnes et contrôle d\'accès des mandataires.',
      reportedAt: '2026-09-05 08:45',
      status: 'UNDER_REVIEW',
      mandataireName: 'Pierre Alexis',
    },
    {
      id: 'INC-PARTY-2026-002',
      stationCode: 'BV-PV-004',
      category: 'HARDWARE',
      description: 'Difficulté d\'authentification biométrique sur l\'appareil BIOPAD-PAP-002.',
      reportedAt: '2026-09-05 09:15',
      status: 'RESOLVED',
      mandataireName: 'Jean-Baptiste Duval',
    },
  ]);

  const [notifications, setNotifications] = useState<PartyNotificationItem[]>([
    {
      id: 'pn1',
      title: 'Homologation des Candidats CEP',
      message: 'La liste officielle des candidats homologués pour la Présidentielle 2027 a été mise à jour.',
      date: 'Il y a 15 min',
      read: false,
      type: 'ACCREDITATION',
    },
    {
      id: 'pn2',
      title: 'Nouvel Accréditation Accordée',
      message: 'Le mandataire M001 (Pierre Alexis) a été validé pour le bureau BV-PAP-012.',
      date: 'Il y a 1h',
      read: false,
      type: 'ACCREDITATION',
    },
  ]);

  const loadPartyData = async () => {
    setLoading(true);
    try {
      const [pList, eList, cList, mList, mv2List, rList] = await Promise.all([
        adminApi.parties(),
        adminApi.elections(),
        adminApi.candidates(),
        adminApi.mandataires(),
        adminApi.mandates(),
        adminApi.remarks(),
      ]);

      setElections(eList);

      const myParty = pList.find((p) => p.id === user.partyId || p.acronym === 'PITIT') || pList[0];
      setParty(myParty || null);

      if (myParty) {
        setCandidates(cList.filter((c) => c.partyId === myParty.id || c.party === myParty.name));
        setMandataires(mList.filter((m) => m.partyId === myParty.id || m.partyName === myParty.name));
        setMandatesV2(mv2List.filter((m) => m.representedEntityId === myParty.id || m.representedEntityName === myParty.name));
        setRemarks(rList.filter((r) => r.partyName === myParty.name));
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

    const selectedCand = candidates.find((c) => c.id === mandatTargetCandidateId);

    const newMandat: ElectoralMandataire = {
      id: `m-${Date.now()}`,
      fullName: mandatFullName,
      partyId: party.id,
      partyName: party.name,
      candidateId: mandatEntityType === 'CANDIDATE' ? selectedCand?.id : undefined,
      candidateName: mandatEntityType === 'CANDIDATE' ? selectedCand?.name : undefined,
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
    setMandatFullName('');

    setNotifications([
      {
        id: `pn-${Date.now()}`,
        title: 'Demande d\'Accréditation Soumise',
        message: `La demande pour ${newMandat.fullName} (Bureau ${newMandat.pollingStationCode}) a été inscrite au CEP.`,
        date: 'À l\'instant',
        read: false,
        type: 'ACCREDITATION',
      },
      ...notifications,
    ]);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: PartyIncidentReport = {
      id: `INC-PARTY-2026-${Math.floor(100 + Math.random() * 900)}`,
      stationCode: incStation,
      category: incCategory,
      description: incDesc,
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
      mandataireName: `Direction du Parti (${user.fullName})`,
    };
    setIncidents([newInc, ...incidents]);
    setIncidentModalOpen(false);
    setIncDesc('');
  };

  // Nav Items Definition
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

  const navItems: { id: PartyView; label: string; icon: string; badge?: number; show: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', show: true },
    { id: 'party', label: 'Mon Parti', icon: '🏛️', show: true },
    { id: 'elections', label: 'Élections', icon: '🗳️', show: true },
    { id: 'candidates', label: 'Candidats', icon: '👤', badge: candidates.length, show: true },
    { id: 'mandataires', label: 'Mandataires', icon: '📜', badge: mandataires.length, show: true },
    { id: 'accreditation', label: 'Accréditation', icon: '➕', show: true },
    { id: 'coverage', label: 'Couverture', icon: '🗺️', show: true },
    { id: 'bureaux', label: 'Bureaux de Vote', icon: '🏢', show: true },
    { id: 'online', label: 'Online-Z', icon: '🌐', show: true },
    { id: 'participation', label: 'Participation', icon: '👥', show: true },
    { id: 'pv', label: 'Procès-Verbaux', icon: '📄', show: true },
    { id: 'incidents', label: 'Incidents', icon: '🚨', badge: activeIncidentsCount, show: true },
    { id: 'observations', label: 'Observations', icon: '📝', show: true },
    { id: 'results', label: 'Résultats', icon: '📈', show: true },
    { id: 'profile', label: 'Profil & Compte', icon: '👤', show: true },
  ];

  const mobilePrimaryNav = navItems.filter((i) => ['dashboard', 'candidates', 'mandataires', 'incidents'].includes(i.id));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: '1.2rem', color: '#002d62', fontWeight: 600 }}>🔄 Chargement du Portail Parti Politique...</div>
      </div>
    );
  }

  const selectedElection = elections.find((e) => e.id === selectedElectionId) || elections[0];

  return (
    <div className="party-layout-root" style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      <style>{`
        .party-container {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
        }
        .party-desktop-sidebar {
          display: none;
        }
        .party-mobile-bottom-nav {
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
        .party-main-area {
          flex: 1;
          padding-bottom: 75px;
        }
        @media (min-width: 768px) {
          .party-container {
            flex-direction: row;
          }
          .party-desktop-sidebar {
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
          .party-mobile-bottom-nav {
            display: none;
          }
          .party-main-area {
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <div className="party-container">
        {/* ==================== DESKTOP & TABLET SIDEBAR ==================== */}
        <aside className="party-desktop-sidebar">
          <div style={{ padding: '0.4rem 0.6rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🏛️</span>
            <strong style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.5px' }}>CEP PARTI POLITIQUE</strong>
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
        <div className="party-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Header with Election Selector & Language Options */}
          <header style={{ background: '#002d62', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {party?.logoUrl ? (
                <img src={party.logoUrl} alt={party.acronym} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.3rem' }}>🏛️</span>
              )}
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>{party?.name || 'Portail Parti Politique'}</strong>
                <span style={{ fontSize: '0.75rem', color: '#a2c4ec' }}>
                  {user.fullName} | Représentant : {party?.leaderName || 'N/A'}
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

              {party && (
                <span style={{ background: '#137333', color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ Accrédité CEP
                </span>
              )}
            </div>
          </header>

          <div style={{ maxWidth: 1150, width: '100%', margin: '1.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* VIEW 1: DASHBOARD */}
            {activeView === 'dashboard' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>CANDIDATS INVESTIS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>{candidates.length}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>Candidats en compétition</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>MANDATAIRES DÉPLOYÉS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>{mandataires.length}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#003893' }}>Parti + Candidats</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>COUVERTURE BUREAUX</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>84.5 %</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333' }}>1 050 / 1 250 bureaux</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>INCIDENTS EN COURS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: activeIncidentsCount > 0 ? '#c5221f' : '#137333', marginTop: 2 }}>{activeIncidentsCount}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>Signalés au CEP</span>
                  </div>
                </div>

                {/* Candidate & Mandataires Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                    <h3 style={{ margin: '0 0 0.8rem', color: '#002d62', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>👤 Candidats du Parti</span>
                      <button type="button" onClick={() => setActiveView('candidates')} style={{ border: 'none', background: 'none', color: '#003893', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Voir tous →</button>
                    </h3>
                    {candidates.slice(0, 3).map((c) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img src={c.photoUrl} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#002d62', display: 'block' }}>{c.name} ({c.number})</strong>
                            <span style={{ fontSize: '0.75rem', color: 'gray' }}>{c.post} — {c.territory}</span>
                          </div>
                        </div>
                        <span style={{ background: '#e6f4ea', color: '#137333', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>✓ Homologué</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                    <h3 style={{ margin: '0 0 0.8rem', color: '#002d62', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📋 Mandataires Récents</span>
                      <button type="button" onClick={() => setActiveView('mandataires')} style={{ border: 'none', background: 'none', color: '#003893', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Gérer →</button>
                    </h3>
                    {mandataires.slice(0, 3).map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{m.fullName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'gray' }}>{m.department} | {m.pollingStationCode}</span>
                        </div>
                        <span style={{ background: '#e6f4ea', color: '#137333', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>✓ Actif</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: MON PARTI */}
            {activeView === 'party' && party && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                  <img src={party.logoUrl} alt={party.acronym} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid #002d62' }} />
                  <div>
                    <span style={{ background: '#002d62', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>{party.acronym}</span>
                    <h2 style={{ margin: '4px 0 0', color: '#002d62', fontSize: '1.5rem' }}>{party.name}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'gray' }}>
                      Représentant Légal : <strong>{party.leaderName}</strong> | Siège Social : <strong>{party.address}</strong>
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>STATUT JURIDIQUE CEP</span>
                    <strong style={{ display: 'block', color: '#137333', fontSize: '1.1rem', marginTop: 2 }}>✓ Parti Reconnu</strong>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>CANDIDATS INVESTIS</span>
                    <strong style={{ display: 'block', color: '#002d62', fontSize: '1.1rem', marginTop: 2 }}>{candidates.length} candidats</strong>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>TOTAL MANDATAIRES</span>
                    <strong style={{ display: 'block', color: '#002d62', fontSize: '1.1rem', marginTop: 2 }}>{mandataires.length} mandataires</strong>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: ELECTIONS */}
            {activeView === 'elections' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>🗳️ Scrutins Électoraux Ouverts aux Partis Politiques</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {elections.map((e) => (
                    <div key={e.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#002d62', display: 'block' }}>{e.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'gray' }}>Date : {e.date} | Statut : {e.status}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedElectionId(e.id)}
                        style={{
                          background: selectedElectionId === e.id ? '#137333' : '#002d62',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: 6,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {selectedElectionId === e.id ? '✓ Élection Active' : 'Sélectionner'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 4: CANDIDATS */}
            {activeView === 'candidates' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>👤 Candidates Investis par le Parti pour {selectedElection.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {candidates.map((c) => (
                    <div key={c.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <img src={c.photoUrl} alt={c.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ color: '#002d62', display: 'block' }}>{c.name} ({c.number})</strong>
                          <span style={{ fontSize: '0.8rem', color: 'gray' }}>{c.post} — {c.territory}</span>
                        </div>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>"{c.slogan}"</p>
                      <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700 }}>✓ Homologué CEP</span>
                        <span style={{ fontSize: '0.75rem', color: '#003893', fontWeight: 600 }}>320 Mandataires</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: MANDATAIRES */}
            {activeView === 'mandataires' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.2rem' }}>📜 Mandataires du Parti et des Candidats</h2>
                  <button type="button" onClick={() => setModalOpen(true)} style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    + Accréditer un Mandataire
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Mandataire</th>
                        <th style={{ padding: '0.6rem' }}>Entité Représentée</th>
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
                          <td style={{ padding: '0.6rem' }}>{m.candidateName ? `Candidat (${m.candidateName})` : `Parti (${m.partyName})`}</td>
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

            {/* VIEW 6: ACCREDITATION */}
            {activeView === 'accreditation' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', maxWidth: 650 }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>➕ Soumettre une Demande d'Accréditation au CEP</h2>
                <form onSubmit={handleMandatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Nom Complet du Mandataire</label>
                    <input type="text" required value={mandatFullName} onChange={(e) => setMandatFullName(e.target.value)} placeholder="ex: Jean Baptiste" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Téléphone Officiel</label>
                    <input type="text" required value={mandatPhone} onChange={(e) => setMandatPhone(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Entité Représentée</label>
                    <select value={mandatEntityType} onChange={(e) => setMandatEntityType(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                      <option value="PARTY">Le Parti Politiques ({party?.acronym})</option>
                      <option value="CANDIDATE">Un Candidat du Parti</option>
                    </select>
                  </div>
                  {mandatEntityType === 'CANDIDATE' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Candidat Concerné</label>
                      <select value={mandatTargetCandidateId} onChange={(e) => setMandatTargetCandidateId(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">-- Choisir le candidat --</option>
                        {candidates.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.post})</option>
                        ))}
                      </select>
                    </div>
                  )}
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
                  <button type="submit" style={{ background: '#002d62', color: 'white', border: 'none', padding: '0.7rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                    Soumettre au Workflow d'Accréditation CEP
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 7: COVERAGE */}
            {activeView === 'coverage' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>🗺️ Matrice de Couverture Territoriale des Mandataires</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {HAITI_DEPARTMENTS.slice(0, 6).map((dept, idx) => (
                    <div key={dept.name} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#002d62', display: 'block' }}>{dept.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'gray' }}>Capitale: {dept.chefLieu}</span>
                      <div style={{ marginTop: '0.8rem', background: '#e0e0e0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ background: '#137333', width: `${75 + idx * 4}%`, height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700, display: 'block', marginTop: 4 }}>
                        {75 + idx * 4}% bureaux couverts ({120 + idx * 10} / {150 + idx * 10})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 8: BUREAUX DE VOTE */}
            {activeView === 'bureaux' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>🏢 Bureaux de Vote Sous Surveillance des Mandataires du Parti</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Code BV</th>
                        <th style={{ padding: '0.6rem' }}>Nom du Centre</th>
                        <th style={{ padding: '0.6rem' }}>Type</th>
                        <th style={{ padding: '0.6rem' }}>Inscrits</th>
                        <th style={{ padding: '0.6rem' }}>Mandataire Présent</th>
                        <th style={{ padding: '0.6rem' }}>Statut PV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['BV-PAP-012', 'BV-PAP-013', 'BV-PV-004', 'BV-DEL-001'].map((code, idx) => (
                        <tr key={code} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.6rem' }}><code style={{ color: '#003893', fontWeight: 700 }}>{code}</code></td>
                          <td style={{ padding: '0.6rem' }}>Lycée Pétion / École Nationale</td>
                          <td style={{ padding: '0.6rem' }}>{idx === 1 ? 'NOMADE 🚍' : 'PHYSIQUE 🏢'}</td>
                          <td style={{ padding: '0.6rem' }}>450 électeurs</td>
                          <td style={{ padding: '0.6rem', color: '#137333', fontWeight: 700 }}>✓ Pierre Alexis</td>
                          <td style={{ padding: '0.6rem' }}><span style={{ background: '#eef4ff', color: '#003893', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>{idx === 0 ? 'PV Reçu' : 'En attente'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 9: ONLINE-Z */}
            {activeView === 'online' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.2rem' }}>🌐 Online-Z : Circonscription Virtuelle (Diaspora & Vote en Ligne)</h2>
                <p style={{ color: 'gray', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                  Données de participation et résultats agrégés pour la modalité en ligne. Le secret du vote est garanti à 100%.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>ÉLECTEURS ÉLIGIBLES ONLINE</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', color: '#002d62', marginTop: 2 }}>45 200</strong>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>VOTANTS EN LIGNE</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', color: '#137333', marginTop: 2 }}>32 140</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333' }}>Taux: 71.1 %</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 10: PARTICIPATION */}
            {activeView === 'participation' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>👥 Taux de Participation Globale & Affluence</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8f9fa', padding: '1.2rem', borderRadius: 8, border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>PARTICIPATION NATIONALE</span>
                    <strong style={{ display: 'block', fontSize: '2rem', color: '#002d62', marginTop: 2 }}>68.4 %</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>1 420 500 votants</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 11: PV */}
            {activeView === 'pv' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>📄 Procès-Verbaux des Bureaux Transmis par les Mandataires</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Bureau</th>
                        <th style={{ padding: '0.6rem' }}>Mandataire</th>
                        <th style={{ padding: '0.6rem' }}>Statut Transmission</th>
                        <th style={{ padding: '0.6rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.6rem' }}><code style={{ color: '#003893', fontWeight: 700 }}>BV-PAP-012</code></td>
                        <td style={{ padding: '0.6rem' }}>Pierre Alexis</td>
                        <td style={{ padding: '0.6rem' }}><span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>✓ Numérisé & Signé</span></td>
                        <td style={{ padding: '0.6rem' }}><button type="button" style={{ background: '#002d62', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer' }}>Télécharger PDF</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 12: INCIDENTS */}
            {activeView === 'incidents' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.2rem' }}>🚨 Suivi des Incidents Signalés au CEP</h2>
                  <button type="button" onClick={() => setIncidentModalOpen(true)} style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    + Signaler un Incident Institutionnel
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {incidents.map((inc) => (
                    <div key={inc.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#002d62' }}>{inc.id} | Bureau {inc.stationCode}</strong>
                        <span style={{ background: inc.status === 'UNDER_REVIEW' ? '#fff3cd' : '#e6f4ea', color: inc.status === 'UNDER_REVIEW' ? '#856404' : '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem' }}>{inc.status}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#444' }}>{inc.description}</p>
                      <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block', marginTop: 4 }}>Par : {inc.mandataireName} à {inc.reportedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 13: OBSERVATIONS */}
            {activeView === 'observations' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>📝 Observations & Contestations Formelles</h2>
                {remarks.length === 0 ? (
                  <p style={{ color: 'gray', fontSize: '0.85rem' }}>Aucune réserve déposée à ce stade.</p>
                ) : (
                  remarks.map((r) => (
                    <div key={r.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, marginBottom: '0.8rem' }}>
                      <strong style={{ color: '#002d62', display: 'block' }}>{r.title} ({r.pollingStationCode})</strong>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#555' }}>{r.description}</p>
                      <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 700 }}>Statut: {r.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VIEW 14: RESULTS */}
            {activeView === 'results' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.2rem' }}>📊 Résultats Électoraux Consolidés ({selectedElection.name})</h2>
                <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '0.8rem', borderRadius: 6, fontSize: '0.82rem', color: '#856404', marginBottom: '1rem' }}>
                  ⚠️ Statut Officiel CEP : <strong>RÉSULTATS PROVISOIRES</strong> (Saisie partielle à 82.5%).
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {candidates.map((c, idx) => (
                    <div key={c.id} style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#002d62' }}>{idx + 1}. {c.name} ({c.number})</strong>
                        <span style={{ fontSize: '0.8rem', color: 'gray', display: 'block' }}>{c.post} — {c.party}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.2rem', color: '#002d62' }}>{idx === 0 ? '1 420 500' : '980 200'} voix</strong>
                        <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700, display: 'block' }}>{idx === 0 ? '34.2 %' : '23.6 %'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 15: PROFILE */}
            {activeView === 'profile' && party && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', maxWidth: 600 }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.2rem' }}>👤 Profil du Compte Officiel Parti</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                  <div><strong>Nom d'Utilisateur :</strong> <code>{user.username}</code></div>
                  <div><strong>Rôle Système :</strong> <code>{user.roleTitle}</code></div>
                  <div><strong>Organisme :</strong> {party.name} ({party.acronym})</div>
                  <div><strong>Dirigeant Représentant :</strong> {party.leaderName}</div>
                  <div><strong>Accréditation CEP :</strong> <span style={{ color: '#137333', fontWeight: 700 }}>VALIDE</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav className="party-mobile-bottom-nav">
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
              <strong style={{ fontSize: '1.1rem' }}>🏛️ Menu Parti Politique</strong>
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
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#002d62' }}>Signaler un Incident Institutionnel au CEP</h3>
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

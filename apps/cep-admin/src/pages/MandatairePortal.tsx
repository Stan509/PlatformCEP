import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type {
  ElectoralMandate,
  MandataireRemark,
  UserAccount,
} from '../lib/mockData';

interface MandatairePortalProps {
  user: UserAccount;
  onLogout: () => void;
}

type MandataireView =
  | 'dashboard'
  | 'mandat'
  | 'zone'
  | 'bureaux'
  | 'online'
  | 'participation'
  | 'decompte'
  | 'pv'
  | 'incidents'
  | 'observations'
  | 'documents'
  | 'notifications'
  | 'profile';

interface MandataireIncidentReport {
  id: string;
  stationCode: string;
  category: 'HARDWARE' | 'PROCEDURE' | 'ACCESS' | 'SECURITY' | 'OTHER';
  description: string;
  reportedAt: string;
  status: 'SUBMITTED' | 'RECEIVED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
}

interface MandataireNotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'PV' | 'INCIDENT' | 'RESPONSE' | 'ALERT';
}

export function MandatairePortal({ user, onLogout }: MandatairePortalProps): JSX.Element {
  const { lang, setLang } = useI18n();
  const [activeView, setActiveView] = useState<MandataireView>('dashboard');
  const [mandate, setMandate] = useState<ElectoralMandate | null>(null);
  const [remarks, setRemarks] = useState<MandataireRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Incidents state
  const [incidents, setIncidents] = useState<MandataireIncidentReport[]>([
    {
      id: 'INC-2026-091',
      stationCode: 'BV-PAP-013',
      category: 'HARDWARE',
      description: 'Lenteur du scanner d\'empreinte biométrique lors du contrôle liveness.',
      reportedAt: '2026-09-05 08:30',
      status: 'UNDER_REVIEW',
    },
  ]);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incStation, setIncStation] = useState('');
  const [incCategory, setIncCategory] = useState<MandataireIncidentReport['category']>('PROCEDURE');
  const [incDesc, setIncDesc] = useState('');

  // Observations state
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsCategory, setObsCategory] = useState<MandataireRemark['category']>('REGULARITY');
  const [obsTitle, setObsTitle] = useState('');
  const [obsDesc, setObsDesc] = useState('');
  const [obsVotes, setObsVotes] = useState(180);

  // Décompte Parallèle state
  const [selectedStationCode, setSelectedStationCode] = useState<string>('BV-PAP-012');
  const [tallyCand1, setTallyCand1] = useState(184); // Jean-Charles Moïse
  const [tallyCand2, setTallyCand2] = useState(152); // Mirlande Manigat
  const [tallyCand3, setTallyCand3] = useState(64);  // Steven Benoît
  const [tallyBlanks, setTallyBlanks] = useState(12);
  const [tallyNulls, setTallyNulls] = useState(8);
  const [tallyTotalStated, setTallyTotalStated] = useState(420);

  // Notifications state
  const [notifications, setNotifications] = useState<MandataireNotificationItem[]>([
    {
      id: 'n1',
      title: 'Procès-Verbal Disponible',
      message: 'Le PV officiel du bureau BV-PAP-012 a été numérisé et transmis.',
      date: 'Il y a 25 min',
      read: false,
      type: 'PV',
    },
    {
      id: 'n2',
      title: 'Confirmation d\'Accréditation',
      message: 'Votre mandat a été validé et scellé cryptographiquement par le CEP.',
      date: 'Aujourd\'hui 06:00',
      read: true,
      type: 'ALERT',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mObj, rList] = await Promise.all([
        adminApi.getMandateForUser(user.mandataireId, user.partyId, user.candidateId),
        adminApi.remarks(),
      ]);
      setMandate(mObj);
      setRemarks(rList);
      if (mObj && mObj.authorizedStations.length > 0) {
        setSelectedStationCode(mObj.authorizedStations[0]!.code);
        setIncStation(mObj.authorizedStations[0]!.code);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Derived KPI Calculations
  const authorizedStations = mandate?.authorizedStations || [];
  const totalElectors = authorizedStations.reduce((sum, s) => sum + s.electorsCount, 0);
  const totalParticipants = authorizedStations.reduce((sum, s) => sum + s.participantsCount, 0);
  const turnoutPercentage = totalElectors > 0 ? ((totalParticipants / totalElectors) * 100).toFixed(2) : '0.00';
  const availablePvsCount = authorizedStations.filter((s) => s.pvStatus === 'AVAILABLE').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const hasOnline = mandate?.modalities.some((m) => m === 'ONLINE' || m === 'BOTH');
  const hasPhysical = mandate?.modalities.some((m) => m === 'FIXED' || m === 'NOMADIC' || m === 'BOTH');

  // Decompte Reconciliation check
  const calculatedSum = Number(tallyCand1) + Number(tallyCand2) + Number(tallyCand3) + Number(tallyBlanks) + Number(tallyNulls);
  const isReconciled = calculatedSum === Number(tallyTotalStated);

  // Handlers
  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: MandataireIncidentReport = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      stationCode: incStation || authorizedStations[0]?.code || 'BV-PAP-012',
      category: incCategory,
      description: incDesc,
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
    };
    setIncidents([newInc, ...incidents]);
    setIncidentModalOpen(false);
    setIncDesc('');
    setNotifications([
      {
        id: `n-${Date.now()}`,
        title: 'Incident Signalé AU CEP',
        message: `Signalement ${newInc.id} enregistré pour le bureau ${newInc.stationCode}.`,
        date: 'À l\'instant',
        read: false,
        type: 'INCIDENT',
      },
      ...notifications,
    ]);
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: MandataireRemark = {
      id: `mr-${Date.now()}`,
      mandataireId: mandate?.mandataireId || user.mandataireId || 'm1',
      mandataireName: user.fullName,
      partyName: mandate?.representedEntityName || 'Parti / Candidat',
      pollingStationCode: selectedStationCode,
      category: obsCategory,
      title: obsTitle,
      description: obsDesc,
      tallyVotes: Number(obsVotes),
      reportedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      status: 'SUBMITTED',
    };

    const updated = await adminApi.addRemark(newRem);
    setRemarks(updated);
    setObsModalOpen(false);
    setObsTitle('');
    setObsDesc('');
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Nav Menu Items List
  const navItems: { id: MandataireView; label: string; icon: string; badge?: number; show: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', show: true },
    { id: 'mandat', label: 'Mon Mandat', icon: '📜', show: true },
    { id: 'zone', label: 'Ma Zone', icon: '🗺️', show: true },
    { id: 'bureaux', label: 'Bureaux de Vote', icon: '🏢', show: hasPhysical },
    { id: 'online', label: 'Online-Z', icon: '🌐', show: hasOnline },
    { id: 'participation', label: 'Participation', icon: '👥', show: true },
    { id: 'decompte', label: 'Décompte Parallèle', icon: '📊', show: true },
    { id: 'pv', label: 'Procès-Verbaux', icon: '📄', show: true },
    { id: 'incidents', label: 'Incidents', icon: '🚨', badge: openIncidentsCount, show: true },
    { id: 'observations', label: 'Observations', icon: '📝', show: true },
    { id: 'documents', label: 'Documents', icon: '📑', show: true },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadNotificationsCount, show: true },
    { id: 'profile', label: 'Profil & Compte', icon: '👤', show: true },
  ].filter((item) => item.show);

  // Primary items for mobile bottom navbar (4 main tabs + 'Plus')
  const mobilePrimaryNav = navItems.filter((i) => ['dashboard', 'bureaux', 'decompte', 'incidents'].includes(i.id));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: '1.2rem', color: '#002d62', fontWeight: 600 }}>🔄 Chargement du Portail Mandataire V2...</div>
      </div>
    );
  }

  // Handle Revoked or Expired Mandate Lockout
  if (mandate && (mandate.status === 'REVOKED' || mandate.status === 'EXPIRED')) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8d7da', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'white', border: '2px solid #dc3545', borderRadius: 12, padding: '2rem', maxWidth: 540, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ color: '#721c24', margin: '0 0 0.5rem' }}>
            Accès Bloqué : Mandat {mandate.status === 'REVOKED' ? 'Révoqué' : 'Expiré'}
          </h2>
          <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Votre mandat d'accréditation électorale (ID: <code>{mandate.id}</code>) pour l'élection <strong>{mandate.electionName}</strong> est actuellement désactivé. Toute opération sur le portail est restreinte.
          </p>
          <button type="button" onClick={onLogout} style={{ marginTop: '1rem', background: '#dc3545', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
            Se Déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mandataire-layout-root" style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      <style>{`
        .mandataire-container {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
        }
        .mandataire-desktop-sidebar {
          display: none;
        }
        .mandataire-mobile-bottom-nav {
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
        .mandataire-main-area {
          flex: 1;
          padding-bottom: 75px;
        }
        @media (min-width: 768px) {
          .mandataire-container {
            flex-direction: row;
          }
          .mandataire-desktop-sidebar {
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
          .mandataire-mobile-bottom-nav {
            display: none;
          }
          .mandataire-main-area {
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <div className="mandataire-container">
        {/* ==================== DESKTOP & TABLET SIDEBAR ==================== */}
        <aside className="mandataire-desktop-sidebar">
          {/* Minimal Brand Identifier */}
          <div style={{ padding: '0.4rem 0.6rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
            <strong style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '0.5px' }}>CEP MANDATAIRE</strong>
          </div>

          {/* Navigation Links List (Zero scroll, compact height) */}
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

          {/* Compact Logout Footer */}
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
        <div className="mandataire-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Header with Language Options & Entity Badge */}
          <header style={{ background: '#002d62', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>⚖️</span>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>Portail Mandataire V2</strong>
                <span style={{ fontSize: '0.75rem', color: '#a2c4ec' }}>
                  {user.fullName} {mandate ? `• ${mandate.representedEntityName}` : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {/* Language Switcher moved to Header */}
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
                      padding: '3px 9px',
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

              {mandate && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>
                  ✓ {mandate.status}
                </span>
              )}
            </div>
          </header>

          <div style={{ maxWidth: 1100, width: '100%', margin: '1.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* VIEW 1: DASHBOARD */}
            {activeView === 'dashboard' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>BUREAUX AUTORISÉS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>{authorizedStations.length}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#003893' }}>Bureaux sous mandat</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>PARTICIPANTS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', marginTop: 2 }}>{totalParticipants.toLocaleString()}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>Sur {totalElectors.toLocaleString()} inscrits</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>PARTICIPATION</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', marginTop: 2 }}>{turnoutPercentage} %</strong>
                    <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>Consolidée</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>INCIDENTS OUVERTS</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: openIncidentsCount > 0 ? '#c5221f' : '#137333', marginTop: 2 }}>{openIncidentsCount}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>Transmis à la BEC</span>
                  </div>

                  <div style={{ background: 'white', padding: '1.2rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>PV DISPONIBLES</span>
                    <strong style={{ display: 'block', fontSize: '1.8rem', color: '#003893', marginTop: 2 }}>{availablePvsCount}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>Numérisés CEP</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, color: '#002d62', fontSize: '1.1rem' }}>🏢 Bureaux sous Votre Mandat</h3>
                      <button type="button" onClick={() => setActiveView('bureaux')} style={{ background: 'none', border: 'none', color: '#003893', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Voir tout →</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {authorizedStations.map((st) => (
                        <div key={st.code} style={{ border: '1px solid #eee', padding: '0.8rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#002d62', fontSize: '0.9rem' }}>{st.name}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'gray' }}>{st.location}</div>
                          </div>
                          <span style={{ fontSize: '0.75rem', background: '#e0e8f5', color: '#003893', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {st.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#002d62', fontSize: '1.1rem' }}>⚡ Actions Rapides</h3>
                    <button type="button" onClick={() => setIncidentModalOpen(true)} style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                      🚨 Signaler un Incident
                    </button>
                    <button type="button" onClick={() => setObsModalOpen(true)} style={{ background: '#003893', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                      📝 Enregistrer une Remarque
                    </button>
                    <button type="button" onClick={() => setActiveView('decompte')} style={{ background: '#137333', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                      📊 Saisir le Décompte Parallèle
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: MON MANDAT */}
            {activeView === 'mandat' && mandate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '2px solid #003893', paddingBottom: '0.8rem' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.35rem' }}>📜 Mandat Officiel d'Accréditation Électorale</h2>
                  <p style={{ margin: '4px 0 0', color: 'gray', fontSize: '0.88rem' }}>
                    Accréditation délivrée par le Conseil Électoral Provisoire (CEP).
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
                  <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 0.6rem', color: '#003893', fontSize: '0.95rem' }}>👤 IDENTITÉ</h4>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><strong>Mandataire:</strong> {mandate.fullName}</div>
                      <div><strong>ID Mandat:</strong> <code>{mandate.mandataireId}</code></div>
                      <div><strong>Téléphone:</strong> {mandate.phone}</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 0.6rem', color: '#003893', fontSize: '0.95rem' }}>🏛️ ENTTITÉ REPRÉSENTÉE</h4>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><strong>Type:</strong> {mandate.entityType === 'CANDIDATE' ? 'Candidat Officiel' : 'Parti Politique'}</div>
                      <div><strong>Intitulé:</strong> {mandate.representedEntityName}</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 0.6rem', color: '#003893', fontSize: '0.95rem' }}>🗳️ SCRUTIN & TERRITOIRE</h4>
                    <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><strong>Élection:</strong> {mandate.electionName}</div>
                      <div><strong>Périmètre:</strong> Dept {mandate.department} ({mandate.commune})</div>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 0.8rem', color: '#003893', fontSize: '0.95rem' }}>🛡️ PERMISSIONS EFFECTIVES DU MANDAT</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                    {[
                      { key: 'canViewParticipation', label: 'Consulter la participation', val: mandate.permissions.canViewParticipation },
                      { key: 'canViewResults', label: 'Consulter les résultats autorisés', val: mandate.permissions.canViewResults },
                      { key: 'canReportIncident', label: 'Signaler des incidents', val: mandate.permissions.canReportIncident },
                      { key: 'canSubmitObservation', label: 'Soumettre des remarques', val: mandate.permissions.canSubmitObservation },
                      { key: 'canViewPv', label: 'Consulter et télécharger les PV', val: mandate.permissions.canViewPv },
                      { key: 'canSignPv', label: 'Signer formellement les PV', val: mandate.permissions.canSignPv },
                      { key: 'canTallyVotes', label: 'Saisir le décompte parallèle', val: mandate.permissions.canTallyVotes },
                    ].map((perm) => (
                      <div key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: perm.val ? '#e6f4ea' : '#fce8e6', padding: '6px 10px', borderRadius: 6 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: perm.val ? '#137333' : '#c5221f' }}>{perm.val ? '✓' : '✗'}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: perm.val ? '#137333' : '#c5221f' }}>{perm.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: MA ZONE */}
            {activeView === 'zone' && mandate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.35rem' }}>🗺️ Périmètre Territoriale Attribué</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f8f9fa', padding: '1.2rem', borderRadius: 8, border: '1px solid #ddd' }}>
                  <div style={{ fontWeight: 800, color: '#003893', fontSize: '1.05rem' }}>🇭🇹 Département de {mandate.department}</div>
                  <div style={{ marginLeft: '1rem', borderLeft: '2px solid #003893', paddingLeft: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: '#002d62' }}>🏛️ Commune de {mandate.commune}</div>
                    <div style={{ marginLeft: '1rem', borderLeft: '2px solid #137333', paddingLeft: '0.8rem', marginTop: 4 }}>
                      <div style={{ fontWeight: 700, color: '#137333', fontSize: '0.9rem' }}>📍 Zone Électorale : {mandate.electoralZone}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: BUREAUX */}
            {activeView === 'bureaux' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>🏢 Bureaux de Vote Autorisés</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {authorizedStations.map((st) => (
                    <div key={st.code} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#002d62', fontSize: '1.05rem' }}>{st.name} ({st.code})</strong>
                          <div style={{ fontSize: '0.8rem', color: 'gray' }}>📍 {st.location}</div>
                        </div>
                        <span style={{ background: '#003893', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>{st.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: ONLINE-Z */}
            {activeView === 'online' && hasOnline && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>🌐 Unité Virtuelle de Vote (ONLINE-Z)</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'gray' }}>Suivi opérationnel du vote web et consulaire pour la Diaspora.</p>
              </div>
            )}

            {/* VIEW 6: PARTICIPATION */}
            {activeView === 'participation' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>👥 Données de Participation Consolidées</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Bureau</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Inscrits</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Participants</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Taux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authorizedStations.map((st) => (
                      <tr key={st.code} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>{st.name}</td>
                        <td style={{ padding: '0.6rem 0.8rem' }}>{st.electorsCount}</td>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>{st.participantsCount}</td>
                        <td style={{ padding: '0.6rem 0.8rem', color: '#137333', fontWeight: 800 }}>{((st.participantsCount / st.electorsCount) * 100).toFixed(1)} %</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW 7: DÉCOMPTE PARALLÈLE */}
            {activeView === 'decompte' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.35rem' }}>📊 Décompte Parallèle & Réconciliation</h2>
                <div style={{ background: isReconciled ? '#e6f4ea' : '#fce8e6', border: isReconciled ? '2px solid #137333' : '2px solid #c5221f', borderRadius: 8, padding: '0.8rem 1rem' }}>
                  <strong style={{ color: isReconciled ? '#137333' : '#c5221f' }}>
                    {isReconciled ? '✅ Réconciliation Arithmétique Exacte' : '⚠️ Erreur de Réconciliation Arithmétique'}
                  </strong>
                  <div style={{ fontSize: '0.82rem', marginTop: 2 }}>Somme candidats + nuls = <strong>{calculatedSum}</strong> | Total déclaré = <strong>{tallyTotalStated}</strong></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  <div style={{ border: '1px solid #ccc', padding: '0.8rem', borderRadius: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>#14 JEAN-CHARLES MOÏSE</label>
                    <input type="number" value={tallyCand1} onChange={(e) => setTallyCand1(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 2, fontWeight: 700 }} />
                  </div>
                  <div style={{ border: '1px solid #ccc', padding: '0.8rem', borderRadius: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>#07 MIRLANDE MANIGAT</label>
                    <input type="number" value={tallyCand2} onChange={(e) => setTallyCand2(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 2, fontWeight: 700 }} />
                  </div>
                  <div style={{ border: '1px solid #ccc', padding: '0.8rem', borderRadius: 6 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>#22 STEVEN BENOÎT</label>
                    <input type="number" value={tallyCand3} onChange={(e) => setTallyCand3(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 2, fontWeight: 700 }} />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 8: PROCÈS-VERBAUX */}
            {activeView === 'pv' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>📄 Procès-Verbaux (PV) Autorisés</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {authorizedStations.map((st) => (
                    <div key={st.code} style={{ border: '1px solid #eee', padding: '0.8rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{st.name}</strong> <code>({st.code})</code>
                      </div>
                      <button type="button" onClick={() => alert(`Téléchargement PV ${st.code}`)} style={{ background: '#003893', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                        PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 9: INCIDENTS */}
            {activeView === 'incidents' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.35rem' }}>🚨 Signalement d'Incidents</h2>
                  <button type="button" onClick={() => setIncidentModalOpen(true)} style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                    + Signaler
                  </button>
                </div>
                {incidents.map((inc) => (
                  <div key={inc.id} style={{ border: '1px solid #f5c6cb', padding: '0.8rem', borderRadius: 6, background: '#fff8f7' }}>
                    <strong>{inc.id} ({inc.category})</strong>: {inc.description}
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 10: OBSERVATIONS */}
            {activeView === 'observations' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.35rem' }}>📝 Registre des Observations</h2>
                  <button type="button" onClick={() => setObsModalOpen(true)} style={{ background: '#003893', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                    + Ajouter
                  </button>
                </div>
                {remarks.map((r) => (
                  <div key={r.id} style={{ border: '1px solid #eee', padding: '0.8rem', borderRadius: 6 }}>
                    <strong>{r.title}</strong>: {r.description}
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 11: DOCUMENTS */}
            {activeView === 'documents' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>📑 Documents Électoraux</h2>
                <div style={{ fontSize: '0.88rem' }}>• Certificat d'Accréditation Officiel du Mandataire (PDF)</div>
              </div>
            )}

            {/* VIEW 12: NOTIFICATIONS */}
            {activeView === 'notifications' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.35rem' }}>🔔 Alertes & Notifications</h2>
                  <button type="button" onClick={markAllNotificationsRead} style={{ background: '#e0e8f5', color: '#003893', border: 'none', padding: '4px 8px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}>
                    Tout marquer comme lu
                  </button>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} style={{ border: '1px solid #eee', padding: '0.8rem', borderRadius: 6, background: n.read ? 'white' : '#f0f4fa' }}>
                    <strong>{n.title}</strong>: {n.message}
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 13: PROFIL */}
            {activeView === 'profile' && mandate && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.35rem' }}>👤 Profil Administrative</h2>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>Nom : <strong>{mandate.fullName}</strong></div>
                  <div>ID Mandataire : <code>{mandate.mandataireId}</code></div>
                  <div>Email : {mandate.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MOBILE BOTTOM NAVBAR ==================== */}
      <nav className="mandataire-mobile-bottom-nav">
        {mobilePrimaryNav.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#00e5ff' : '#a2c4ec',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                fontSize: '0.7rem',
                fontWeight: isActive ? 800 : 500,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Plus / Drawer Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a2c4ec',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontSize: '0.7rem',
            fontWeight: 500,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
          <span>Menu</span>
        </button>
      </nav>

      {/* ==================== MOBILE DRAWER / MENU SHEET ==================== */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#002d62', color: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📋 Menu Mandataire</h3>
              <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    background: activeView === item.id ? '#003893' : 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: 8,
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onLogout}
              style={{
                marginTop: '1rem',
                background: '#c5221f',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              🚪 Se Déconnecter
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      {/* MODAL INCIDENT */}
      {incidentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#c5221f' }}>🚨 Signaler un Incident Électoral au CEP</h2>
            <form onSubmit={handleAddIncident} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Bureau Concerné</label>
                <select value={incStation} onChange={(e) => setIncStation(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  {authorizedStations.map((st) => (
                    <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Catégorie de l'Incident</label>
                <select value={incCategory} onChange={(e) => setIncCategory(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="PROCEDURE">Violation de Procédure</option>
                  <option value="HARDWARE">Panne d'Appareil</option>
                  <option value="ACCESS">Intimidation / Obstruction</option>
                  <option value="SECURITY">Incident de Sécurité</option>
                  <option value="OTHER">Autre Réserve</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description détaillée</label>
                <textarea rows={4} required value={incDesc} onChange={(e) => setIncDesc(e.target.value)} placeholder="Précisez les faits..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIncidentModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Transmettre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OBSERVATION */}
      {obsModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#002d62' }}>📝 Consigner une Remarque / Contestation</h2>
            <form onSubmit={handleAddObservation} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Catégorie</label>
                <select value={obsCategory} onChange={(e) => setObsCategory(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="REGULARITY">Régularité émargement</option>
                  <option value="TALLY_CHECK">Dépouillement</option>
                  <option value="ANOMALY">Anomalie légère</option>
                  <option value="DISPUTE">Contestation Officielle</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Titre</label>
                <input type="text" required value={obsTitle} onChange={(e) => setObsTitle(e.target.value)} placeholder="Titre de la réserve..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description</label>
                <textarea rows={3} required value={obsDesc} onChange={(e) => setObsDesc(e.target.value)} placeholder="Détails du constat..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Total Voix Dénombrées</label>
                <input type="number" required value={obsVotes} onChange={(e) => setObsVotes(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setObsModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#003893', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Consigner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

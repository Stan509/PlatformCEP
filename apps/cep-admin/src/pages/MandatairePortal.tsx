import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type {
  ElectoralMandate,
  MandataireRemark,
  StationScopeItem,
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
  const { t, lang, setLang } = useI18n();
  const [activeView, setActiveView] = useState<MandataireView>('dashboard');
  const [mandate, setMandate] = useState<ElectoralMandate | null>(null);
  const [remarks, setRemarks] = useState<MandataireRemark[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      {/* ==================== 1. TOP BRANDING & IDENTITY HEADER ==================== */}
      <header
        style={{
          background: 'linear-gradient(135deg, #002d62 0%, #001a3a 100%)',
          color: 'white',
          padding: '1.2rem 2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Bar: Portal Name + Language Switcher + User Profile Logout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.8rem' }}>⚖️</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  PORTAIL OFFICIEL MANDATAIRE ÉLECTORAL — V2
                </h1>
                <span style={{ fontSize: '0.82rem', color: '#a2c4ec' }}>
                  Conseil Électoral Provisoire (CEP) — République d'Haïti
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Language Switcher */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: 2 }}>
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
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l === 'ht' ? 'Kreyòl' : l}
                  </button>
                ))}
              </div>

              {/* User Identity badge */}
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                <span>{user.fullName}</span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: '#c5221f',
                  color: 'white',
                  border: 'none',
                  padding: '0.45rem 1rem',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Mandat Metadata Banner */}
          {mandate && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.06)', padding: '1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a2c4ec', letterSpacing: '0.5px' }}>REPRÉSENTE OFFICIELLEMENT</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: 4 }}>
                  {mandate.representedEntityPhotoOrLogo && (
                    <img src={mandate.representedEntityPhotoOrLogo} alt="Logo" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid white' }} />
                  )}
                  <div>
                    <strong style={{ fontSize: '1rem', display: 'block', color: 'white' }}>{mandate.representedEntityName}</strong>
                    <span style={{ fontSize: '0.75rem', background: mandate.entityType === 'CANDIDATE' ? '#e0e8f5' : '#fef7e0', color: mandate.entityType === 'CANDIDATE' ? '#003893' : '#b06000', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                      TYPE : {mandate.entityType === 'CANDIDATE' ? 'CANDIDAT' : 'PARTI POLITIQUE'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a2c4ec', letterSpacing: '0.5px' }}>SCRUTIN & TERRITOIRE</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', marginTop: 4 }}>
                  {mandate.electionName}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#a2c4ec' }}>
                  Dépt {mandate.department} — Commune {mandate.commune}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a2c4ec', letterSpacing: '0.5px' }}>MODALITÉS AUTORISÉES</span>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {mandate.modalities.map((mod) => (
                    <span key={mod} style={{ background: '#137333', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                      {mod === 'BOTH' ? 'FIXED + ONLINE' : mod}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a2c4ec', letterSpacing: '0.5px' }}>STATUT DU MANDAT</span>
                <div style={{ marginTop: 4 }}>
                  <span style={{ background: mandate.status === 'ACTIVE' ? '#e6f4ea' : '#fce8e6', color: mandate.status === 'ACTIVE' ? '#137333' : '#c5221f', fontSize: '0.8rem', fontWeight: 900, padding: '3px 10px', borderRadius: 12 }}>
                    ✓ MANDAT {mandate.status} (ID: {mandate.id})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ==================== 2. NAVIGATION BAR ==================== */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e0e0e0', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', gap: '0.2rem', overflowX: 'auto', padding: '0 1rem' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', show: true },
            { id: 'mandat', label: '📜 Mon Mandat', show: true },
            { id: 'zone', label: '🗺️ Ma Zone', show: true },
            { id: 'bureaux', label: '🏢 Bureaux', show: hasPhysical },
            { id: 'online', label: '🌐 Online-Z', show: hasOnline },
            { id: 'participation', label: '👥 Participation', show: true },
            { id: 'decompte', label: '📊 Décompte Parallèle', show: true },
            { id: 'pv', label: '📄 Procès-Verbaux', show: true },
            { id: 'incidents', label: `🚨 Incidents (${openIncidentsCount})`, show: true },
            { id: 'observations', label: '📝 Observations', show: true },
            { id: 'documents', label: '📑 Documents', show: true },
            { id: 'notifications', label: `🔔 Alerts ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : ''}`, show: true },
            { id: 'profile', label: '👤 Profil', show: true },
          ]
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id as MandataireView)}
                  style={{
                    padding: '0.85rem 1.1rem',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #003893' : '3px solid transparent',
                    background: 'transparent',
                    color: isActive ? '#002d62' : '#555',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
        </div>
      </nav>

      {/* ==================== 3. MAIN CONTENT BODY ==================== */}
      <main style={{ maxWidth: 1240, margin: '1.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>BUREAUX AUTORISÉS</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#002d62', marginTop: 4 }}>{authorizedStations.length}</strong>
                <span style={{ fontSize: '0.75rem', color: '#003893' }}>Bureaux affectés</span>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>PARTICIPANTS</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#002d62', marginTop: 4 }}>{totalParticipants.toLocaleString()}</strong>
                <span style={{ fontSize: '0.75rem', color: 'gray' }}>Sur {totalElectors.toLocaleString()} inscrits</span>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>TAUX DE PARTICIPATION</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#137333', marginTop: 4 }}>{turnoutPercentage} %</strong>
                <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>Taux global en direct</span>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>INCIDENTS OUVERTS</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: openIncidentsCount > 0 ? '#c5221f' : '#137333', marginTop: 4 }}>{openIncidentsCount}</strong>
                <span style={{ fontSize: '0.75rem', color: 'gray' }}>Signalés à la BEC</span>
              </div>

              <div style={{ background: 'white', padding: '1.25rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#666', fontWeight: 700 }}>PV DISPONIBLES</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#003893', marginTop: 4 }}>{availablePvsCount}</strong>
                <span style={{ fontSize: '0.75rem', color: 'gray' }}>Transmis et numérisés</span>
              </div>
            </div>

            {/* Quick Actions & Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#002d62', fontSize: '1.15rem' }}>🏢 Aperçu des Bureaux sous Votre Mandat</h3>
                  <button type="button" onClick={() => setActiveView('bureaux')} style={{ background: 'none', border: 'none', color: '#003893', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Voir tout →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {authorizedStations.map((st) => (
                    <div key={st.code} style={{ border: '1px solid #eee', padding: '0.9rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#002d62', fontSize: '0.95rem' }}>{st.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'gray', marginTop: 2 }}>{st.location}</div>
                        <span style={{ fontSize: '0.75rem', background: '#e0e8f5', color: '#003893', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                          TYPE : {st.type}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#137333' }}>{st.participantsCount} / {st.electorsCount} votes</div>
                        <span style={{ fontSize: '0.75rem', color: st.pvStatus === 'AVAILABLE' ? '#137333' : '#b06000', fontWeight: 700 }}>
                          PV {st.pvStatus === 'AVAILABLE' ? 'DISPONIBLE' : 'EN ATTENTE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Panel */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#002d62', fontSize: '1.15rem' }}>⚡ Actions Rapides</h3>
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(true)}
                  style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                >
                  🚨 Signaler un Incident au CEP
                </button>
                <button
                  type="button"
                  onClick={() => setObsModalOpen(true)}
                  style={{ background: '#003893', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                >
                  📝 Enregistrer une Remarque Contradictoire
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('decompte')}
                  style={{ background: '#137333', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                >
                  📊 Saisir le Décompte Parallèle
                </button>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: MON MANDAT */}
        {activeView === 'mandat' && mandate && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ borderBottom: '2px solid #003893', paddingBottom: '0.8rem' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.5rem' }}>📜 Mandat Officiel d'Accréditation Électorale</h2>
              <p style={{ margin: '4px 0 0', color: 'gray', fontSize: '0.9rem' }}>
                Document officiel délivré par le Conseil Électoral Provisoire (CEP) conformément au Décret Électoral.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Identité Mandataire */}
              <div style={{ border: '1px solid #eee', padding: '1.2rem', borderRadius: 8, background: '#f8f9fa' }}>
                <h4 style={{ margin: '0 0 0.8rem', color: '#003893', fontSize: '1rem' }}>👤 IDENTITÉ DU MANDATAIRE</h4>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div><strong>Nom & Prénom:</strong> {mandate.fullName}</div>
                  <div><strong>ID Mandataire:</strong> <code>{mandate.mandataireId}</code></div>
                  <div><strong>Téléphone:</strong> {mandate.phone}</div>
                  <div><strong>Email Officiel:</strong> {mandate.email}</div>
                  <div>
                    <strong>Statut Mandat:</strong>{' '}
                    <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.8rem' }}>
                      {mandate.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Représentation */}
              <div style={{ border: '1px solid #eee', padding: '1.2rem', borderRadius: 8, background: '#f8f9fa' }}>
                <h4 style={{ margin: '0 0 0.8rem', color: '#003893', fontSize: '1rem' }}>🏛️ ENTTITÉ REPRÉSENTÉE</h4>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div><strong>Type:</strong> {mandate.entityType === 'CANDIDATE' ? 'Candidat Officiel' : 'Parti Politique Reconnu'}</div>
                  <div><strong>Désignation:</strong> {mandate.representedEntityName}</div>
                  <div><strong>Identifiant Unique:</strong> <code>{mandate.representedEntityId}</code></div>
                </div>
              </div>

              {/* Territoire & Scrutin */}
              <div style={{ border: '1px solid #eee', padding: '1.2rem', borderRadius: 8, background: '#f8f9fa' }}>
                <h4 style={{ margin: '0 0 0.8rem', color: '#003893', fontSize: '1rem' }}>🗳️ SCRUTIN & TERRITOIRE</h4>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div><strong>Élection:</strong> {mandate.electionName}</div>
                  <div><strong>Département:</strong> {mandate.department}</div>
                  <div><strong>Commune:</strong> {mandate.commune}</div>
                  <div><strong>Zone Électorale:</strong> {mandate.electoralZone}</div>
                </div>
              </div>
            </div>

            {/* Effective Permissions Matrix */}
            <div style={{ border: '1px solid #e0e0e0', padding: '1.2rem', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 0.8rem', color: '#003893', fontSize: '1rem' }}>🛡️ PERMISSIONS EFFECTIVES DU MANDAT</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                {[
                  { key: 'canViewParticipation', label: 'Consulter la participation', val: mandate.permissions.canViewParticipation },
                  { key: 'canViewResults', label: 'Consulter les résultats autorisés', val: mandate.permissions.canViewResults },
                  { key: 'canReportIncident', label: 'Signaler des incidents à la BEC', val: mandate.permissions.canReportIncident },
                  { key: 'canSubmitObservation', label: 'Soumettre des remarques & contestations', val: mandate.permissions.canSubmitObservation },
                  { key: 'canViewPv', label: 'Consulter et télécharger les PV', val: mandate.permissions.canViewPv },
                  { key: 'canSignPv', label: 'Signer formellement les Procès-Verbaux', val: mandate.permissions.canSignPv },
                  { key: 'canTallyVotes', label: 'Effectuer le décompte contradictoire', val: mandate.permissions.canTallyVotes },
                ].map((perm) => (
                  <div key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: perm.val ? '#e6f4ea' : '#fce8e6', padding: '8px 12px', borderRadius: 6 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: perm.val ? '#137333' : '#c5221f' }}>{perm.val ? '✓' : '✗'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: perm.val ? '#137333' : '#c5221f' }}>{perm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MA ZONE */}
        {activeView === 'zone' && mandate && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.4rem' }}>🗺️ Périmètre Territoriale Attribué</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'gray', fontSize: '0.88rem' }}>
              🔒 <strong>Sécurité du Périmètre</strong> : Le backend filtre strictement les entités exposées à votre profil.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: 8, border: '1px solid #ddd' }}>
              <div style={{ fontWeight: 800, color: '#003893', fontSize: '1.1rem' }}>
                🇭🇹 Département de {mandate.department}
              </div>
              <div style={{ marginLeft: '1.5rem', borderLeft: '2px solid #003893', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: '#002d62', fontSize: '1rem' }}>
                  🏛️ Commune de {mandate.commune}
                </div>
                <div style={{ marginLeft: '1.5rem', borderLeft: '2px solid #137333', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontWeight: 700, color: '#137333', fontSize: '0.95rem' }}>
                    📍 Zone Électorale : {mandate.electoralZone}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {authorizedStations.map((st) => (
                      <div key={st.code} style={{ background: 'white', padding: '0.6rem 1rem', borderRadius: 6, border: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{st.name}</strong> <code>({st.code})</code>
                          <div style={{ fontSize: '0.78rem', color: 'gray' }}>{st.location}</div>
                        </div>
                        <span style={{ background: '#e0e8f5', color: '#003893', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                          {st.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: BUREAUX DE VOTE */}
        {activeView === 'bureaux' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.4rem' }}>🏢 Bureaux de Vote Autorisés sous Votre Mandat</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authorizedStations.map((st) => (
                <div key={st.code} style={{ border: '1px solid #ddd', padding: '1.2rem', borderRadius: 8, background: st.type === 'NOMADIC' ? '#f0f7ff' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003893' }}>CODE: {st.code}</span>
                      <h3 style={{ margin: '2px 0 0', color: '#002d62', fontSize: '1.2rem' }}>{st.name}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'gray' }}>📍 {st.location}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ background: '#003893', color: 'white', padding: '3px 10px', borderRadius: 4, fontWeight: 800, fontSize: '0.8rem' }}>
                        TYPE : {st.type}
                      </span>
                      {st.geofenceStatus && (
                        <span style={{ background: st.geofenceStatus === 'VALID' ? '#e6f4ea' : '#fce8e6', color: st.geofenceStatus === 'VALID' ? '#137333' : '#c5221f', padding: '3px 10px', borderRadius: 4, fontWeight: 800, fontSize: '0.8rem' }}>
                          GÉOFENCE: {st.geofenceStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginTop: '1rem', background: '#f8f9fa', padding: '0.8rem', borderRadius: 6 }}>
                    <div>Inscrits : <strong>{st.electorsCount}</strong></div>
                    <div>Participants : <strong>{st.participantsCount}</strong></div>
                    <div>Participation : <strong>{((st.participantsCount / st.electorsCount) * 100).toFixed(1)} %</strong></div>
                    <div>PV Numérisé : <strong style={{ color: st.pvStatus === 'AVAILABLE' ? '#137333' : '#b06000' }}>{st.pvStatus}</strong></div>
                  </div>

                  {/* Device vs Station distinction */}
                  {st.devices && st.devices.length > 0 && (
                    <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#555', background: '#fff', border: '1px dashed #ccc', padding: '0.6rem 0.8rem', borderRadius: 6 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>📱 Appareils BIOPAD Associés (Station != Device) :</div>
                      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        {st.devices.map((d) => (
                          <span key={d.id} style={{ background: '#f1f3f4', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
                            {d.id} ({d.status})
                          </span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'gray', fontStyle: 'italic', display: 'block', marginTop: 4 }}>
                        ℹ️ Seul le CEP est habilité à enrôler ou révoquer des appareils.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: ONLINE-Z */}
        {activeView === 'online' && hasOnline && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <div style={{ borderBottom: '2px solid #003893', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.4rem' }}>🌐 Unité Virtuelle de Vote (ONLINE-Z)</h2>
              <p style={{ margin: '4px 0 0', color: 'gray', fontSize: '0.88rem' }}>
                Suivi opérationnel du vote web et consulaire pour la Diaspora et électeurs autorisés.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div style={{ border: '2px solid #003893', padding: '1.2rem', borderRadius: 8, background: '#f0f4fa' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#003893', fontWeight: 800 }}>ÉLECTEURS ÉLIGIBLES ONLINE</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#002d62', marginTop: 4 }}>5 000</strong>
              </div>
              <div style={{ border: '1px solid #ddd', padding: '1.2rem', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#555', fontWeight: 800 }}>SUFFRAGES WEBS EXPÉDIÉS</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#137333', marginTop: 4 }}>3 410</strong>
              </div>
              <div style={{ border: '1px solid #ddd', padding: '1.2rem', borderRadius: 8 }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#555', fontWeight: 800 }}>TAUX DE PARTICIPATION DIASPORA</span>
                <strong style={{ display: 'block', fontSize: '2rem', color: '#137333', marginTop: 4 }}>68.20 %</strong>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', background: '#fff8f7', border: '1px solid #f5c6cb', padding: '1rem', borderRadius: 8, color: '#721c24', fontSize: '0.88rem' }}>
              <strong>🔒 Secret du Vote Web & Anonymat Cryptographique :</strong> Les bulletins virtuels scellés dans l'enclave cryptographique ne comportent aucune liaison avec l'identité de l'électeur.
            </div>
          </div>
        )}

        {/* VIEW 6: PARTICIPATION */}
        {activeView === 'participation' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.4rem' }}>👥 Données Agrégées de Participation Électorale</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'gray', fontSize: '0.88rem' }}>
              Statistiques officielles d'émargement consolidées par bureau et par zone.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code & Nom du Bureau</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Modalité</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Inscrits</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Participants</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Taux de Participation</th>
                </tr>
              </thead>
              <tbody>
                {authorizedStations.map((st) => (
                  <tr key={st.code} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{st.name} ({st.code})</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{st.type}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{st.electorsCount}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{st.participantsCount}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#137333', fontWeight: 800 }}>
                      {((st.participantsCount / st.electorsCount) * 100).toFixed(2)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 7: DÉCOMPTE PARALLÈLE */}
        {activeView === 'decompte' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.4rem' }}>📊 Décompte Parallèle des Voix & Réconciliation</h2>
              <p style={{ margin: '4px 0 0', color: 'gray', fontSize: '0.88rem' }}>
                Saisissez les résultats observés lors du dépouillement contradictoire pour vérifier l'exactitude des totaux.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sélectionner le Bureau de Vote :</label>
              <select value={selectedStationCode} onChange={(e) => setSelectedStationCode(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ccc' }}>
                {authorizedStations.map((st) => (
                  <option key={st.code} value={st.code}>{st.name} ({st.code})</option>
                ))}
              </select>
            </div>

            {/* Reconciliation Control Banner */}
            <div style={{ background: isReconciled ? '#e6f4ea' : '#fce8e6', border: isReconciled ? '2px solid #137333' : '2px solid #c5221f', borderRadius: 8, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: isReconciled ? '#137333' : '#c5221f', fontSize: '1.05rem' }}>
                  {isReconciled ? '✅ Réconciliation Arithmétique Complète' : '⚠️ ERREUR DE RECONCILIATION ARITHMÉTIQUE'}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#333' }}>
                  Somme calculée des candidats + blancs + nuls = <strong>{calculatedSum}</strong> | Total bulletins déclarés = <strong>{tallyTotalStated}</strong>
                </p>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{isReconciled ? '👌' : '⚠️'}</span>
            </div>

            {/* Input Form Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>#14 JEAN-CHARLES MOÏSE (Pitit Desalin)</label>
                <input type="number" value={tallyCand1} onChange={(e) => setTallyCand1(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>#07 MIRLANDE MANIGAT (RDNP)</label>
                <input type="number" value={tallyCand2} onChange={(e) => setTallyCand2(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>#22 STEVEN BENOÎT (LAPEH)</label>
                <input type="number" value={tallyCand3} onChange={(e) => setTallyCand3(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>BULLETINS BLANCS</label>
                <input type="number" value={tallyBlanks} onChange={(e) => setTallyBlanks(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontWeight: 700 }} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>BULLETINS NULS</label>
                <input type="number" value={tallyNulls} onChange={(e) => setTallyNulls(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontWeight: 700 }} />
              </div>

              <div style={{ border: '2px solid #002d62', padding: '1rem', borderRadius: 8, background: '#f0f4fa' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#002d62' }}>TOTAL BULLETINS COMPTÉS ENREGISTRÉS</label>
                <input type="number" value={tallyTotalStated} onChange={(e) => setTallyTotalStated(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #002d62', marginTop: 4, fontWeight: 900, fontSize: '1.2rem', color: '#002d62' }} />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: PROCÈS-VERBAUX */}
        {activeView === 'pv' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.4rem' }}>📄 Consultation & Signature des Procès-Verbaux (PV)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authorizedStations.map((st) => (
                <div key={st.code} style={{ border: '1px solid #eee', padding: '1.2rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#002d62', fontSize: '1.1rem' }}>{st.name} ({st.code})</strong>
                    <div style={{ fontSize: '0.85rem', color: 'gray', marginTop: 2 }}>{st.location}</div>
                    <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700, marginTop: 4, display: 'block' }}>
                      Hash SHA-256 : <code>sha256:8f9a...3b21</code>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => alert(`Téléchargement du PV numérisé pour le bureau ${st.code}...`)} style={{ background: '#003893', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                      Télécharger PDF
                    </button>
                    {mandate?.permissions.canSignPv ? (
                      <button type="button" onClick={() => alert(`Accusé de réception et signature apposée sur le PV ${st.code}`)} style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                        ✍️ Signer le PV
                      </button>
                    ) : (
                      <button type="button" disabled title="Permission CAN_SIGN_PV requise sur votre mandat" style={{ background: '#ccc', color: '#666', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'default', fontSize: '0.85rem' }}>
                        🔒 Signature non autorisée
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 9: INCIDENTS */}
        {activeView === 'incidents' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.4rem' }}>🚨 Signalement & Suivi des Incidents Électoraux</h2>
              <button type="button" onClick={() => setIncidentModalOpen(true)} style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                + Signaler un Nouvel Incident
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incidents.map((inc) => (
                <div key={inc.id} style={{ border: '1px solid #f5c6cb', borderRadius: 8, padding: '1rem', background: '#fff8f7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#721c24', fontSize: '1rem' }}>{inc.id} — Bureau {inc.stationCode} ({inc.category})</strong>
                    <span style={{ background: '#fef7e0', color: '#b06000', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.78rem' }}>
                      {inc.status}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#333' }}>{inc.description}</p>
                  <span style={{ fontSize: '0.78rem', color: 'gray', marginTop: 6, display: 'block' }}>Signalé le : {inc.reportedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 10: OBSERVATIONS */}
        {activeView === 'observations' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.4rem' }}>📝 Registre des Observations & Contestations</h2>
              <button type="button" onClick={() => setObsModalOpen(true)} style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                + Consigner une Remarque
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {remarks.map((r) => (
                <div key={r.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#002d62', fontSize: '1rem' }}>{r.title}</strong>
                    <span style={{ background: r.status === 'VALIDATED' ? '#e6f4ea' : '#fef7e0', color: r.status === 'VALIDATED' ? '#137333' : '#b06000', padding: '2px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.75rem' }}>
                      {r.status}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#444' }}>{r.description}</p>
                  <div style={{ fontSize: '0.78rem', color: 'gray', marginTop: 6, display: 'flex', gap: '1rem' }}>
                    <span>Bureau: {r.pollingStationCode}</span>
                    <span>Date: {r.reportedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 11: DOCUMENTS */}
        {activeView === 'documents' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.4rem' }}>📑 Centre de Documents Électoraux Autorisés</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { title: 'Certificat d\'Accréditation Officiel du Mandataire (PDF)', type: 'PDF', date: '2026-09-01' },
                { title: 'Guide de Procédure des Mandataires en Bureau de Vote', type: 'PDF', date: '2026-08-28' },
                { title: 'Code Électoral et Décret des Droits de Représentation', type: 'PDF', date: '2026-08-15' },
              ].map((doc, idx) => (
                <div key={idx} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#002d62' }}>{doc.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'gray' }}>Publié le : {doc.date}</div>
                  </div>
                  <button type="button" onClick={() => alert(`Téléchargement de ${doc.title}...`)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                    📥 Télécharger
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 12: NOTIFICATIONS */}
        {activeView === 'notifications' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.4rem' }}>🔔 Alertes & Notifications CEP</h2>
              <button type="button" onClick={markAllNotificationsRead} style={{ background: '#e0e8f5', color: '#003893', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                Tout marquer comme lu
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {notifications.map((n) => (
                <div key={n.id} style={{ border: '1px solid #eee', background: n.read ? '#fff' : '#f0f4fa', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#002d62' }}>{n.title} {!n.read && <span style={{ color: '#003893' }}>●</span>}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'gray' }}>{n.date}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#444' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 13: PROFIL */}
        {activeView === 'profile' && mandate && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#002d62', fontSize: '1.4rem' }}>👤 Profil Administrative du Mandataire</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: 480, fontSize: '0.9rem' }}>
              <div><strong>Nom complet:</strong> {mandate.fullName}</div>
              <div><strong>Identifiant Compte:</strong> <code>{user.username}</code></div>
              <div><strong>ID Mandataire:</strong> <code>{mandate.mandataireId}</code></div>
              <div><strong>Téléphone:</strong> {mandate.phone}</div>
              <div><strong>Email:</strong> {mandate.email}</div>
              <div><strong>Accréditation Validée jusqu'au:</strong> {mandate.validTo}</div>
              <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: 8, fontSize: '0.82rem', color: '#666' }}>
                ℹ️ La modification des données administratives requiert une demande formelle auprès du Bureau Central du CEP.
              </div>
            </div>
          </div>
        )}
      </main>

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
                  <option value="HARDWARE">Panne ou Dysfonctionnement d'Appareil</option>
                  <option value="ACCESS">Intimidation ou Obstruction d'Accès</option>
                  <option value="SECURITY">Incident de Sécurité / Ordre Public</option>
                  <option value="OTHER">Autre Réserve Majeure</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description détaillée des Faits</label>
                <textarea rows={4} required value={incDesc} onChange={(e) => setIncDesc(e.target.value)} placeholder="Décrivez les faits constatés avec précision..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIncidentModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Transmettre l'Incident</button>
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
                  <option value="REGULARITY">Régularité de l'émargement</option>
                  <option value="TALLY_CHECK">Dépouillement & Décompte</option>
                  <option value="ANOMALY">Anomalie légère</option>
                  <option value="DISPUTE">Contestation Officielle</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Titre de l'Observation</label>
                <input type="text" required value={obsTitle} onChange={(e) => setObsTitle(e.target.value)} placeholder="ex: Réserve sur le nombre de bulletins nuls" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description</label>
                <textarea rows={3} required value={obsDesc} onChange={(e) => setObsDesc(e.target.value)} placeholder="Détails de la réserve ou du constat..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Total Voix Dénombrées (le cas échéant)</label>
                <input type="number" required value={obsVotes} onChange={(e) => setObsVotes(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setObsModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#003893', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Consigner la Remarque</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

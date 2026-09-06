import { Component, useState } from 'react';
import type { ErrorInfo, JSX, ReactNode } from 'react';
import { Sidebar } from './components/admin/Sidebar';
import { Topbar } from './components/admin/Topbar';
import type { AdminRoute } from './router';
import { ROUTE_META_REGISTRY, useAdminRoute } from './router';
import { Dashboard } from './pages/Dashboard';
import { MyScope } from './pages/MyScope';
import { Elections } from './pages/Elections';
import { Electors } from './pages/Electors';
import { Assignments } from './pages/Assignments';
import { Candidates } from './pages/Candidates';
import { Parties } from './pages/Parties';
import { Mandataires } from './pages/Mandataires';
import { Devices } from './pages/Devices';
import { ApkManager } from './pages/ApkManager';
import { CommandCenter } from './pages/CommandCenter';
import { ParticipationPage } from './pages/ParticipationPage';
import { OnlineZPage } from './pages/OnlineZPage';
import { CountPage } from './pages/CountPage';
import { PVPage } from './pages/PVPage';
import { ResultsPage } from './pages/ResultsPage';
import { Incidents } from './pages/Incidents';
import { Audit } from './pages/Audit';
import { Releases } from './pages/Releases';
import { Users } from './pages/Users';
import { PermissionsManage } from './pages/PermissionsManage';
import { Settings } from './pages/Settings';
import { LoginPage } from './pages/LoginPage';
import { CandidatePortal } from './pages/CandidatePortal';
import { PartyPortal } from './pages/PartyPortal';
import { MandatairePortal } from './pages/MandatairePortal';
import { AccessDenied } from './pages/AccessDenied';
import { ScopeDenied } from './pages/ScopeDenied';
import { ViewModeProvider } from './context/ViewModeContext';
import { adminApi } from './lib/api';
import type { UserAccount } from './lib/mockData';
import { hasPermission } from './lib/permissions';
import { hasScope } from './lib/scopes';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught Error in CEP Admin:', error, errorInfo);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#c5221f', margin: 0 }}>⚠️ Une erreur est survenue lors du chargement de cette page.</h2>
          <p style={{ color: '#555', marginTop: '0.5rem' }}>{this.state.error?.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = '#dashboard';
              window.location.reload();
            }}
            style={{ marginTop: '1rem', background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
          >
            🔄 Recharger le tableau de bord
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function renderPage(route: AdminRoute, session: UserAccount, onLogout: () => void): JSX.Element {
  const meta = ROUTE_META_REGISTRY[route];

  // 1. Permission Guard
  if (meta?.requiredPermissions && !hasPermission(session.permissions, meta.requiredPermissions)) {
    return <AccessDenied requiredPermission={meta.requiredPermissions} currentUserRole={session.roleTitle} />;
  }

  // 2. Scope Guard Evaluation for specific routes
  if (session.scope) {
    if (!hasScope(session.scope, { electionId: 'e1' })) {
      return <ScopeDenied userScope={session.scope} targetElection="Élections Générales 2026" />;
    }
  }

  switch (route) {
    case 'my-scope':
      return <MyScope user={session} />;
    case 'elections':
    case 'election-config':
      return <Elections />;
    case 'electors':
      return <Electors user={session} />;
    case 'assignments':
      return <Assignments user={session} />;
    case 'candidates':
      return <Candidates />;
    case 'parties':
      return <Parties />;
    case 'mandates':
      return <Mandataires user={session} />;
    case 'mandataire':
      return <MandatairePortal user={session} onLogout={onLogout} />;
    case 'stations':
      return <Devices />;
    case 'devices':
      return <Devices />;
    case 'apk-users':
      return <ApkManager />;
    case 'command-center':
      return <CommandCenter />;
    case 'participation':
      return <ParticipationPage user={session} />;
    case 'online-z':
      return <OnlineZPage user={session} />;
    case 'count':
      return <CountPage user={session} />;
    case 'pv':
      return <PVPage user={session} />;
    case 'results':
      return <ResultsPage user={session} />;
    case 'incidents':
      return <Incidents />;
    case 'audit':
      return <Audit />;
    case 'releases':
      return <Releases />;
    case 'users':
    case 'roles':
      return <Users />;
    case 'permissions-manage':
      return <PermissionsManage currentUser={session} />;
    case 'settings':
      return <Settings />;
    case 'dashboard':
    default:
      return <Dashboard user={session} />;
  }
}

/** Back-office CEP V3 — Routage dynamique par permissions & périmètres. */
export function App(): JSX.Element {
  const route = useAdminRoute();
  const [session, setSession] = useState<UserAccount | null>(() => adminApi.getCurrentSession());

  const handleLogout = () => {
    adminApi.logout();
    setSession(null);
  };

  const handleSwitchUser = (nextUser: UserAccount) => {
    setSession(nextUser);
  };

  // If not logged in, render single dynamic login page
  if (!session) {
    return <LoginPage onLoginSuccess={(u) => setSession(u)} />;
  }

  // Strict Role Isolation: Candidate Portal
  if (session.role === 'CANDIDATE') {
    return <CandidatePortal user={session} onLogout={handleLogout} />;
  }

  // Strict Role Isolation: Political Party Portal
  if (session.role === 'PARTY') {
    return <PartyPortal user={session} onLogout={handleLogout} />;
  }

  // Strict Role Isolation: Mandataire Portal
  if (session.role === 'MANDATAIRE') {
    return <MandatairePortal user={session} onLogout={handleLogout} />;
  }

  // Full CEP Admin V3 Back-office reserved exclusively for CEP Council Members & Admins
  return (
    <ErrorBoundary>
      <ViewModeProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar route={route} user={session} onLogout={handleLogout} />
          <div style={{ flex: 1, marginLeft: 255, display: 'flex', flexDirection: 'column', minWidth: 0, width: 'calc(100% - 255px)', minHeight: '100vh' }}>
            <Topbar route={route} user={session} onSwitchUser={handleSwitchUser} onLogout={handleLogout} />
            <main style={{ padding: 'var(--cep-space-6)', background: 'var(--cep-color-background)', flex: 1, overflowY: 'auto' }}>
              {renderPage(route, session, handleLogout)}
            </main>
          </div>
        </div>
      </ViewModeProvider>
    </ErrorBoundary>
  );
}

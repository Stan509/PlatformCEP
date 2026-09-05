import { useState } from 'react';
import type { JSX } from 'react';
import { Sidebar } from './components/admin/Sidebar';
import { Topbar } from './components/admin/Topbar';
import type { AdminRoute } from './router';
import { useAdminRoute } from './router';
import { Dashboard } from './pages/Dashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Elections } from './pages/Elections';
import { Candidates } from './pages/Candidates';
import { Parties } from './pages/Parties';
import { ApkManager } from './pages/ApkManager';
import { Devices } from './pages/Devices';
import { Incidents } from './pages/Incidents';
import { Audit } from './pages/Audit';
import { Releases } from './pages/Releases';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { LoginPage } from './pages/LoginPage';
import { CandidatePortal } from './pages/CandidatePortal';
import { MandatairePortal } from './pages/MandatairePortal';
import { adminApi } from './lib/api';
import type { UserAccount } from './lib/mockData';

function renderPage(route: AdminRoute): JSX.Element {
  switch (route) {
    case 'command-center':
      return <CommandCenter />;
    case 'elections':
      return <Elections />;
    case 'candidates':
      return <Candidates />;
    case 'parties':
      return <Parties />;
    case 'apk-users':
      return <ApkManager />;
    case 'devices':
      return <Devices />;
    case 'incidents':
      return <Incidents />;
    case 'audit':
      return <Audit />;
    case 'releases':
      return <Releases />;
    case 'users':
      return <Users />;
    case 'settings':
      return <Settings />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
}

/** Back-office CEP — cockpit institutionnel + routage d'authentification unifiée. */
export function App(): JSX.Element {
  const route = useAdminRoute();
  const [session, setSession] = useState<UserAccount | null>(() => adminApi.getCurrentSession());

  const handleLogout = () => {
    adminApi.logout();
    setSession(null);
  };

  // If not logged in, render single dynamic login page
  if (!session) {
    return <LoginPage onLoginSuccess={(u) => setSession(u)} />;
  }

  // Role-specific Portal Redirection
  if (session.role === 'CANDIDATE') {
    return <CandidatePortal user={session} onLogout={handleLogout} />;
  }

  if (session.role === 'MANDATAIRE') {
    return <MandatairePortal user={session} onLogout={handleLogout} />;
  }

  // Full CEP Admin Back-office for CEP Members, Admins, Parties & APK Agents
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar route={route} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar route={route} onLogout={handleLogout} />
        <main style={{ padding: 'var(--cep-space-6)', background: 'var(--cep-color-background)', flex: 1 }}>
          {renderPage(route)}
        </main>
      </div>
    </div>
  );
}

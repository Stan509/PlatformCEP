import type { JSX } from 'react';
import { Sidebar } from './components/admin/Sidebar';
import { Topbar } from './components/admin/Topbar';
import type { AdminRoute } from './router';
import { useAdminRoute } from './router';
import { Dashboard } from './pages/Dashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Elections } from './pages/Elections';
import { Devices } from './pages/Devices';
import { Incidents } from './pages/Incidents';
import { Audit } from './pages/Audit';
import { Releases } from './pages/Releases';
import { Settings } from './pages/Settings';

function renderPage(route: AdminRoute): JSX.Element {
  switch (route) {
    case 'command-center':
      return <CommandCenter />;
    case 'elections':
      return <Elections />;
    case 'devices':
      return <Devices />;
    case 'incidents':
      return <Incidents />;
    case 'audit':
      return <Audit />;
    case 'releases':
      return <Releases />;
    case 'settings':
      return <Settings />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
}

/** Back-office CEP — cockpit institutionnel + Command Center (routage hash). */
export function App(): JSX.Element {
  const route = useAdminRoute();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar route={route} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar route={route} />
        <main style={{ padding: 'var(--cep-space-6)', background: 'var(--cep-color-background)', flex: 1 }}>
          {renderPage(route)}
        </main>
      </div>
    </div>
  );
}

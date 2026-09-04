import type { JSX } from 'react';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import type { Route } from './router';
import { useHashRoute } from './router';
import { Home } from './pages/Home';
import { CheckStatus } from './pages/CheckStatus';
import { Register } from './pages/Register';
import { Candidates } from './pages/Candidates';
import { Results } from './pages/Results';
import { Diaspora, Help, Info } from './pages/Info';

function renderPage(route: Route): JSX.Element {
  switch (route) {
    case 'check-status':
      return <CheckStatus />;
    case 'register':
      return <Register />;
    case 'candidates':
      return <Candidates />;
    case 'results':
      return <Results />;
    case 'info':
      return <Info />;
    case 'diaspora':
      return <Diaspora />;
    case 'help':
      return <Help />;
    case 'home':
    default:
      return <Home />;
  }
}

/** PWA publique CEP — layout institutionnel + routage (hash). */
export function App(): JSX.Element {
  const route = useHashRoute();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header route={route} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{renderPage(route)}</main>
      <Footer />
    </div>
  );
}

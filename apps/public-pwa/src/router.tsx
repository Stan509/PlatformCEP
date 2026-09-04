import { useEffect, useState } from 'react';

/** Routes de la PWA publique. */
export type Route =
  | 'home'
  | 'check-status'
  | 'register'
  | 'candidates'
  | 'results'
  | 'info'
  | 'diaspora'
  | 'help';

const VALID: Route[] = [
  'home',
  'check-status',
  'register',
  'candidates',
  'results',
  'info',
  'diaspora',
  'help',
];

function fromHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '').trim();
  return (VALID as string[]).includes(raw) ? (raw as Route) : 'home';
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => fromHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(fromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function navigate(route: Route): void {
  window.location.hash = route;
}

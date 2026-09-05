import { useEffect, useState } from 'react';

/** Routes de l'admin CEP. */
export type AdminRoute =
  | 'dashboard'
  | 'command-center'
  | 'elections'
  | 'candidates'
  | 'devices'
  | 'incidents'
  | 'audit'
  | 'releases'
  | 'users'
  | 'settings';

const VALID: AdminRoute[] = [
  'dashboard',
  'command-center',
  'elections',
  'candidates',
  'devices',
  'incidents',
  'audit',
  'releases',
  'users',
  'settings',
];

function fromHash(hash: string): AdminRoute {
  const raw = hash.replace(/^#\/?/, '').trim();
  return (VALID as string[]).includes(raw) ? (raw as AdminRoute) : 'dashboard';
}

export function useAdminRoute(): AdminRoute {
  const [route, setRoute] = useState<AdminRoute>(() => fromHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(fromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function adminNavigate(route: AdminRoute): void {
  window.location.hash = route;
}

import { useEffect, useState } from 'react';
import type { PermissionCode } from './lib/permissions';

/** All CEP Admin V3 routes mapped to functional domains. */
export type AdminRoute =
  | 'dashboard'
  | 'my-scope'
  | 'elections'
  | 'election-config'
  | 'electors'
  | 'assignments'
  | 'candidates'
  | 'parties'
  | 'mandates'
  | 'stations'
  | 'devices'
  | 'apk-users'
  | 'command-center'
  | 'participation'
  | 'online-z'
  | 'count'
  | 'pv'
  | 'results'
  | 'incidents'
  | 'audit'
  | 'releases'
  | 'users'
  | 'roles'
  | 'permissions-manage'
  | 'settings'
  | 'mandataire'; // alias for mandataire portal view

export interface RouteMeta {
  route: AdminRoute;
  label: string;
  requiredPermissions?: PermissionCode[];
}

export const ROUTE_META_REGISTRY: Record<AdminRoute, RouteMeta> = {
  dashboard: { route: 'dashboard', label: 'Tableau de bord', requiredPermissions: ['dashboard.view'] },
  'my-scope': { route: 'my-scope', label: 'Mon Périmètre', requiredPermissions: ['myScope.view'] },
  elections: { route: 'elections', label: 'Élections', requiredPermissions: ['election.view'] },
  'election-config': { route: 'election-config', label: 'Configuration Scrutin', requiredPermissions: ['election.update'] },
  electors: { route: 'electors', label: 'Registre Électoral', requiredPermissions: ['elector.view'] },
  assignments: { route: 'assignments', label: 'Affectations Électorales', requiredPermissions: ['elector.assign'] },
  candidates: { route: 'candidates', label: 'Candidats & Programmes', requiredPermissions: ['candidate.view'] },
  parties: { route: 'parties', label: 'Partis Politiques', requiredPermissions: ['party.view'] },
  mandates: { route: 'mandates', label: 'Accréditations Mandataires', requiredPermissions: ['mandate.view'] },
  mandataire: { route: 'mandataire', label: 'Portail Mandataire V2', requiredPermissions: ['mandate.view'] },
  stations: { route: 'stations', label: 'Bureaux de Vote (Stations)', requiredPermissions: ['station.view'] },
  devices: { route: 'devices', label: 'Flotte BIOPAD', requiredPermissions: ['device.view'] },
  'apk-users': { route: 'apk-users', label: 'Agents Terrain APK', requiredPermissions: ['device.view'] },
  'command-center': { route: 'command-center', label: 'Centre de Commandement', requiredPermissions: ['dashboard.view'] },
  participation: { route: 'participation', label: 'Taux de Participation', requiredPermissions: ['result.view', 'station.view'] },
  'online-z': { route: 'online-z', label: 'Circonspection ONLINE-Z', requiredPermissions: ['station.view'] },
  count: { route: 'count', label: 'Comptage & Dépouillement', requiredPermissions: ['count.view'] },
  pv: { route: 'pv', label: 'Procès-Verbaux (PV)', requiredPermissions: ['pv.view'] },
  results: { route: 'results', label: 'Résultats Électoraux', requiredPermissions: ['result.view'] },
  incidents: { route: 'incidents', label: 'Incidents & Alertes', requiredPermissions: ['incident.view'] },
  audit: { route: 'audit', label: 'Piste d\'Audit Cryptographique', requiredPermissions: ['audit.view'] },
  releases: { route: 'releases', label: 'Versions Binaires APK', requiredPermissions: ['device.view'] },
  users: { route: 'users', label: 'Utilisateurs & Rôles', requiredPermissions: ['user.view'] },
  roles: { route: 'roles', label: 'Rôles & Permissions', requiredPermissions: ['user.permissions.manage'] },
  'permissions-manage': { route: 'permissions-manage', label: 'Matrice de Permissions', requiredPermissions: ['user.permissions.manage'] },
  settings: { route: 'settings', label: 'Configuration Système', requiredPermissions: ['dashboard.view'] },
};

const VALID: AdminRoute[] = Object.keys(ROUTE_META_REGISTRY) as AdminRoute[];

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

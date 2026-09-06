import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import type { AdminRoute } from '../../router';
import { adminNavigate } from '../../router';
import type { UserAccount } from '../../lib/mockData';
import { hasPermission } from '../../lib/permissions';
import type { PermissionCode } from '../../lib/permissions';

interface NavItemDef {
  key: AdminRoute;
  label: string;
  icon: string;
  requiredPermission?: PermissionCode | PermissionCode[];
}

interface NavDomainDef {
  title: string;
  items: NavItemDef[];
}

const ALL_NAV_DOMAINS: NavDomainDef[] = [
  {
    title: 'ACCUEIL',
    items: [
      { key: 'dashboard', label: 'Tableau de bord', icon: '📈', requiredPermission: 'dashboard.view' },
      { key: 'my-scope', label: 'Mon Périmètre', icon: '📋', requiredPermission: 'myScope.view' },
    ],
  },
  {
    title: 'ÉLECTION',
    items: [
      { key: 'elections', label: 'Élections & Scrutins', icon: '🗳️', requiredPermission: 'election.view' },
      { key: 'election-config', label: 'Configuration Scrutin', icon: '⚙️', requiredPermission: 'election.update' },
    ],
  },
  {
    title: 'REGISTRE ÉLECTORAL',
    items: [
      { key: 'electors', label: 'Électeurs & Fiches', icon: '👤', requiredPermission: 'elector.view' },
      { key: 'assignments', label: 'Affectations Électorales', icon: '🔁', requiredPermission: 'elector.assign' },
    ],
  },
  {
    title: 'CANDIDATURES',
    items: [
      { key: 'candidates', label: 'Candidats & Programmes', icon: '🎖️', requiredPermission: 'candidate.view' },
    ],
  },
  {
    title: 'PARTIS POLITIQUES',
    items: [
      { key: 'parties', label: 'Registre des Partis', icon: '🏛️', requiredPermission: 'party.view' },
    ],
  },
  {
    title: 'MANDATAIRES',
    items: [
      { key: 'mandates', label: 'Accréditations Mandataires', icon: '📜', requiredPermission: 'mandate.view' },
    ],
  },

  {
    title: 'OPÉRATIONS TERRAIN',
    items: [
      { key: 'stations', label: 'Bureaux / Stations', icon: '🏢', requiredPermission: 'station.view' },
      { key: 'devices', label: 'Appareils BIOPAD', icon: '📱', requiredPermission: 'device.view' },
      { key: 'apk-users', label: 'Agents Terrain APK', icon: '👥', requiredPermission: 'device.view' },
      { key: 'command-center', label: 'Centre de Commandement', icon: '🚨', requiredPermission: 'dashboard.view' },
    ],
  },
  {
    title: 'VOTE & PARTICIPATION',
    items: [
      { key: 'participation', label: 'Taux de Participation', icon: '📊', requiredPermission: 'result.view' },
      { key: 'online-z', label: 'Circonspection ONLINE-Z', icon: '🌐', requiredPermission: 'station.view' },
    ],
  },
  {
    title: 'DÉPOUILLEMENT & PV',
    items: [
      { key: 'count', label: 'Comptage & Dépouillement', icon: '🔢', requiredPermission: 'count.view' },
      { key: 'pv', label: 'Procès-Verbaux (PV)', icon: '📄', requiredPermission: 'pv.view' },
    ],
  },
  {
    title: 'RÉSULTATS ÉLECTORAUX',
    items: [
      { key: 'results', label: 'Résultats & Publication', icon: '🏆', requiredPermission: 'result.view' },
    ],
  },
  {
    title: 'INCIDENTS',
    items: [
      { key: 'incidents', label: 'Incidents & Alertes', icon: '⚠️', requiredPermission: 'incident.view' },
    ],
  },
  {
    title: 'AUDIT & SÉCURITÉ',
    items: [
      { key: 'audit', label: 'Piste d\'Audit SHA-256', icon: '🛡️', requiredPermission: 'audit.view' },
      { key: 'releases', label: 'Versions Binaires APK', icon: '📦', requiredPermission: 'device.view' },
    ],
  },
  {
    title: 'ADMINISTRATION & RBAC',
    items: [
      { key: 'users', label: 'Utilisateurs & Comptes', icon: '🔑', requiredPermission: 'user.view' },
      { key: 'roles', label: 'Rôles & Permissions', icon: '🛡️', requiredPermission: 'user.permissions.manage' },
      { key: 'permissions-manage', label: 'Matrice de Permissions', icon: '⚙️', requiredPermission: 'user.permissions.manage' },
      { key: 'settings', label: 'Configuration Système', icon: '🔧', requiredPermission: 'dashboard.view' },
    ],
  },
];

interface SidebarProps {
  route: AdminRoute;
  user: UserAccount;
  onLogout?: () => void;
}

/**
 * Sidebar de l'admin CEP V3 — Générée dynamiquement selon les permissions & scope de l'utilisateur.
 */
export function Sidebar({ route, user, onLogout }: SidebarProps): JSX.Element {
  const { t } = useI18n();

  // Filter menu items by user permissions
  const visibleDomains = ALL_NAV_DOMAINS.map((domain) => {
    const items = domain.items.filter((item) =>
      hasPermission(user.permissions, item.requiredPermission)
    );
    return { title: domain.title, items };
  }).filter((domain) => domain.items.length > 0);

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 255,
        background: 'var(--cep-color-deep-blue)',
        color: 'white',
        padding: 'var(--cep-space-4) var(--cep-space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '0 var(--cep-space-2)' }}>
        <strong style={{ fontSize: '1.2rem', display: 'block', color: '#ffffff' }}>
          🇭🇹 CEP Admin V3
        </strong>
        <span style={{ fontSize: '0.73rem', color: 'var(--cep-color-light-blue)', opacity: 0.9, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.roleTitle || user.fullName}
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {visibleDomains.map((group) => (
          <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#8ab4f8',
                letterSpacing: '0.05em',
                padding: '0 var(--cep-space-2)',
                marginBottom: 2,
              }}
            >
              {group.title}
            </span>
            {group.items.map((item) => {
              const isActive = route === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => adminNavigate(item.key)}
                  style={{
                    textAlign: 'left',
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'var(--cep-color-cep-blue)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--cep-color-light-blue)',
                    padding: '6px 10px',
                    borderRadius: 'var(--cep-radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 'auto',
            background: 'rgba(197, 34, 31, 0.2)',
            color: '#ff8a80',
            border: '1px solid rgba(197, 34, 31, 0.4)',
            padding: '8px 12px',
            borderRadius: 'var(--cep-radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🚪 Se Déconnecter
        </button>
      )}
    </aside>
  );
}

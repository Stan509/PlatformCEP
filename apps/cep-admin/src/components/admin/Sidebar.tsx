import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import type { AdminRoute } from '../../router';
import { adminNavigate } from '../../router';

const NAV: { key: AdminRoute; labelKey: string; labelOverride?: string }[] = [
  { key: 'dashboard', labelKey: 'admin.nav.dashboard' },
  { key: 'command-center', labelKey: 'admin.nav.commandCenter' },
  { key: 'elections', labelKey: 'admin.nav.elections' },
  { key: 'candidates', labelKey: 'admin.nav.candidates' },
  { key: 'parties', labelKey: 'admin.nav.parties' },
  { key: 'mandataire', labelKey: 'admin.nav.parties', labelOverride: '📋 Portail Mandataire V2' },
  { key: 'apk-users', labelKey: 'admin.nav.apkUsers' },
  { key: 'devices', labelKey: 'admin.nav.devices' },
  { key: 'incidents', labelKey: 'admin.nav.incidents' },
  { key: 'audit', labelKey: 'admin.nav.audit' },
  { key: 'releases', labelKey: 'admin.nav.releases' },
  { key: 'users', labelKey: 'admin.nav.users' },
  { key: 'settings', labelKey: 'admin.nav.settings' },
];


interface SidebarProps {
  route: AdminRoute;
  onLogout?: () => void;
}

/** Sidebar de l'admin — cockpit institutionnel (spec §19). */
export function Sidebar({ route, onLogout }: SidebarProps): JSX.Element {
  const { t } = useI18n();
  return (
    <aside
      style={{
        width: 240,
        background: 'var(--cep-color-deep-blue)',
        color: 'white',
        padding: 'var(--cep-space-5) var(--cep-space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--cep-space-1)',
        flexShrink: 0,
      }}
    >
      <strong style={{ fontSize: '1.25rem', padding: '0 var(--cep-space-3)', marginBottom: 'var(--cep-space-4)' }}>
        CEP Admin
      </strong>
      {NAV.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => adminNavigate(item.key)}
          style={{
            textAlign: 'left',
            border: 'none',
            cursor: 'pointer',
            background: route === item.key ? 'var(--cep-color-cep-blue)' : 'transparent',
            color: route === item.key ? 'white' : 'var(--cep-color-light-blue)',
            padding: 'var(--cep-space-2) var(--cep-space-3)',
            borderRadius: 'var(--cep-radius-md)',
            fontSize: 'var(--cep-font-size-small)',
            font: 'inherit',
          }}
        >
          {item.labelOverride || t(item.labelKey)}
        </button>
      ))}

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 'auto',
            background: '#c5221f',
            color: 'white',
            border: 'none',
            padding: 'var(--cep-space-2) var(--cep-space-3)',
            borderRadius: 'var(--cep-radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          🚪 Se Déconnecter
        </button>
      )}

      <p style={{ marginTop: onLogout ? 'var(--cep-space-2)' : 'auto', color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption)', padding: '0 var(--cep-space-3)' }}>
        {t('admin.settings.separationHint')}
      </p>
    </aside>
  );
}

import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import type { AdminRoute } from '../../router';
import { adminNavigate } from '../../router';

const NAV: { key: AdminRoute; labelKey: string }[] = [
  { key: 'dashboard', labelKey: 'admin.nav.dashboard' },
  { key: 'command-center', labelKey: 'admin.nav.commandCenter' },
  { key: 'elections', labelKey: 'admin.nav.elections' },
  { key: 'candidates', labelKey: 'admin.nav.candidates' },
  { key: 'devices', labelKey: 'admin.nav.devices' },
  { key: 'incidents', labelKey: 'admin.nav.incidents' },
  { key: 'audit', labelKey: 'admin.nav.audit' },
  { key: 'releases', labelKey: 'admin.nav.releases' },
  { key: 'users', labelKey: 'admin.nav.users' },
  { key: 'settings', labelKey: 'admin.nav.settings' },
];

/** Sidebar de l'admin — cockpit institutionnel (spec §19). */
export function Sidebar({ route }: { route: AdminRoute }): JSX.Element {
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
          {t(item.labelKey)}
        </button>
      ))}
      <p style={{ marginTop: 'auto', color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption)', padding: '0 var(--cep-space-3)' }}>
        {t('admin.settings.separationHint')}
      </p>
    </aside>
  );
}

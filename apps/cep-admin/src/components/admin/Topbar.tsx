import { useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher, StatusIndicator } from '@cep/design-system';
import type { AdminRoute } from '../../router';
import { adminApi } from '../../lib/api';

const ROUTE_LABEL: Record<AdminRoute, string> = {
  dashboard: 'admin.nav.dashboard',
  'command-center': 'admin.nav.commandCenter',
  elections: 'admin.nav.elections',
  candidates: 'admin.nav.candidates',
  devices: 'admin.nav.devices',
  incidents: 'admin.nav.incidents',
  audit: 'admin.nav.audit',
  releases: 'admin.nav.releases',
  users: 'admin.nav.users',
  settings: 'admin.nav.settings',
};

/** Topbar admin — élection active, état système, session RBAC active, langue. */
export function Topbar({ route }: { route: AdminRoute }): JSX.Element {
  const { t } = useI18n();
  const [activeUser] = useState(() => adminApi.getActiveUser());

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--cep-space-5)',
        padding: 'var(--cep-space-3) var(--cep-space-5)',
        background: 'var(--cep-color-white)',
        borderBottom: '1px solid var(--cep-color-border)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--cep-space-4)', alignItems: 'center' }}>
        <strong style={{ fontSize: 'var(--cep-font-size-body-lg)' }}>{t(ROUTE_LABEL[route])}</strong>
        <StatusIndicator tone="success" label={t('admin.topbar.systemStatus')} />
      </div>
      <div style={{ display: 'flex', gap: 'var(--cep-space-3)', alignItems: 'center' }}>
        <div
          style={{
            background: 'var(--cep-color-deep-blue)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 'var(--cep-radius-md)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>👤 {activeUser.fullName}</span>
          <span style={{ opacity: 0.7 }}>({activeUser.role})</span>
        </div>
        <span style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
          Générales Haïti 2026
        </span>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

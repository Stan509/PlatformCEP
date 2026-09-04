import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';

export type SyncState = 'online' | 'offline' | 'syncing' | 'synced' | 'pending' | 'error' | 'revoked' | 'session_expired';

export interface SyncIndicatorProps {
  state: SyncState;
  /** Libellé personnalisé ; sinon résolution via `design_system.sync.*`. */
  label?: string;
}

const STATE_META: Record<SyncState, { className: string; key: string }> = {
  online: { className: 'cep-sync--ok', key: 'design_system.sync.online' },
  offline: { className: '', key: 'design_system.sync.offline' },
  syncing: { className: 'cep-sync--syncing', key: 'design_system.sync.syncing' },
  synced: { className: 'cep-sync--ok', key: 'design_system.sync.synced' },
  pending: { className: 'cep-sync--pending', key: 'design_system.sync.pending' },
  error: { className: 'cep-sync--error', key: 'design_system.sync.error' },
  revoked: { className: 'cep-sync--revoked', key: 'design_system.sync.revoked' },
  session_expired: { className: 'cep-sync--revoked', key: 'design_system.sync.sessionExpired' },
};

/**
 * Indicateur de synchronisation CEP — toujours visible sur les APK (spec §28).
 * Couleur + texte = information accessible sans recours à la seule couleur.
 */
export function SyncIndicator({ state, label }: SyncIndicatorProps): JSX.Element {
  const { t } = useI18n();
  const meta = STATE_META[state];
  return (
    <span className={`cep-sync ${meta.className}`}>
      <span className="cep-sync__pulse" aria-hidden="true" />
      {label ?? t(meta.key)}
    </span>
  );
}

export const SYNC_STATES: ReadonlyArray<SyncState> = [
  'online',
  'offline',
  'syncing',
  'synced',
  'pending',
  'error',
  'revoked',
  'session_expired',
];

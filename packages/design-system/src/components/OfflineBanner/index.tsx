import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';

export type OfflineState = 'offline' | 'online' | 'syncing' | 'error';

export interface OfflineBannerProps {
  state: OfflineState;
  /** Libellé personnalisé ; sinon résolution via i18n. */
  label?: string;
  /** Détail optionnel (ex. nombre d'éléments en attente). */
  detail?: string;
}

/**
 * Bandeau permanent d'état réseau CEP (spec §28 / §56). L'utilisateur
 * opérationnel comprend l'état sans jargon technique. Le texte est externalisé.
 */
export function OfflineBanner({ state, label, detail }: OfflineBannerProps): JSX.Element {
  const { t } = useI18n();
  const map: Record<OfflineState, string> = {
    offline: t('common.offlineBanner'),
    online: t('common.onlineBanner'),
    syncing: t('design_system.sync.syncing'),
    error: t('design_system.sync.error'),
  };
  const heading = label ?? map[state];
  return (
    <div className={`cep-offline-banner cep-offline-banner--${state}`} role="status">
      <span aria-hidden="true">{state === 'syncing' ? '⟳' : state === 'error' ? '!' : state === 'online' ? '●' : '○'}</span>
      <div>
        <strong>{heading}</strong>
        {detail && <span className="cep-sr-only">{detail}</span>}
      </div>
    </div>
  );
}

export const OFFLINE_STATES: ReadonlyArray<OfflineState> = ['offline', 'online', 'syncing', 'error'];

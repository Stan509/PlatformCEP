import type { JSX } from 'react';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusIndicatorProps {
  tone: StatusTone;
  /** Libellé (généralement résolu via i18n par l'appelant). */
  label: string;
  showDot?: boolean;
}

/**
 * Indicateur d'état CEP (spec §40). La couleur n'est JAMAIS le seul canal
 * d'information : un libellé texte accompagne le point coloré (accessibilité).
 */
export function StatusIndicator({ tone, label, showDot = true }: StatusIndicatorProps): JSX.Element {
  return (
    <span className={`cep-status cep-status--${tone}`}>
      {showDot && <span className="cep-status__dot" aria-hidden="true" />}
      {label}
    </span>
  );
}

export const STATUS_TONES: ReadonlyArray<StatusTone> = ['info', 'success', 'warning', 'danger', 'neutral'];

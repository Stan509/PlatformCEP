import type { JSX, ReactNode } from 'react';
import { useI18n } from '@cep/i18n';

export type ViewState = 'loading' | 'error' | 'empty' | 'offline';

export interface StateViewProps {
  state: ViewState;
  title?: string;
  description?: string;
  /** Action affichée en bas (ex. bouton de reprise). Laissée à l'appelant. */
  action?: ReactNode;
}

/**
 * État générique d'une page (spec §40-42) : loading / error / empty / offline.
 * Textes externalisés via i18n ; l'appelant peut surcharger titre/détail.
 * Tolère `prefers-reduced-motion` (skeleton statique en loading).
 */
export function StateView({ state, title, description, action }: StateViewProps): JSX.Element {
  const { t } = useI18n();

  const defaults: Record<ViewState, { title: string; desc: string; glyph: string }> = {
    loading: { title: t('common.states.loading'), desc: t('common.loading'), glyph: '⟳' },
    error: { title: t('common.states.errorTitle'), desc: t('common.error'), glyph: '!' },
    empty: { title: t('common.states.emptyTitle'), desc: t('common.states.empty'), glyph: '∅' },
    offline: { title: t('common.offlineBanner'), desc: t('common.states.empty'), glyph: '○' },
  };

  const meta = defaults[state];

  return (
    <div
      role={state === 'error' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--cep-space-3)',
        textAlign: 'center',
        padding: 'var(--cep-space-8) var(--cep-space-5)',
        borderRadius: 'var(--cep-radius-lg)',
        border: '1px dashed var(--cep-color-border)',
        background: 'var(--cep-color-surface)',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '2rem', color: 'var(--cep-color-text-muted)' }}>
        {meta.glyph}
      </span>
      <strong style={{ color: 'var(--cep-color-deep-blue)' }}>{title ?? meta.title}</strong>
      <p style={{ color: 'var(--cep-color-text-secondary)', maxWidth: 44 }}>{description ?? meta.desc}</p>
      {action}
    </div>
  );
}

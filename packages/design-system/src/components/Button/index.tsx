import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';
import { useI18n } from '@cep/i18n';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'xl';
type ButtonState = 'default' | 'loading' | 'disabled';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  state?: ButtonState;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
}

/**
 * Bouton CEP — une seule action principale par écran (principe opérationnel).
 * États inspectés automatiquement : `loading`, `disabled`, focus, hover, active.
 * Le text de chargement est externalisé (i18n) : jamais codé en dur.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  isLoading = false,
  loadingText,
  state = 'default',
  startIcon,
  endIcon,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps): JSX.Element {
  const { t } = useI18n();
  const resolvedState: ButtonState =
    state === 'loading' || isLoading ? 'loading' : state === 'disabled' ? 'disabled' : 'default';
  const isDisabled = resolvedState === 'disabled' || resolvedState === 'loading' || disabled;

  const classes = [
    'cep-btn',
    `cep-btn--${variant}`,
    size !== 'md' ? `cep-btn--${size}` : '',
    block ? 'cep-btn--block' : '',
    resolvedState === 'loading' ? 'cep-btn--loading' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className={classes}
      disabled={isDisabled}
      aria-busy={resolvedState === 'loading' || undefined}
    >
      {resolvedState === 'loading' ? (
        <>
          <span className="cep-spinner" aria-hidden="true" />
          {loadingText ?? t('common.loading')}
        </>
      ) : (
        <>
          {startIcon && <span aria-hidden="true">{startIcon}</span>}
          {children}
          {endIcon && <span aria-hidden="true">{endIcon}</span>}
        </>
      )}
    </button>
  );
}

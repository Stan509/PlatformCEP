import type { InputHTMLAttributes, JSX } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Placeholder d'exemple (spec §45) — à externaliser par l'utilisateur. */
  examplePlaceholder?: string;
  loading?: boolean;
}

/**
 * Champ de saisie CEP — label + exemple + validation + erreur + aide
 * contextuelle + état disabled (spec §45). Le label et l'erreur sont
 * connectés à l'input pour l'accessibilité (aria / htmlFor).
 */
export function Input({
  label,
  hint,
  error,
  examplePlaceholder,
  loading = false,
  disabled,
  id,
  className,
  ...rest
}: InputProps): JSX.Element {
  const inputId = id ?? `${rest.name ?? 'field'}-${label ?? ''}`.replace(/\s+/g, '-').toLowerCase();
  const hasError = Boolean(error);

  const classes = ['cep-input', hasError ? 'cep-input--error' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cep-field">
      {label && (
        <label className="cep-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        {...rest}
        id={inputId}
        className={classes}
        disabled={disabled || loading}
        aria-invalid={hasError || undefined}
        aria-describedby={hint || error ? `${inputId}-help` : undefined}
        placeholder={examplePlaceholder}
      />
      {error && (
        <span id={`${inputId}-help`} className="cep-error-text" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-help`} className="cep-hint">
          {hint}
        </span>
      )}
    </div>
  );
}

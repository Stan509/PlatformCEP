import type { HTMLAttributes, JSX, ReactNode } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  interactive?: boolean;
}

/**
 * Carte CEP — surface institutionnelle neutre avec titre/body/footer.
 * Les cartes de candidats et d'élections sont STRICTEMENT identiques
 * (même dimension, même hiérarchie, même espace, même présentation).
 */
export function Card({ title, body, footer, interactive = false, className, children, ...rest }: CardProps): JSX.Element {
  const classes = ['cep-card', interactive ? 'cep-card--interactive' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <div {...rest} className={classes}>
      {title && <div className="cep-card__title">{title}</div>}
      {body && <div className="cep-card__body">{body}</div>}
      {children}
      {footer && <div className="cep-card__footer">{footer}</div>}
    </div>
  );
}

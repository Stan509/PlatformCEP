import type { JSX, ReactNode } from 'react';
import { useEffect } from 'react';
import { useI18n } from '@cep/i18n';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
}

/**
 * Modal CEP — accessible (focus, Escape, aria-modal), overlay et scrim.
 * Utilisée pour les confirmations critiques et les détails; jamais pour le vote.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnOverlay = true,
}: ModalProps): JSX.Element | null {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="cep-modal__overlay"
      role="presentation"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div className="cep-modal" role="dialog" aria-modal="true" aria-label={title ? 'Modal' : undefined} onClick={(e) => e.stopPropagation()}>
        {title !== undefined && (
          <div className="cep-modal__header">
            <h2 className="cep-modal__title">{title}</h2>
            <button className="cep-modal__close" aria-label={t('common.actions.close')} onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="cep-modal__body">{children}</div>
        {footer && <div className="cep-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

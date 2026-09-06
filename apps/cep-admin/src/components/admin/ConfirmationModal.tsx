import { useState } from 'react';
import type { JSX } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  actionName: string;
  targetResource: string;
  consequenceSummary: string;
  scopeSummary?: string;
  confirmButtonText?: string;
  tone?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  actionName,
  targetResource,
  consequenceSummary,
  scopeSummary,
  confirmButtonText = 'Confirmer l\'action',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationModalProps): JSX.Element | null {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const buttonColor = tone === 'danger' ? '#c5221f' : tone === 'warning' ? '#b06000' : '#003893';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          maxWidth: 520,
          width: '100%',
          padding: '1.5rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.8rem' }}>{tone === 'danger' ? '🚨' : tone === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <div>
            <h3 style={{ margin: 0, color: buttonColor, fontSize: '1.2rem' }}>{title}</h3>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Confirmation d'Opération Sensible CEP</span>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 8, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div><strong>Action :</strong> {actionName}</div>
          <div><strong>Ressource Ciblée :</strong> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{targetResource}</code></div>
          {scopeSummary && <div><strong>Scope Territorial :</strong> {scopeSummary}</div>}
          <div style={{ color: buttonColor, fontWeight: 600, marginTop: 4 }}>
            <strong>Conséquence :</strong> {consequenceSummary}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', background: '#fff8f6', padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid #fce8e6' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span style={{ fontWeight: 600, color: '#3c4043' }}>
            Je confirme avoir vérifié le périmètre légal et la validité de cette décision.
          </span>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#f1f3f4',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!checked}
            onClick={() => {
              if (checked) {
                onConfirm();
                setChecked(false);
              }
            }}
            style={{
              background: checked ? buttonColor : '#cccccc',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: 6,
              fontWeight: 700,
              cursor: checked ? 'pointer' : 'not-allowed',
              fontSize: '0.85rem',
            }}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

import type { JSX } from 'react';
import type { PermissionCode } from '../lib/permissions';
import { PERMISSION_REGISTRY } from '../lib/permissions';
import { adminNavigate } from '../router';

interface AccessDeniedProps {
  requiredPermission?: PermissionCode | PermissionCode[];
  currentUserRole?: string;
  onSwitchPersona?: () => void;
}

export function AccessDenied({ requiredPermission, currentUserRole, onSwitchPersona }: AccessDeniedProps): JSX.Element {
  const perms = Array.isArray(requiredPermission) ? requiredPermission : requiredPermission ? [requiredPermission] : [];
  const definitions = PERMISSION_REGISTRY.filter((p) => perms.includes(p.code));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          border: '2px solid #ea4335',
          padding: '2.5rem',
          maxWidth: 580,
          width: '100%',
          boxShadow: '0 8px 24px rgba(234, 67, 53, 0.12)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⛔</div>
        <h1 style={{ margin: 0, color: '#c5221f', fontSize: '1.6rem', fontWeight: 800 }}>
          403 — Accès Non Autorisé
        </h1>
        <p style={{ margin: '0.8rem 0 1.5rem', color: '#5f6368', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Vous ne disposez pas des privilèges nécessaires pour accéder à cette fonctionnalité avec votre profil actuel ({currentUserRole || 'Session Restreinte'}).
        </p>

        {definitions.length > 0 && (
          <div
            style={{
              background: '#fce8e6',
              borderRadius: 8,
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #c5221f',
            }}
          >
            <strong style={{ fontSize: '0.85rem', color: '#c5221f', display: 'block', marginBottom: 6 }}>
              🔑 Permission(s) requise(s) :
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#3c4043' }}>
              {definitions.map((d) => (
                <li key={d.code} style={{ marginBottom: 4 }}>
                  <code style={{ background: '#ffffff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, color: '#c5221f' }}>
                    {d.code}
                  </code>{' '}
                  — {d.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => adminNavigate('my-scope')}
            style={{
              background: '#003893',
              color: 'white',
              border: 'none',
              padding: '0.7rem 1.4rem',
              borderRadius: 6,
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            📋 Consulter Mon Périmètre
          </button>
          <button
            type="button"
            onClick={() => adminNavigate('dashboard')}
            style={{
              background: '#f1f3f4',
              color: '#3c4043',
              border: 'none',
              padding: '0.7rem 1.4rem',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            🏠 Retour au Tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}

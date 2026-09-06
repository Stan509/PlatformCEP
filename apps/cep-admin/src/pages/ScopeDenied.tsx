import type { JSX } from 'react';
import type { UserScope } from '../lib/scopes';
import { adminNavigate } from '../router';

interface ScopeDeniedProps {
  userScope?: UserScope;
  targetDepartment?: string;
  targetCommune?: string;
  targetElection?: string;
}

export function ScopeDenied({ userScope, targetDepartment, targetCommune, targetElection }: ScopeDeniedProps): JSX.Element {
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
          border: '2px solid #f9ab00',
          padding: '2.5rem',
          maxWidth: 580,
          width: '100%',
          boxShadow: '0 8px 24px rgba(249, 171, 0, 0.15)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗺️</div>
        <h1 style={{ margin: 0, color: '#b06000', fontSize: '1.6rem', fontWeight: 800 }}>
          Périmètre Non Autorisé (Scope Restricted)
        </h1>
        <p style={{ margin: '0.8rem 0 1.5rem', color: '#5f6368', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Vous possédez la permission nécessaire, mais la ressource ciblée se situe en dehors de votre périmètre territorial ou électoral autorisé.
        </p>

        <div
          style={{
            background: '#fef7e0',
            borderRadius: 8,
            padding: '1rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #f9ab00',
            fontSize: '0.85rem',
          }}
        >
          <strong style={{ color: '#b06000', display: 'block', marginBottom: 6 }}>📍 Détails de la restriction :</strong>
          {targetDepartment && (
            <div>
              Département ciblé : <strong>{targetDepartment}</strong> (Autorisé :{' '}
              {userScope?.departments?.join(', ') || 'Aucun'})
            </div>
          )}
          {targetCommune && (
            <div>
              Commune ciblée : <strong>{targetCommune}</strong> (Autorisé :{' '}
              {userScope?.communes?.join(', ') || 'Toutes'})
            </div>
          )}
          {targetElection && (
            <div>
              Scrutin ciblé : <strong>{targetElection}</strong> (Autorisé :{' '}
              {userScope?.elections?.join(', ') || 'Aucun'})
            </div>
          )}
        </div>

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
            📋 Vérifier Mon Périmètre Autorisé
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

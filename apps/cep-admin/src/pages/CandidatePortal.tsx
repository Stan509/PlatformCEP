import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';

interface CandidatePortalProps {
  user: UserAccount;
  onLogout: () => void;
}

export function CandidatePortal({ user, onLogout }: CandidatePortalProps): JSX.Element {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar */}
      <header
        style={{
          background: 'var(--cep-color-deep-blue, #002d62)',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👁️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Espace Candidat Observateur — Suivi Officiel en Direct</h1>
            <span style={{ fontSize: '0.85rem', color: '#a2c4ec' }}>
              Candidat Authentifié : {user.fullName} | Accès Observateur Certifié
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: '#c5221f',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.9rem',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Candidate Identity Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            border: '2px solid var(--cep-color-cep-blue)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
            alt="Candidat"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #002d62' }}
          />
          <div>
            <span style={{ background: '#002d62', color: 'white', fontWeight: 800, padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
              BULLETIN #14
            </span>
            <h2 style={{ margin: '4px 0 0', color: 'var(--cep-color-deep-blue)', fontSize: '1.5rem' }}>
              {user.fullName}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'gray' }}>
              Poste : <strong>Président de la République</strong> | Parti : <strong>Pitit Desalin</strong> | Territoire : <strong>National (Haïti)</strong>
            </p>
            <span style={{ display: 'inline-block', marginTop: 6, background: '#e6f4ea', color: '#137333', fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem' }}>
              ✓ Dossier de Candidature Approuvé et Publié au Journal Officiel
            </span>
          </div>
        </div>

        {/* Live Vote Metrics for this Candidate */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Total Suffrages Exprimés (En Direct)</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>1 420 500 voix</strong>
            <span style={{ fontSize: '0.82rem', color: '#137333', fontWeight: 600 }}>● 34.2 % des voix comptabilisées</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Bureaux Reçus à la Tabulation</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>11 450 / 13 850</strong>
            <span style={{ fontSize: '0.82rem', color: '#0d6efd', fontWeight: 600 }}>Taux de couverture: 82.6 %</span>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase', fontWeight: 700 }}>Mandataires Déployés sur le Terrain</span>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--cep-color-deep-blue)', marginTop: 4 }}>1 420 mandataires</strong>
            <span style={{ fontSize: '0.82rem', color: '#137333', fontWeight: 600 }}>10 Départements couverts</span>
          </div>
        </div>

        {/* Mandataires Feed for Candidate */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #ccc' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
            📡 Remontées Directes de Vos Mandataires de Terrain
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
              <strong style={{ color: 'var(--cep-color-deep-blue)' }}>Mandataire Pierre-Richard Alexis (Port-au-Prince - BV-PAP-012)</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#444' }}>
                "Ouverture régulière à 06h00. Décompte contradictoire parallèle achevé : 184 voix obtenues sur 420 exprimés dans ce bureau."
              </p>
              <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block', marginTop: 4 }}>Transmis il y a 25 min</span>
            </div>

            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
              <strong style={{ color: 'var(--cep-color-deep-blue)' }}>Mandataire Jean-Marc Delva (Cap-Haïtien - BV-CAP-004)</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#444' }}>
                "Présence effective des observateurs. Dépouillement régulier et procès-verbal signé sans incident."
              </p>
              <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block', marginTop: 4 }}>Transmis il y a 1 h</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

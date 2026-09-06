import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';
import { PERMISSION_REGISTRY } from '../lib/permissions';

interface MyScopeProps {
  user: UserAccount;
}

export function MyScope({ user }: MyScopeProps): JSX.Element {
  const isSuperadmin = user.permissions?.includes('system.superadmin');
  const userPerms = user.permissions || [];

  const grantedDefinitions = PERMISSION_REGISTRY.filter(
    (p) => isSuperadmin || userPerms.includes(p.code)
  );

  // Group by domain
  const domains: Record<string, typeof grantedDefinitions> = {};
  grantedDefinitions.forEach((d) => {
    if (!domains[d.domain]) domains[d.domain] = [];
    domains[d.domain]!.push(d);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Top Banner */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #d0e0f8', boxShadow: '0 2px 8px rgba(0, 56, 147, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003893', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🇭🇹 POSTE DE TRAVAIL ADMINISTRATIF CEP
            </span>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', color: '#002d62' }}>
              Mon Périmètre & Habilitations Opérationnelles
            </h1>
            <p style={{ margin: '4px 0 0', color: '#555', fontSize: '0.9rem' }}>
              Synthese individuelle des autorisations dynamiques (RBAC + Scope) attribuees par le Conseil Electoral Provisoire.
            </p>
          </div>

          <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '0.8rem 1.2rem', borderRadius: 8, textAlign: 'right' }}>
            <strong style={{ display: 'block', color: '#003893', fontSize: '1.05rem' }}>{user.fullName}</strong>
            <span style={{ fontSize: '0.82rem', color: '#333', fontWeight: 600 }}>{user.roleTitle}</span>
            <div style={{ marginTop: 4, fontSize: '0.75rem', color: '#666' }}>Identifiant session : <code>{user.username}</code></div>
          </div>
        </div>
      </div>

      {/* Scope Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {/* Card 1: Périmètre Territorial */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🗺️</div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#002d62' }}>Périmètre Territorial Autorisé</h3>
          <p style={{ margin: '4px 0 12px', fontSize: '0.82rem', color: '#666' }}>Départements et communes sous votre responsabilité.</p>
          <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <strong>Départements :</strong>{' '}
              {user.scope?.departments?.includes('ALL') ? (
                <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem' }}>NATIONAL (10 Départements d'Haïti)</span>
              ) : (
                <span style={{ fontWeight: 700, color: '#003893' }}>{user.scope?.departments?.join(', ') || user.department || 'National'}</span>
              )}
            </div>
            <div>
              <strong>Communes :</strong>{' '}
              {user.scope?.communes?.includes('ALL') ? (
                <span style={{ color: '#555' }}>Toutes les communes du département</span>
              ) : (
                <span style={{ fontWeight: 700, color: '#003893' }}>{user.scope?.communes?.join(', ') || 'Globalité du territoire attribué'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Scrutins Autorises */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🗳️</div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#002d62' }}>Scrutins Électoraux Attribués</h3>
          <p style={{ margin: '4px 0 12px', fontSize: '0.82rem', color: '#666' }}>Élections sur lesquelles vos actions sont effectives.</p>
          <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <strong>Élections Actives :</strong>{' '}
              <span style={{ background: '#eef4ff', color: '#003893', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem' }}>
                Élections Générales d'Haïti 2026 (e1)
              </span>
            </div>
            <div>
              <strong>Portée :</strong> Présidentielle, Législatives, Municipales & Locales
            </div>
          </div>
        </div>

        {/* Card 3: Rôle & Audit */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🛡️</div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#002d62' }}>Sécurité & Traçabilité Audit</h3>
          <p style={{ margin: '4px 0 12px', fontSize: '0.82rem', color: '#666' }}>Toutes vos actions sont enregistrées dans la piste d'audit.</p>
          <div style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.4 }}>
            <div><strong>Niveau Rôle :</strong> {user.role}</div>
            <div><strong>Journalisation :</strong> SHA-256 Immuable</div>
            <div style={{ marginTop: 4, color: '#137333', fontWeight: 600 }}>✅ Session mTLS Authentifiée</div>
          </div>
        </div>
      </div>

      {/* Permissions Breakdown by Domain */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', color: '#002d62', display: 'flex', alignItems: 'center', gap: 8 }}>
          🔑 Permissions Granulaires Accordées ({grantedDefinitions.length} autorisations)
        </h2>

        {isSuperadmin ? (
          <div style={{ background: '#e6f4ea', borderLeft: '4px solid #137333', padding: '1rem', borderRadius: 8, fontSize: '0.9rem', color: '#137333' }}>
            👑 <strong>Superadministration Système Active (system.superadmin)</strong> : Vous possédez l'accès souverain total à l'ensemble des fonctionnalités et territoires du CEP.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {Object.entries(domains).map(([domainName, permsList]) => (
              <div key={domainName} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#f8f9fa' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003893', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {domainName}
                </span>
                <ul style={{ margin: '8px 0 0', paddingLeft: '1.2rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {permsList.map((p) => (
                    <li key={p.code}>
                      <strong style={{ color: '#202124' }}>{p.label}</strong>{' '}
                      <code style={{ fontSize: '0.75rem', background: '#ffffff', padding: '1px 5px', borderRadius: 4, color: '#5f6368' }}>
                        {p.code}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Institutional Privacy & Isolation Note */}
      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', borderRadius: 8, padding: '1rem 1.2rem', fontSize: '0.85rem', color: '#002d62', lineHeight: 1.5 }}>
        🔒 <strong>Principe de Séparation Stricte :</strong> Dans le respect de la Constitution Haïtienne et des règles d'architecture du CEP, le vote secret est préservé. Aucune permission administrative ne permet de relier l'identité d'un électeur à son choix de vote.
      </div>
    </div>
  );
}

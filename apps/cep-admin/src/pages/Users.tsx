import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import type { AdminUser } from '../lib/mockData';

export function Users(): JSX.Element {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<AdminUser>(() => adminApi.getActiveUser());

  useEffect(() => {
    adminApi.users().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleSwitchUser = (u: AdminUser) => {
    setActiveUser(u);
    adminApi.setActiveUser(u);
    window.location.reload();
  };

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          Gestion des Utilisateurs & Rôles Institutionnels (RBAC)
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Contrôle d'accès strict (Role-Based Access Control) et authentification mTLS/YubiKey des autorités du CEP.
        </p>
      </div>

      {/* Active User Card Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--cep-color-deep-blue) 0%, #0d3b66 100%)',
          color: 'white',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--cep-radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(0, 56, 147, 0.15)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
            Session Actuelle du Cockpit CEP
          </span>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{activeUser.fullName}</h2>
          <span style={{ fontSize: '0.9rem', color: '#a2c4ec' }}>{activeUser.roleTitle}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span
            style={{
              background: activeUser.mTLSVerified ? '#137333' : '#c5221f',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 20,
            }}
          >
            {activeUser.mTLSVerified ? '🔒 Certificat mTLS Vérifié' : '⚠️ Non Certifié'}
          </span>
        </div>
      </div>

      {/* Role Matrix Explanation */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--cep-radius-lg)',
          border: '1px solid var(--cep-color-border)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Matrice des Privilèges et Autorisations CEP
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
            <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block', marginBottom: 4 }}>
              👑 Président & Conseillers CEP (ADMIN_CEP)
            </strong>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--cep-color-text-muted)' }}>
              Accès total. Validation finale des résultats, modification des règles électorales, signature des décrets et double approbation.
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
            <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block', marginBottom: 4 }}>
              🏢 Directeurs BED (Département) (BED_SUPERVISOR)
            </strong>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--cep-color-text-muted)' }}>
              Supervision du département assigné. Validation des PV des bureaux du département et gestion des appareils locaux.
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
            <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block', marginBottom: 4 }}>
              🏛️ Superviseurs BEC (Commune) (BEC_SUPERVISOR)
            </strong>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--cep-color-text-muted)' }}>
              Supervision des centres de vote de la commune. Déploiement des tablettes biopads et signalement d'incidents.
            </p>
          </div>

          <div style={{ border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8, background: '#f8f9fa' }}>
            <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block', marginBottom: 4 }}>
              👁️ Auditeurs Indépendants (AUDITOR)
            </strong>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--cep-color-text-muted)' }}>
              Lecture seule absolue. Inspection des journaux d'audit cryptographiques, vérification des hashs SHA-256 et des PV.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table List */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--cep-radius-lg)',
          border: '1px solid var(--cep-color-border)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Utilisateurs et Autorités Enregistrées
        </h3>

        {loading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Nom & Prénom</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Identifiant / Rôle</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Portée Géographique</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Authentification mTLS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action (Simuler profil)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = activeUser.id === u.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee', background: isCurrent ? '#f0f7ff' : 'transparent' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--cep-color-deep-blue)' }}>
                        {u.fullName} {isCurrent && <span style={{ color: 'var(--cep-color-cep-blue)', fontSize: '0.75rem' }}>(Actif)</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div>{u.roleTitle}</div>
                        <code style={{ fontSize: '0.75rem', color: 'gray' }}>{u.username}</code>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {u.department ? `${u.department} ${u.commune ? `(${u.commune})` : ''}` : 'National (Toute Haïti)'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: u.mTLSVerified ? '#e6f4ea' : '#fce8e6',
                            color: u.mTLSVerified ? '#137333' : '#c5221f',
                          }}
                        >
                          {u.mTLSVerified ? 'Certifié mTLS' : 'Non certifié'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleSwitchUser(u)}
                          style={{
                            background: isCurrent ? '#ccc' : 'var(--cep-color-cep-blue)',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: 4,
                            cursor: isCurrent ? 'default' : 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {isCurrent ? 'Profil actif' : 'Endosser ce rôle'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

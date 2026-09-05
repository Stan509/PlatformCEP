import { useState } from 'react';
import type { JSX } from 'react';
import { adminApi } from '../lib/api';
import { USER_ACCOUNTS } from '../lib/mockData';
import type { UserAccount } from '../lib/mockData';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminApi.login(username, password);
      if (res.success && res.user) {
        if (res.user.role === 'APK_AGENT') {
          setError('🛑 Accès Refusé : Les identifiants d\'agent APK sont réservés exclusivement aux applications mobiles Android (Biopads). Connexion au Dashboard web non autorisée.');
          adminApi.logout();
        } else {
          onLoginSuccess(res.user);
        }
      } else {
        setError(res.message || 'Identifiants invalides.');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setLoading(true);
    setError(null);
    const res = await adminApi.login(acc.username, acc.password);
    if (res.success && res.user) {
      if (res.user.role === 'APK_AGENT') {
        setError('🛑 Accès Refusé : Les identifiants d\'agent APK sont réservés exclusivement aux applications mobiles Android (Biopads). Connexion au Dashboard web non autorisée.');
        adminApi.logout();
      } else {
        onLoginSuccess(res.user);
      }
    } else {
      setError('Échec de la connexion démo.');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #061e3d 0%, #0a386b 50%, #001f3f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: 520,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Insignia Banner */}
        <div
          style={{
            background: 'var(--cep-color-deep-blue, #002d62)',
            color: 'white',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'white',
              color: '#002d62',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            🇭🇹
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            CONSEIL ÉLECTORAL PROVISOIRE
          </h1>
          <span style={{ fontSize: '0.85rem', color: '#a2c4ec', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Portail Unifié de Connexion Sécurisée
          </span>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                background: '#fce8e6',
                border: '1px solid #c5221f',
                color: '#c5221f',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#002d62' }}>
                Identifiant unique / Nom d'utilisateur
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: m.mathurin.cep ou cand.moise.14"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1.5px solid #ccc',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#002d62' }}>
                Mot de passe sécurisé
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1.5px solid #ccc',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                background: '#003893',
                color: 'white',
                border: 'none',
                padding: '0.85rem',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 4px 10px rgba(0, 56, 147, 0.3)',
              }}
            >
              {loading ? 'Authentification en cours...' : 'Se Connecter'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'gray', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ⚡ Connexion Rapide Démo (Tester un Rôle en 1 Clic)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {USER_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 6,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <strong style={{ color: '#002d62', display: 'block' }}>{acc.fullName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'gray' }}>{acc.roleTitle}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e0e8f5', color: '#003893', padding: '2px 6px', borderRadius: 4 }}>
                    Connecter
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

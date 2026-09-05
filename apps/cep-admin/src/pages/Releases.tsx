import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminRelease } from '../lib/mockData';
import { adminApi } from '../lib/api';

export function Releases(): JSX.Element {
  const { t } = useI18n();
  const state = useAsync(() => adminApi.releases(), []);

  const tone: Record<AdminRelease['status'], 'success' | 'info' | 'danger'> = {
    SIGNED: 'info',
    PUBLISHED: 'success',
    REVOKED: 'danger',
  };

  const columns: TableColumn<AdminRelease>[] = [
    { key: 'version', header: t('admin.releases.version'), accessor: (r: AdminRelease) => <strong>{r.version}</strong> },
    { key: 'build', header: t('admin.releases.build'), accessor: (r: AdminRelease) => r.build },
    { key: 'hash', header: t('admin.releases.hash'), accessor: (r: AdminRelease) => <code style={{ fontSize: '0.8rem' }}>{r.hash}</code> },
    { key: 'signature', header: t('admin.releases.signature'), accessor: (r: AdminRelease) => r.signature },
    { key: 'status', header: t('admin.releases.status'), accessor: (r: AdminRelease) => <StatusIndicator tone={tone[r.status]} label={r.status} /> },
    {
      key: 'actions',
      header: t('admin.devices.actions'),
      accessor: (r: AdminRelease) => (
        <a
          href="/admin/apk/cep-field-agent-v1.4.2.apk"
          download
          style={{ textDecoration: 'none' }}
        >
          <Button size="sm" variant="secondary">
            Télécharger package ({r.version})
          </Button>
        </a>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          {t('admin.releases.title')}
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Téléchargez directement les fichiers installables Android (APK) certifiés et cryptographiquement signés par le CEP.
        </p>
      </div>

      {/* APK Downloads Featured Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {/* APK 1: Field App */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--cep-radius-lg)',
            border: '2px solid var(--cep-color-cep-blue)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0, 56, 147, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--cep-color-deep-blue)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              📱
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cep-color-deep-blue)' }}>
                APK Application de Terrain
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#137333', fontWeight: 600 }}>
                ● Version v1.4.2 — Certifiée ED25519
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--cep-color-text-muted)', lineHeight: 1.5 }}>
            Application mobile destinée aux agents de recensement et d'inscription électorale sur le terrain (biométrie Dermalog, mode hors-ligne).
          </p>

          <div style={{ fontSize: '0.8rem', background: '#f8f9fa', padding: '0.6rem 0.8rem', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div><strong>Nom de fichier:</strong> cep-field-agent-v1.4.2.apk</div>
            <div><strong>Taille:</strong> ~42.8 Mo</div>
            <div><strong>Hash SHA-256:</strong> <code>a3f2901b8e44...9c10447a</code></div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
            <a
              href="/admin/apk/cep-field-agent-v1.4.2.apk"
              download="cep-field-agent-v1.4.2.apk"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⬇️ Télécharger APK Terrain (.apk)
              </Button>
            </a>
          </div>
        </div>

        {/* APK 2: Polling App */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--cep-radius-lg)',
            border: '2px solid #0d6efd',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(13, 110, 253, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#0d6efd',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              🗳️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cep-color-deep-blue)' }}>
                APK Bureau de Vote
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#137333', fontWeight: 600 }}>
                ● Version v1.4.2 — Certifiée ED25519
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--cep-color-text-muted)', lineHeight: 1.5 }}>
            Application tablette pour le contrôle d'accès au bureau de vote, émargement électronique sécurisé et génération des procès-verbaux (PV).
          </p>

          <div style={{ fontSize: '0.8rem', background: '#f8f9fa', padding: '0.6rem 0.8rem', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div><strong>Nom de fichier:</strong> cep-polling-station-v1.4.2.apk</div>
            <div><strong>Taille:</strong> ~38.4 Mo</div>
            <div><strong>Hash SHA-256:</strong> <code>9b1f77e41c30...7d2089ef</code></div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
            <a
              href="/admin/apk/cep-polling-station-v1.4.2.apk"
              download="cep-polling-station-v1.4.2.apk"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
                ⬇️ Télécharger APK Bureau de Vote (.apk)
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Release Audit History */}
      <Card
        title="Historique des Releases Certifiées"
        body={
          state.state === 'loading' ? (
            <StateView state="loading" />
          ) : state.state === 'empty' ? (
            <StateView state="empty" />
          ) : state.state === 'error' ? (
            <StateView state="error" />
          ) : (
            <Table columns={columns} data={state.data} keyField={(r: AdminRelease) => r.id} />
          )
        }
      />
    </div>
  );
}

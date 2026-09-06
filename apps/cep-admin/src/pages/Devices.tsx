import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Button, StatusIndicator } from '@cep/design-system';
import type { AdminDevice } from '../lib/mockData';
import { adminApi } from '../lib/api';

export function Devices(): JSX.Element {
  const { t } = useI18n();
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.devices();
      setDevices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AdminDevice['status'], compromised = false, reason?: string) => {
    const updated = await adminApi.updateDeviceStatus(id, newStatus, compromised, reason);
    setDevices(updated);
  };

  const compromisedDevice = devices.find((d) => d.compromised);

  const tone: Record<AdminDevice['status'], 'success' | 'danger' | 'warning'> = {
    ACTIVE: 'success',
    REVOKED: 'danger',
    SUSPENDED: 'warning',
  };

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          📱 Gestion & Télémétrie de Sécurité des Appareils BIOPAD
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Surveillance en temps réel des 7 420 Biopads et tablettes d'émargement : Localisation, enclaves matérielles TPM 2.0 et détection d'intrusions.
        </p>
      </div>

      {/* Device vs Station Clarification Note */}
      <div style={{ background: '#eef4ff', border: '1px solid #b8d1f9', padding: '0.9rem', borderRadius: 8, fontSize: '0.85rem', color: '#002d62' }}>
        ℹ️ <strong>Règle d'Intégrité : DEVICE ≠ POLLING STATION.</strong> Un bureau de vote peut comporter plusieurs appareils BIOPAD en parallèle. La suspension ou révocation mTLS d'un appareil ne supprime ni n'altère la station électorale de rattachement.
      </div>

      {/* Red Alert Banner if a device is compromised */}
      {compromisedDevice && (
        <div
          style={{
            background: '#fce8e6',
            border: '2px solid #c5221f',
            borderRadius: 'var(--cep-radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#c5221f',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              🚨
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#c5221f', fontSize: '1.15rem' }}>
                ALERTE SÉCURITÉ CRITIQUE : Appareil Compromis ({compromisedDevice.deviceId})
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5f2120' }}>
                <strong>Motif :</strong> {compromisedDevice.compromiseReason} ({compromisedDevice.department}, Commune de {compromisedDevice.commune}, Code BV: {compromisedDevice.pollingStationCode})
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange(compromisedDevice.id, 'REVOKED', true, compromisedDevice.compromiseReason)}
            >
              🔒 Révocation Certificat Immédiate
            </Button>
          </div>
        </div>
      )}

      {/* Devices List Table */}
      <div style={{ background: 'white', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Registre des Appareils Biométriques Déployés
        </h3>

        {loading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ID Appareil</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Localisation & Bureau</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Chiffrement & TPM</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Utilisateur Assigné</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Intégrité / Statut</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions de Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      background: d.compromised ? '#fff8f7' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <strong style={{ color: 'var(--cep-color-deep-blue)', display: 'block' }}>{d.deviceId}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'gray' }}>Version {d.version}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div>{d.department} — {d.commune}</div>
                      <code style={{ fontSize: '0.75rem', color: '#0d6efd' }}>{d.pollingStationCode}</code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: d.encryption.includes('TPM 2.0') ? '#137333' : '#b06000' }}>
                        {d.encryption}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'gray' }}>Cert: {d.certExpiry}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <code>{d.assignedUser}</code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {d.compromised ? (
                        <span style={{ background: '#fce8e6', color: '#c5221f', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                          🚨 COMPROMIS ({d.tamperCount} altérations)
                        </span>
                      ) : (
                        <StatusIndicator tone={tone[d.status]} label={d.status} />
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {d.status === 'ACTIVE' ? (
                          <Button size="sm" variant="secondary" onClick={() => handleStatusChange(d.id, 'SUSPENDED')}>
                            Suspendre
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => handleStatusChange(d.id, 'ACTIVE')}>
                            Réactiver
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(d.id, 'REVOKED', true, 'Révoqué manuellement par sécurité')}
                        >
                          Révoquer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

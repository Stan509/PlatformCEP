import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount } from '../lib/mockData';

interface OnlineZPageProps {
  user: UserAccount;
}

export function OnlineZPage({ user }: OnlineZPageProps): JSX.Element {
  const [enabled, setEnabled] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      {/* Top Banner */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9c27b0', textTransform: 'uppercase' }}>
              🌐 UNITÉ ÉLECTORALE VIRTUELLE SOUVERAINE
            </span>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', color: '#002d62' }}>
              Circonspection Virtuelle ONLINE-Z — Vote Électronique Diaspora & PWA
            </h1>
            <p style={{ margin: '4px 0 0', color: '#555', fontSize: '0.9rem' }}>
              Gestion centralisée du vote en ligne sécurisé, enclave cryptographique mTLS et intégration de la Diaspora Haïtienne.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fa', padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #ccc' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Statut Scrutin ONLINE-Z :</span>
            <span style={{ padding: '2px 10px', borderRadius: 12, fontWeight: 800, fontSize: '0.8rem', background: enabled ? '#e6f4ea' : '#fce8e6', color: enabled ? '#137333' : '#c5221f' }}>
              {enabled ? '✅ AUTORISÉ & ACTIF' : '⛔ DÉSACTIVÉ PAR LE CEP'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs / Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
        {/* Panel 1: Configuration Enclave */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: '#002d62', fontSize: '1.1rem' }}>🔒 Configuration Enclave Cryptographique</h3>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6, color: '#444' }}>
            <div>Serveur Souverain : <strong>Cloud Sovereign Enclave CEP (AWS GovCloud)</strong></div>
            <div>Chiffrement : <strong>AES-256-GCM + ECDSA P-256 (Hardware TPM 2.0)</strong></div>
            <div>Contrôle d'accès : <strong>Biométrie Dermalog Faciale Caméra PWA</strong></div>
            <div>Certificat mTLS : <strong>Valide (Expire le 2026-12-31)</strong></div>
          </div>
        </div>

        {/* Panel 2: Participation ONLINE-Z */}
        <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: '#002d62', fontSize: '1.1rem' }}>📊 Métriques & Électeurs ONLINE-Z</h3>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6, color: '#444' }}>
            <div>Électeurs Inscrits Diaspora : <strong>197 817 Inscrits</strong></div>
            <div>Participations Effectuées : <strong style={{ color: '#137333' }}>156 945 Votants (79.3%)</strong></div>
            <div>Consulats Actifs : <strong>Miami, New York, Montréal, Paris, Santo Domingo</strong></div>
            <div>Incidents Détectés : <strong style={{ color: '#137333' }}>0 Tentative de replay</strong></div>
          </div>
        </div>
      </div>

      {/* Mandataires Online Panel */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#002d62' }}>📋 Mandataires Accrédités pour la Surveillance ONLINE-Z</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 1rem' }}>Mandataire</th>
              <th style={{ padding: '0.6rem 1rem' }}>Entité Représentée</th>
              <th style={{ padding: '0.6rem 1rem' }}>Périmètre Surveillance</th>
              <th style={{ padding: '0.6rem 1rem' }}>Statut Accréditation</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>Claudette Saint-Germain</td>
              <td style={{ padding: '0.6rem 1rem' }}>RDNP (Parti Politique)</td>
              <td style={{ padding: '0.6rem 1rem' }}>ONLINE-Z Virtual Console</td>
              <td style={{ padding: '0.6rem 1rem', color: '#137333', fontWeight: 700 }}>ACCRÉDITÉ (BOTH)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>Pierre-Marc Delva</td>
              <td style={{ padding: '0.6rem 1rem' }}>Pitit Desalin #14</td>
              <td style={{ padding: '0.6rem 1rem' }}>Consulat Miami / Web Stream</td>
              <td style={{ padding: '0.6rem 1rem', color: '#137333', fontWeight: 700 }}>ACCRÉDITÉ (ONLINE)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

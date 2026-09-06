import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { Card, StateView, StatusIndicator, Table, useAsync } from '@cep/design-system';
import type { TableColumn } from '@cep/design-system';
import type { AdminElection, UserAccount } from '../lib/mockData';
import { demoDataProvider } from '../lib/dataProvider';
import { hasPermission } from '../lib/permissions';
import { adminNavigate } from '../router';

const DEPT_STATS = [
  { dept: 'Ouest (Port-au-Prince, Delmas, Carrefour...)', electors: '2 140 500', stations: 4850, sync: '99.6 %' },
  { dept: 'Artibonite (Gonaïves, Saint-Marc...)', electors: '980 200', stations: 2310, sync: '99.1 %' },
  { dept: 'Nord (Cap-Haïtien, Limonade...)', electors: '740 100', stations: 1820, sync: '99.8 %' },
  { dept: 'Sud (Les Cayes, Aquin...)', electors: '480 300', stations: 1140, sync: '99.0 %' },
  { dept: 'Centre (Hinche, Mirebalais...)', electors: '410 000', stations: 980, sync: '98.9 %' },
  { dept: 'Nord-Ouest (Port-de-Paix...)', electors: '390 400', stations: 920, sync: '99.2 %' },
  { dept: 'Sud-Est (Jacmel...)', electors: '360 200', stations: 840, sync: '99.5 %' },
  { dept: 'Grand\'Anse (Jérémie...)', electors: '190 800', stations: 460, sync: '98.5 %' },
  { dept: 'Nord-Est (Fort-Liberté, Ouanaminthe)', electors: '185 000', stations: 440, sync: '99.7 %' },
  { dept: 'Nippes (Miragoâne...)', electors: '164 690', stations: 390, sync: '99.4 %' },
];

interface DashboardProps {
  user: UserAccount;
}

export function Dashboard({ user }: DashboardProps): JSX.Element {
  const { t } = useI18n();
  const elections = useAsync(() => demoDataProvider.getElections(), []);

  const perms = user.permissions || [];
  const isSuperadmin = perms.includes('system.superadmin');

  // Role persona checks matching official CEP institutional mapping
  const isPresident = isSuperadmin || user.username === 'president.cep' || user.username === 'm.mathurin.cep' || user.roleTitle.includes('Président');
  const isDirectorExec = user.username === 'directeur.exec' || user.roleTitle.includes('Directeur Exécutif');
  const isOpsManager = user.username === 'ops.cep' || user.username === 'ops.mgr.nord' || user.roleTitle.includes('Opérations');
  const isLegalManager = user.username === 'legal.cep' || user.roleTitle.includes('Contentieux') || user.roleTitle.includes('Juridique');
  const isITManager = user.username === 'it.cep' || user.username === 'sec.mgr.nat' || user.roleTitle.includes('Registre & Sécurité') || user.roleTitle.includes('Informatique');
  const isBedSupervisor = user.username === 'bed.ouest' || user.username === 'bed.nord' || user.username.includes('bed') || user.roleTitle.includes('BED');
  const isSupervisorCommunal = user.username === 'sup.terrain' || user.username === 'bec.sup.pap' || user.roleTitle.includes('BEC') || user.roleTitle.includes('Liaison');

  const canCandidate = isSuperadmin || hasPermission(perms, 'candidate.view');
  const canOps = isSuperadmin || hasPermission(perms, ['station.view', 'device.view']);
  const canResults = isSuperadmin || hasPermission(perms, ['pv.view', 'result.view', 'count.view']);
  const canRegistry = isSuperadmin || hasPermission(perms, 'elector.view');
  const canSecurity = isSuperadmin || hasPermission(perms, ['audit.view', 'user.view']);

  const columns: TableColumn<AdminElection>[] = [
    { key: 'name', header: t('admin.elections.name'), accessor: (r) => <strong>{r.name}</strong> },
    { key: 'type', header: t('admin.elections.type'), accessor: (r) => r.type },
    { key: 'date', header: t('admin.elections.date'), accessor: (r) => r.date },
    { key: 'status', header: t('admin.elections.status'), accessor: (r) => <StatusIndicator tone="info" label={t(`admin.elections.${r.status}`)} /> },
    { key: 'candidates', header: t('admin.elections.candidates'), accessor: (r) => String(r.candidates) },
    { key: 'stations', header: t('admin.elections.stations'), accessor: (r) => String(r.stations) },
    { key: 'lastModified', header: t('admin.elections.lastModified'), accessor: (r) => r.lastModified },
  ];

  const userDept = user.department || user.scope?.departments?.filter((d) => d !== 'ALL')[0] || 'National';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-5)' }}>
      {/* --------------------------------------------------------------------- */}
      {/* PERSONA DASHBOARD HEADER BANNER                                       */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003893', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🇭🇹 {isPresident ? 'ESPACE PRÉSIDENTIEL SOUTENANT LA RÉPUBLIQUE' : isDirectorExec ? 'DIRECTION EXÉCUTIVE ET GÉNÉRALE CEP' : isOpsManager ? 'RESPONSABLE DES OPÉRATIONS ÉLECTORALES' : isLegalManager ? 'RESPONSABLE DU CONTENTIEUX ET JURIDIQUE' : isITManager ? 'RESPONSABLE DU REGISTRE ET INFORMATIQUE' : isBedSupervisor ? `DIRECTION DU BED (${userDept.toUpperCase()})` : isSupervisorCommunal ? 'SUPERVISION COMMUNALE (BEC)' : 'COCKPIT INSTITUTIONNEL CEP'}
            </span>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
              Tableau de bord — {user.fullName}
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
              {user.roleTitle} · Scope : <strong>{user.scope?.departments?.join(', ') || userDept}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isPresident && (
              <button
                type="button"
                onClick={() => adminNavigate('results')}
                style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                📜 Homologuer les Résultats Officiels
              </button>
            )}
            {isDirectorExec && (
              <button
                type="button"
                onClick={() => adminNavigate('elections')}
                style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ⚙️ Déploiement & Budget Scrutins
              </button>
            )}
            {isOpsManager && (
              <button
                type="button"
                onClick={() => adminNavigate('command-center')}
                style={{ background: '#137333', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🚨 Command Center Temps Réel
              </button>
            )}
            {isLegalManager && (
              <button
                type="button"
                onClick={() => adminNavigate('incidents')}
                style={{ background: '#c5221f', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ⚖️ Traiter les Recours & Contentieux
              </button>
            )}
            {isITManager && (
              <button
                type="button"
                onClick={() => adminNavigate('audit')}
                style={{ background: '#9c27b0', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🛡️ Piste d'Audit SHA-256 & Registre ONI
              </button>
            )}
            {isBedSupervisor && (
              <button
                type="button"
                onClick={() => adminNavigate('pv')}
                style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                📄 Valider PVs Département {userDept}
              </button>
            )}
            <button
              type="button"
              onClick={() => adminNavigate('my-scope')}
              style={{ background: '#eef4ff', color: '#003893', border: '1px solid #b8d1f9', padding: '0.6rem 1.2rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              📋 Mon Périmètre
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 1: PRÉSIDENT DU CEP                                            */}
      {/* --------------------------------------------------------------------- */}
      {isPresident && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#f4f8ff', padding: '1.2rem', borderRadius: 10, border: '1px solid #b8d1f9' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#003893', fontSize: '1.1rem' }}>🏛️ Espace Souverain du Président du CEP</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#333' }}>
              Supervision directe de l'institution électorale haïtienne. Promulgation des actes officiels, contrôle du calendrier constitutionnel et signature des arrêtés d'homologation.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #003893' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>ÉLECTEURS NATIONAUX</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#002d62', margin: '8px 0 4px' }}>5 842 190</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>10 Départements Inscrits</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>BUREAUX DE VOTE</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>13 850 BV</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>100% Validés</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #1a73e8' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>TAUX DE PARTICIPATION</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1a73e8', margin: '8px 0 4px' }}>68.4 %</strong>
              <span style={{ fontSize: '0.78rem', color: '#555' }}>Émargements enregistrés</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #9c27b0' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>CANDIDATS CERTIFIÉS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#9c27b0', margin: '8px 0 4px' }}>184</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Décret d'homologation actif</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 2: DIRECTEUR EXÉCUTIF                                         */}
      {/* --------------------------------------------------------------------- */}
      {isDirectorExec && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#f8f9fa', padding: '1.2rem', borderRadius: 10, border: '1px solid #dadce0' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#202124', fontSize: '1.1rem' }}>⚙️ Direction Exécutive — Logistique & Administration Générale</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#5f6368' }}>
              Supervision de la coordination administrative, du budget électoral, du matériel sensible et du déploiement des directions techniques.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #003893' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>DIRECTIONS TECHNIQUES</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#003893', margin: '8px 0 4px' }}>8 / 8 Actives</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>100% Opérationnelles</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>EXÉCUTION BUDGÉTAIRE</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>94.2 %</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Conforme au décret</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #1a73e8' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>EFFECTIFS DE TERRAIN</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1a73e8', margin: '8px 0 4px' }}>42 500 Agents</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Deployés dans les 145 communes</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 3: RESPONSABLE DES OPÉRATIONS                                 */}
      {/* --------------------------------------------------------------------- */}
      {isOpsManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#e6f4ea', padding: '1.2rem', borderRadius: 10, border: '1px solid #ceead6' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#137333', fontSize: '1.1rem' }}>📱 Pilotage Opérationnel & Flotte BIOPAD</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#202124' }}>
              Supervision en direct des terminaux biométriques, des stations physiques fixes/nomades et des alertes de géofencing.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>FLOTTE BIOPAD ACTIFS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>12 450 Appareils</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>99.4% Connectés VSAT</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #003893' }}>

              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>STATIONS NOMADES</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#003893', margin: '8px 0 4px' }}>1 000 Unités</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Geofence GPS Validé</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #b06000' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>INCIDENTS TECHNIQUES</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#b06000', margin: '8px 0 4px' }}>3 Ouverts</strong>
              <span style={{ fontSize: '0.78rem', color: '#b06000', fontWeight: 700 }}>1 Alerte d'altération</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #c5221f' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>APPAREILS RÉVOQUÉS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#c5221f', margin: '8px 0 4px' }}>40 BIOPAD</strong>
              <span style={{ fontSize: '0.78rem', color: '#c5221f', fontWeight: 700 }}>Secured mTLS Revoked</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 4: RESPONSABLE CONTENTIEUX & JURIDIQUE                        */}
      {/* --------------------------------------------------------------------- */}
      {isLegalManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#fce8e6', padding: '1.2rem', borderRadius: 10, border: '1px solid #fad2cf' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#c5221f', fontSize: '1.1rem' }}>⚖️ Contentieux Électoral & Affaires Juridiques</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#333' }}>
              Traitement des recours constitutionnels, examen des contestations de candidatures et arbitrage des PVs litigieux.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #c5221f' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>RECOURS EN EXAMEN</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#c5221f', margin: '8px 0 4px' }}>14 Dossiers</strong>
              <span style={{ fontSize: '0.78rem', color: '#c5221f', fontWeight: 700 }}>Audiences au CEP</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #b06000' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>PV LITIGIEUX CONTESTÉS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#b06000', margin: '8px 0 4px' }}>112 PV</strong>
              <span style={{ fontSize: '0.78rem', color: '#b06000', fontWeight: 700 }}>Bureau du Contentieux</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>DÉCISIONS RENDUES</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>42 Arrêtés</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Actes Juridiques Publiés</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 5: RESPONSABLE REGISTRE & INFORMATIQUE                         */}
      {/* --------------------------------------------------------------------- */}
      {isITManager && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#f3e8fd', padding: '1.2rem', borderRadius: 10, border: '1px solid #e9d5ff' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#9c27b0', fontSize: '1.1rem' }}>🛡️ Registre Électoral ONI & Intégrité Cryptographique</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#333' }}>
              Surveillance continue du fichier électoral Dermalog®, vérification du découplage anonyme et audit de la chaîne SHA-256.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #9c27b0' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>FICHIER ÉLECTORAL ONI</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#9c27b0', margin: '8px 0 4px' }}>5 842 190</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>100% Hash d'Identité Validé</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>CHAÎNE AUDIT SHA-256</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>100 % INTACTE</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Tamper-Evident Chain OK</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #1a73e8' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>VOTE SECRET</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1a73e8', margin: '8px 0 4px' }}>0 FUITE</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Découplage FK Électeur/Bulletin</span>
            </div>
          </div>
        </div>
      )}


      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 6: DIRECTEUR BED (DÉPARTEMENTAL)                             */}
      {/* --------------------------------------------------------------------- */}
      {isBedSupervisor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#fef7e0', padding: '1.2rem', borderRadius: 10, border: '1px solid #fce8e6' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#b06000', fontSize: '1.1rem' }}>🏛️ Bureau Électoral Départemental (BED {userDept})</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#333' }}>
              Supervision de la juridiction départementale de <strong>{userDept}</strong>. Homologation des Procès-Verbaux des BECs rattachés.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #b06000' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>COMMUNES (BEC) SUPERVISÉES</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#b06000', margin: '8px 0 4px' }}>
                {userDept === 'Ouest' ? '20 Communes' : '19 Communes'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>100% Opérationnels</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #1a73e8' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>PV DE DÉPOUILLEMENT ({userDept})</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#1a73e8', margin: '8px 0 4px' }}>
                {userDept === 'Ouest' ? '4 710 / 4 850' : '1 810 / 1 820'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>99.2% Reçus</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #c5221f' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>PV LITIGIEUX EN REVUE</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#c5221f', margin: '8px 0 4px' }}>
                {userDept === 'Ouest' ? '12 PV' : '3 PV'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#c5221f', fontWeight: 700 }}>En examen au BED</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* PERSONA 7: SUPERVISEUR COMMUNAL (BEC / TERRAIN)                        */}
      {/* --------------------------------------------------------------------- */}
      {isSupervisorCommunal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: '#eef4ff', padding: '1.2rem', borderRadius: 10, border: '1px solid #b8d1f9' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#003893', fontSize: '1.1rem' }}>🏢 Supervision Communale BEC & Agents de Liaison</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#333' }}>
              Contrôle physique des bureaux de vote de la commune ({user.commune || 'Port-au-Prince'}), assistance aux membres de bureau et signalement des incidents.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--cep-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #003893' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>BUREAUX DE VOTE SUPERVISÉS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#003893', margin: '8px 0 4px' }}>342 BV</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Tous Ouverts</span>
            </div>
            <div style={{ background: 'white', padding: '1.2rem', borderRadius: 10, border: '1px solid #e0e0e0', borderTop: '4px solid #137333' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#555' }}>AGENTS DE LIAISON ACTIFS</span>
              <strong style={{ display: 'block', fontSize: '1.8rem', color: '#137333', margin: '8px 0 4px' }}>48 Agents</strong>
              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 700 }}>Application Terrain Active</span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DEPARTMENTAL COVERAGE TABLE                                           */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--cep-color-deep-blue)', fontSize: '1.15rem' }}>
          Couverture des 10 Départements d'Haïti (Périmètre : {user.scope?.departments?.join(', ') || userDept})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Département</th>
                <th style={{ padding: '0.75rem 1rem' }}>Électeurs Inscrits</th>
                <th style={{ padding: '0.75rem 1rem' }}>Bureaux de Vote (BV)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Taux de Synchronisation</th>
              </tr>
            </thead>
            <tbody>
              {DEPT_STATS.filter((d) => {
                if (!user.scope?.departments || user.scope.departments.includes('ALL')) return true;
                return user.scope.departments.some((userDeptName) => d.dept.toLowerCase().includes(userDeptName.toLowerCase()));
              }).map((d, i) => (
                <tr key={d.dept} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--cep-color-deep-blue)' }}>{d.dept}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.electors}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{d.stations.toLocaleString()} BV</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#137333', fontWeight: 600 }}>{d.sync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* ACTIVE ELECTIONS TABLE                                                */}
      {/* --------------------------------------------------------------------- */}
      <Card
        title={t('admin.elections.title')}
        body={
          elections.state === 'loading' ? (
            <StateView state="loading" />
          ) : elections.state === 'empty' ? (
            <StateView state="empty" />
          ) : elections.state === 'error' ? (
            <StateView state="error" />
          ) : (
            <Table columns={columns} data={elections.data} keyField={(r) => r.id} />
          )
        }
      />
    </div>
  );
}

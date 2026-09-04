/**
 * Données ADMIN fictives — totalement de démonstration.
 * ⚠️ Aucune donnée citoyenne réelle. En production : API Django (RBAC).
 */

export interface AdminElection {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string; // clé i18n `admin.elections.statusX`
  candidates: number;
  stations: number;
  lastModified: string;
}

export interface AdminDevice {
  id: string;
  deviceId: string;
  version: string;
  assignedUser: string;
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  lastSeen: string;
  lastSync: string;
}

export interface AdminIncident {
  id: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  reportedAt: string;
}

export interface AdminAuditEvent {
  id: string;
  actor: string;
  action: string;
  object: string;
  outcome: string;
  correlationId: string;
  occurredAt: string;
}

export interface AdminRelease {
  id: string;
  version: string;
  build: string;
  hash: string;
  signature: string;
  status: 'SIGNED' | 'PUBLISHED' | 'REVOKED';
}

export const ADMIN_KPIS = [
  { key: 'electors', value: '1 250 000' },
  { key: 'candidates', value: '184' },
  { key: 'stations', value: '4 982' },
  { key: 'agents', value: '7 120' },
  { key: 'devices', value: '3 120' },
  { key: 'sync', value: '98,2 %' },
  { key: 'incidents', value: '7' },
  { key: 'security', value: '0' },
] as const;

export const ADMIN_ELECTIONS: AdminElection[] = [
  { id: 'e1', name: 'Élection Démo 2026', type: 'demo_2026', date: '2026-09-02', status: 'statusOpen', candidates: 184, stations: 4982, lastModified: '2026-09-02T08:00' },
  { id: 'e2', name: 'Élection locale (archivée)', type: 'local', date: '2024-01-15', status: 'statusFinal', candidates: 96, stations: 1240, lastModified: '2024-01-20T18:00' },
];

export const ADMIN_DEVICES: AdminDevice[] = [
  { id: 'd1', deviceId: 'DEV-001', version: '1.4.2', assignedUser: 'test.field.agent', status: 'ACTIVE', lastSeen: 'à l\'instant', lastSync: 'il y a 2 min' },
  { id: 'd2', deviceId: 'DEV-002', version: '1.4.2', assignedUser: 'test.polling.agent', status: 'ACTIVE', lastSeen: 'il y a 12 min', lastSync: 'il y a 5 min' },
  { id: 'd3', deviceId: 'DEV-003', version: '1.3.0', assignedUser: '—', status: 'REVOKED', lastSeen: 'il y a 3 j', lastSync: '—' },
  { id: 'd4', deviceId: 'DEV-004', version: '1.4.2', assignedUser: 'test.field.agent', status: 'SUSPENDED', lastSeen: 'il y a 1 h', lastSync: 'il y a 6 h' },
];

export const ADMIN_INCIDENTS: AdminIncident[] = [
  { id: 'i1', category: 'network', severity: 'HIGH', status: 'OPEN', reportedBy: 'test.field.agent', reportedAt: '2026-09-02T09:14' },
  { id: 'i2', category: 'device', severity: 'MEDIUM', status: 'OPEN', reportedBy: 'test.polling.agent', reportedAt: '2026-09-02T08:55' },
  { id: 'i3', category: 'security', severity: 'CRITICAL', status: 'RESOLVED', reportedBy: 'test.auditor', reportedAt: '2026-09-01T22:00' },
];

export const ADMIN_AUDIT: AdminAuditEvent[] = [
  { id: 'a1', actor: 'test.cep.admin', action: 'election.open', object: 'demo-2026', outcome: 'ok', correlationId: 'tx-0001', occurredAt: '2026-09-02T08:00' },
  { id: 'a2', actor: 'test.cep.admin', action: 'device.revoke', object: 'DEV-003', outcome: 'ok', correlationId: 'tx-0002', occurredAt: '2026-09-01T22:00' },
  { id: 'a3', actor: 'test.dev', action: 'login', object: 'admin', outcome: 'denied', correlationId: 'tx-0003', occurredAt: '2026-09-02T07:59' },
];

export const ADMIN_RELEASES: AdminRelease[] = [
  { id: 'r1', version: '1.4.2', build: '8452', hash: 'a3f2...9c1', signature: 'ed25519:ok', status: 'PUBLISHED' },
  { id: 'r2', version: '1.4.3-rc', build: '8461', hash: '9b1f...7d2', signature: 'ed25519:ok', status: 'SIGNED' },
];

export const COMMAND_STATE = {
  operational: 4934,
  attention: 38,
  incident: 10,
  online: 3120,
  offline: 0,
  pending: 58,
  pvReceived: 4112,
  pvValidated: 3880,
};

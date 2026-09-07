import React, { useEffect, useState } from 'react';

// --- TYPES & INTERFACES ---
export type DevOpsTab =
  | 'overview'
  | 'services'
  | 'security'
  | 'forensics'
  | 'server'
  | 'logs'
  | 'users'
  | 'sessions'
  | 'devices'
  | 'backups'
  | 'environment'
  | 'emergency'
  | 'audit';

export type SystemEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

interface ServerMetrics {
  cpuPercent: number;
  ramPercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  swapUsedMb: number;
  swapTotalMb: number;
  diskPercent: number;
  diskUsedGb: number;
  diskTotalGb: number;
  loadAverage: [number, number, number];
  uptimeSeconds: number;
  activeProcesses: number;
  workersCount: number;
}

interface NetworkMetrics {
  trafficInMbps: number;
  trafficOutMbps: number;
  packetsPerSec: number;
  activeConnections: number;
  refusedConnections: number;
  latencyMs: number;
  rps: number;
}

interface AppMetrics {
  rps: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  err4xx: number;
  err5xx: number;
  exceptionsCount: number;
  activeQueueJobs: number;
}

interface DbMetrics {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  connections: number;
  maxConnections: number;
  queriesPerSec: number;
  slowQueries: number;
  deadlocks: number;
  dbSizeMb: number;
  lastBackupAgeHours: number;
}

interface ServiceNode {
  id: string;
  name: string;
  category: 'CORE' | 'GATEWAY' | 'STORAGE' | 'SECURITY' | 'CLIENT';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  uptime: string;
  version: string;
  latencyMs: number;
  restartCount: number;
  lastIncident?: string;
}

interface IpBlockEntry {
  ip: string;
  attempts: number;
  targetAccount: string;
  endpoint: string;
  firstAttempt: string;
  lastAttempt: string;
  status: 'BLOCKED' | 'THROTTLED' | 'CLEARED';
}

interface DevOpsSession {
  id: string;
  username: string;
  role: string;
  ip: string;
  device: string;
  connectedAt: string;
  lastActive: string;
  mfaVerified: boolean;
}

interface DevOpsAuditRecord {
  id: string;
  user: string;
  role: string;
  ip: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}

export function KernelMonitor(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<DevOpsTab>('overview');
  const [environment, setEnvironment] = useState<SystemEnvironment>('PRODUCTION');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(3684200);

  // Live Metrics State
  const [server, setServer] = useState<ServerMetrics>({
    cpuPercent: 18.4,
    ramPercent: 41.2,
    ramUsedMb: 1688,
    ramTotalMb: 4096,
    swapUsedMb: 140,
    swapTotalMb: 2048,
    diskPercent: 28.5,
    diskUsedGb: 22.8,
    diskTotalGb: 80.0,
    loadAverage: [0.42, 0.38, 0.35],
    uptimeSeconds: 3684200,
    activeProcesses: 148,
    workersCount: 8,
  });

  const [network, setNetwork] = useState<NetworkMetrics>({
    trafficInMbps: 24.6,
    trafficOutMbps: 68.2,
    packetsPerSec: 4210,
    activeConnections: 1840,
    refusedConnections: 3,
    latencyMs: 14.2,
    rps: 312.4,
  });

  const [appMetrics] = useState<AppMetrics>({
    rps: 312.4,
    p50Ms: 12.4,
    p95Ms: 42.1,
    p99Ms: 88.5,
    err4xx: 14,
    err5xx: 0,
    exceptionsCount: 2,
    activeQueueJobs: 5,
  });

  const [dbMetrics] = useState<DbMetrics>({
    status: 'ONLINE',
    connections: 34,
    maxConnections: 200,
    queriesPerSec: 418,
    slowQueries: 1,
    deadlocks: 0,
    dbSizeMb: 4820,
    lastBackupAgeHours: 2,
  });

  // Services Topology List
  const [services] = useState<ServiceNode[]>([
    { id: 'srv-1', name: 'Nginx Reverse Proxy & WAF', category: 'GATEWAY', status: 'HEALTHY', uptime: '42d 15h', version: '1.25.4-alpine', latencyMs: 2.1, restartCount: 0 },
    { id: 'srv-2', name: 'Django Core REST API (DRF)', category: 'CORE', status: 'HEALTHY', uptime: '14d 08h', version: '5.0.3-py3.12', latencyMs: 18.4, restartCount: 1 },
    { id: 'srv-3', name: 'Go Sync Gateway & mTLS', category: 'GATEWAY', status: 'HEALTHY', uptime: '42d 15h', version: 'v2.1.0-go1.22', latencyMs: 4.8, restartCount: 0 },
    { id: 'srv-4', name: 'PostgreSQL 16 Engine', category: 'STORAGE', status: 'HEALTHY', uptime: '42d 15h', version: '16.2-alpine', latencyMs: 1.2, restartCount: 0 },
    { id: 'srv-5', name: 'Redis Cache & Queue Broker', category: 'STORAGE', status: 'HEALTHY', uptime: '42d 15h', version: '7.2.4-alpine', latencyMs: 0.8, restartCount: 0 },
    { id: 'srv-6', name: 'Rust Crypto HSM Enclave', category: 'SECURITY', status: 'HEALTHY', uptime: '42d 15h', version: 'v1.8.0-rust2021', latencyMs: 0.3, restartCount: 0 },
    { id: 'srv-7', name: 'CEP Public PWA Portal', category: 'CLIENT', status: 'HEALTHY', uptime: '42d 15h', version: 'v3.4.1', latencyMs: 8.5, restartCount: 0 },
    { id: 'srv-8', name: 'Field Biopad Agent API', category: 'CORE', status: 'HEALTHY', uptime: '14d 08h', version: 'v1.4.2-sec', latencyMs: 24.1, restartCount: 0 },
    { id: 'srv-9', name: 'Polling Station Tally API', category: 'CORE', status: 'HEALTHY', uptime: '14d 08h', version: 'v1.4.2-sec', latencyMs: 16.8, restartCount: 0 },
    { id: 'srv-10', name: 'Prometheus & Grafana SOC', category: 'SECURITY', status: 'HEALTHY', uptime: '42d 15h', version: 'v2.50.1', latencyMs: 5.2, restartCount: 0 },
  ]);

  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);

  // Security / IP Block entries
  const [ipBlocks, setIpBlocks] = useState<IpBlockEntry[]>([
    { ip: '190.115.18.42', attempts: 18, targetAccount: 'm.mathurin.cep', endpoint: '/api/v1/auth/login', firstAttempt: '2026-09-06T20:15:00Z', lastAttempt: '2026-09-06T21:42:00Z', status: 'BLOCKED' },
    { ip: '45.142.120.9', attempts: 42, targetAccount: 'devops.admin', endpoint: '/api/kernel/metrics', firstAttempt: '2026-09-06T19:10:00Z', lastAttempt: '2026-09-06T21:30:00Z', status: 'BLOCKED' },
    { ip: '185.220.101.5', attempts: 7, targetAccount: 'jacques.desrosiers', endpoint: '/api/v1/auth/login', firstAttempt: '2026-09-06T21:10:00Z', lastAttempt: '2026-09-06T21:15:00Z', status: 'THROTTLED' },
  ]);

  // Active Sessions
  const [sessions, setSessions] = useState<DevOpsSession[]>([
    { id: 'sess-1', username: 'devops.admin', role: 'SUPERADMIN_DEVOPS', ip: '147.182.161.220', device: 'Chrome 128 / Linux x64', connectedAt: '2026-09-06T21:00:00Z', lastActive: 'À l\'instant', mfaVerified: true },
    { id: 'sess-2', username: 'jacques.desrosiers', role: 'ADMIN_CEP', ip: '190.115.24.12', device: 'Safari 17 / macOS', connectedAt: '2026-09-06T20:30:00Z', lastActive: 'Il y a 4 min', mfaVerified: true },
    { id: 'sess-3', username: 'marie.baptiste', role: 'MEMBER_CEP', ip: '190.115.28.88', device: 'Edge 128 / Windows 11', connectedAt: '2026-09-06T19:45:00Z', lastActive: 'Il y a 12 min', mfaVerified: true },
  ]);

  // Audit Ledger
  const [auditLogs] = useState<DevOpsAuditRecord[]>([
    { id: 'aud-991', user: 'devops.admin', role: 'SUPERADMIN_DEVOPS', ip: '147.182.161.220', action: 'BLOCK_IP', resource: '190.115.18.42', timestamp: '2026-09-06T21:42:05Z', status: 'SUCCESS' },
    { id: 'aud-990', user: 'devops.admin', role: 'SUPERADMIN_DEVOPS', ip: '147.182.161.220', action: 'DEPLOY_BUILD', resource: 'commit:0c23ce9', timestamp: '2026-09-06T21:30:00Z', status: 'SUCCESS' },
    { id: 'aud-989', user: 'm.mathurin.cep', role: 'ADMIN_CEP', ip: '190.115.24.12', action: 'ACCESS_KERNEL_ATTEMPT', resource: '/api/kernel/metrics', timestamp: '2026-09-06T21:28:10Z', status: 'DENIED' },
    { id: 'aud-988', user: 'devops.admin', role: 'SUPERADMIN_DEVOPS', ip: '147.182.161.220', action: 'BACKUP_TRIGGER', resource: 'pg_dump_staging_db', timestamp: '2026-09-06T20:00:00Z', status: 'SUCCESS' },
  ]);

  // Emergency Mode State
  const [emergencyMode, setEmergencyMode] = useState<{ maintenance: boolean; readOnly: boolean; strictRateLimit: boolean; quarantineDevices: boolean }>({
    maintenance: false,
    readOnly: false,
    strictRateLimit: true,
    quarantineDevices: false,
  });

  // Purge Modal State
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purgePassword, setPurgePassword] = useState<string>('');
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  // New CEP Admin Account Form State
  const [newAdmin, setNewAdmin] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'ADMIN_CEP',
    department: 'ALL',
  });
  const [userCreatedMsg, setUserCreatedMsg] = useState<string | null>(null);

  // Live Clock & Telemetry Simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC-5 (Haïti)'));
    };
    updateTime();
    const interval = setInterval(() => {
      updateTime();
      setUptimeSeconds((prev) => prev + 1);

      // Micro fluctuate cpu & ram
      setServer((prev) => ({
        ...prev,
        cpuPercent: Math.min(99, Math.max(5, Number((prev.cpuPercent + (Math.random() * 2 - 1)).toFixed(1)))),
        ramPercent: Math.min(95, Math.max(20, Number((prev.ramPercent + (Math.random() * 0.4 - 0.2)).toFixed(1)))),
      }));

      setNetwork((prev) => ({
        ...prev,
        rps: Math.min(600, Math.max(100, Number((prev.rps + (Math.random() * 10 - 5)).toFixed(1)))),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const handleIpBlockToggle = (ip: string) => {
    setIpBlocks((prev) =>
      prev.map((entry) => (entry.ip === ip ? { ...entry, status: entry.status === 'BLOCKED' ? 'CLEARED' : 'BLOCKED' } : entry))
    );
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.fullName) return;
    setUserCreatedMsg(`✅ Compte CEP "${newAdmin.fullName}" (${newAdmin.username}) créé avec succès sous la matrice RBAC.`);
    setNewAdmin({ fullName: '', username: '', email: '', role: 'ADMIN_CEP', department: 'ALL' });
    setTimeout(() => setUserCreatedMsg(null), 5000);
  };

  const handlePurgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (purgePassword === 'DevOps#2026!PortauPrince' || purgePassword === 'CepPassword2026!') {
      setPurgeStatus('✅ Purge des données de test exécutée avec succès. Journal d\'audit mis à jour.');
      setTimeout(() => {
        setPurgeStatus(null);
        setShowPurgeModal(false);
        setPurgePassword('');
      }, 3000);
    } else {
      setPurgeStatus('❌ Mot de passe administrateur incorrect. Action refusée par le Kernel.');
    }
  };

  return (
    <div
      style={{
        background: '#060b13',
        color: '#d0e2ff',
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        minHeight: '100vh',
        margin: '-24px',
        padding: '20px',
        backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0.5px), radial-gradient(#003893 0.5px, #060b13 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      }}
    >
      {/* HEADER BANNER SOC / NOC */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0b172a 0%, #0d213a 100%)',
          border: '1px solid #00f0ff44',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
          borderRadius: 8,
          padding: '16px 24px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 12px #00ff88',
            }}
          />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px', color: '#00f0ff' }}>
              ⚡ CEP DEVOPS & KERNEL CONTROL CENTER V2
            </div>
            <div style={{ fontSize: '0.78rem', color: '#8aa2c0' }}>
              PROVISIONAL ELECTORAL COUNCIL • INFRASTRUCTURE & SECURITY OPERATIONS (SOC / NOC)
            </div>
          </div>
        </div>

        {/* Environment Badge & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#0a1628', border: '1px solid #1a3050', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem' }}>
            <span style={{ color: '#8aa2c0', marginRight: 6 }}>TIME:</span>
            <strong style={{ color: '#fff' }}>{currentTime || '2026-09-06 UTC-5'}</strong>
          </div>

          <div style={{ background: '#0a1628', border: '1px solid #1a3050', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem' }}>
            <span style={{ color: '#8aa2c0', marginRight: 6 }}>UPTIME:</span>
            <strong style={{ color: '#00ff88' }}>{formatUptime(uptimeSeconds)}</strong>
          </div>

          {/* Environment Selector */}
          <div
            style={{
              display: 'flex',
              background: '#040810',
              border: '1px solid #00f0ff66',
              borderRadius: 6,
              overflow: 'hidden',
              fontSize: '0.78rem',
            }}
          >
            {(['DEVELOPMENT', 'STAGING', 'PRODUCTION'] as SystemEnvironment[]).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                style={{
                  background: environment === env ? (env === 'PRODUCTION' ? '#c5221f' : '#003893') : 'transparent',
                  color: environment === env ? '#fff' : '#7088a8',
                  border: 'none',
                  padding: '6px 12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {env === 'PRODUCTION' ? '⚠ PRODUCTION' : env}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WITH SIDEBAR & CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* DEVOPS SIDE NAVIGATION */}
        <div
          style={{
            background: '#0b172a',
            border: '1px solid #162c4c',
            borderRadius: 8,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#00f0ff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 8 }}>
            ⚡ DEVOPS CONTROL MATRIX
          </div>

          {[
            { id: 'overview', label: '📊 Dashboard Global', badge: 'LIVE' },
            { id: 'services', label: '⚙ Service Health Map', badge: '10/10' },
            { id: 'security', label: '🚨 Security SOC', badge: '3 Blocked' },
            { id: 'forensics', label: '🕵 Crash Forensics', badge: '2 Logs' },
            { id: 'server', label: '🖥 Server & Runtimes', badge: 'Ubuntu' },
            { id: 'logs', label: '📜 Centralized Logs', badge: 'Filter' },
            { id: 'users', label: '👤 CEP Admin Users', badge: 'RBAC' },
            { id: 'sessions', label: '📱 Active Sessions', badge: `${sessions.length}` },
            { id: 'devices', label: '📱 Devices & Biopads', badge: '13.2k' },
            { id: 'backups', label: '💾 Backup Integrity', badge: '2h ago' },
            { id: 'environment', label: '🧪 Demo / Staging Data', badge: 'Purge' },
            { id: 'emergency', label: '⚡ Emergency Shield', badge: 'OK' },
            { id: 'audit', label: '📋 DevOps Audit Trail', badge: 'Ledger' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as DevOpsTab)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: activeTab === item.id ? 'linear-gradient(90deg, #003893 0%, #0a2550 100%)' : 'transparent',
                color: activeTab === item.id ? '#00f0ff' : '#90a8c8',
                border: activeTab === item.id ? '1px solid #00f0ff66' : '1px solid transparent',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: '0.82rem',
                fontWeight: activeTab === item.id ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  background: activeTab === item.id ? '#00f0ff22' : '#142640',
                  color: activeTab === item.id ? '#00f0ff' : '#607898',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid #00f0ff33',
                }}
              >
                {item.badge}
              </span>
            </button>
          ))}
        </div>

        {/* MAIN PANEL CONTENT */}
        <div style={{ background: '#081220', border: '1px solid #142845', borderRadius: 8, padding: 24, minHeight: 650 }}>
          {/* TAB 1: OVERVIEW DASHBOARD GLOBAL */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>📊 OVERVIEW — REAL-TIME TELEMETRY & HARDWARE GAUGES</h2>
                <span style={{ fontSize: '0.75rem', color: '#00ff88', border: '1px solid #00ff8844', padding: '4px 10px', borderRadius: 4 }}>
                  🟢 ALL SYSTEMS OPERATIONAL (0 INCIDENTS CRITIQUES)
                </span>
              </div>

              {/* SERVER & HARDWARE METRICS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {/* CPU */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7894b8', marginBottom: 6 }}>CPU UTILIZATION</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: server.cpuPercent > 80 ? '#ff2a6d' : '#00f0ff' }}>
                    {server.cpuPercent}%
                  </div>
                  <div style={{ height: 6, background: '#12243d', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${server.cpuPercent}%`, height: '100%', background: server.cpuPercent > 80 ? '#ff2a6d' : '#00f0ff' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#557295', marginTop: 8 }}>Load Avg: {server.loadAverage.join(' ')}</div>
                </div>

                {/* RAM */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7894b8', marginBottom: 6 }}>RAM MEMORY (PHYSICAL)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00ff88' }}>{server.ramPercent}%</div>
                  <div style={{ height: 6, background: '#12243d', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${server.ramPercent}%`, height: '100%', background: '#00ff88' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#557295', marginTop: 8 }}>
                    {server.ramUsedMb} MB / {server.ramTotalMb} MB
                  </div>
                </div>

                {/* DISK */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7894b8', marginBottom: 6 }}>STORAGE DISK (NVMe)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffb703' }}>{server.diskPercent}%</div>
                  <div style={{ height: 6, background: '#12243d', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${server.diskPercent}%`, height: '100%', background: '#ffb703' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#557295', marginTop: 8 }}>
                    {server.diskUsedGb} GB / {server.diskTotalGb} GB
                  </div>
                </div>

                {/* NETWORK RPS */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7894b8', marginBottom: 6 }}>TRAFFIC & LATENCY</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f0ff' }}>{network.rps} req/s</div>
                  <div style={{ fontSize: '0.72rem', color: '#00ff88', marginTop: 6 }}>p95 Latency: {appMetrics.p95Ms} ms</div>
                  <div style={{ fontSize: '0.7rem', color: '#557295', marginTop: 4 }}>In: {network.trafficInMbps} Mbps | Out: {network.trafficOutMbps} Mbps</div>
                </div>
              </div>

              {/* APPLICATION & DATABASE DEEP METRICS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Postgres Stats */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                  <h3 style={{ color: '#00f0ff', margin: '0 0 12px 0', fontSize: '0.95rem' }}>🗄 POSTGRESQL 16 DATABASE TELEMETRY</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div>Status: <strong style={{ color: '#00ff88' }}>{dbMetrics.status}</strong></div>
                    <div>Active Connections: <strong style={{ color: '#fff' }}>{dbMetrics.connections} / {dbMetrics.maxConnections}</strong></div>
                    <div>Queries/sec: <strong style={{ color: '#00f0ff' }}>{dbMetrics.queriesPerSec} qps</strong></div>
                    <div>Slow Queries (&gt;150ms): <strong style={{ color: '#ffb703' }}>{dbMetrics.slowQueries}</strong></div>
                    <div>Deadlocks: <strong style={{ color: '#00ff88' }}>{dbMetrics.deadlocks}</strong></div>
                    <div>Database Size: <strong style={{ color: '#fff' }}>{dbMetrics.dbSizeMb} MB</strong></div>
                  </div>
                </div>

                {/* Redis & Docker Stats */}
                <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                  <h3 style={{ color: '#00f0ff', margin: '0 0 12px 0', fontSize: '0.95rem' }}>⚡ REDIS BROKER & DOCKER ENGINE</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div>Redis Cache Hit Ratio: <strong style={{ color: '#00ff88' }}>98.4%</strong></div>
                    <div>Active Queue Jobs: <strong style={{ color: '#00f0ff' }}>{appMetrics.activeQueueJobs} jobs</strong></div>
                    <div>Docker Containers: <strong style={{ color: '#00ff88' }}>4 Running (0 restarted)</strong></div>
                    <div>HTTP 4xx Errors: <strong style={{ color: '#ffb703' }}>{appMetrics.err4xx}</strong></div>
                    <div>HTTP 5xx Errors: <strong style={{ color: '#00ff88' }}>{appMetrics.err5xx}</strong></div>
                    <div>Active Celery Workers: <strong style={{ color: '#fff' }}>{server.workersCount} workers</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE HEALTH MAP (VISUAL NODE TOPOLOGY) */}
          {activeTab === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>⚙ SERVICE HEALTH MAP & NODE TOPOLOGY</h2>
                <span style={{ fontSize: '0.75rem', color: '#8aa2c0' }}>CLIQUEZ SUR UN SERVICE POUR L’INSPECTER</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    style={{
                      background: '#0b192e',
                      border: selectedService?.id === srv.id ? '2px solid #00f0ff' : '1px solid #1c365d',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      boxShadow: selectedService?.id === srv.id ? '0 0 15px rgba(0,240,255,0.3)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: '#00f0ff', background: '#00f0ff11', padding: '2px 6px', borderRadius: 4 }}>
                        {srv.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 800 }}>🟢 {srv.status}</span>
                    </div>

                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem', marginBottom: 6 }}>{srv.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7894b8' }}>Version: {srv.version}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7894b8', marginTop: 4 }}>
                      Uptime: {srv.uptime} | Latency: {srv.latencyMs} ms
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Detail Drawer Modal */}
              {selectedService && (
                <div style={{ background: '#0b192e', border: '1px solid #00f0ff', borderRadius: 8, padding: 20, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, color: '#00f0ff' }}>🔍 INSPECTION COMPOSANT : {selectedService.name}</h3>
                    <button type="button" onClick={() => setSelectedService(null)} style={{ background: 'transparent', color: '#ff2a6d', border: 'none', cursor: 'pointer', fontWeight: 900 }}>
                      ✖ FERMER
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: '0.82rem' }}>
                    <div>Catégorie: <strong>{selectedService.category}</strong></div>
                    <div>Version Deploiement: <strong>{selectedService.version}</strong></div>
                    <div>Latence Moyenne: <strong>{selectedService.latencyMs} ms</strong></div>
                    <div>Redémarrages Intempestifs: <strong>{selectedService.restartCount}</strong></div>
                    <div>Statut de Santé: <strong style={{ color: '#00ff88' }}>{selectedService.status}</strong></div>
                    <div>Dernier Incident: <strong>{selectedService.lastIncident || 'Aucun incident répertorié'}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY OPERATIONS CENTER & BRUTE FORCE BLOCKER */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#ff2a6d', fontSize: '1.2rem' }}>🚨 SECURITY OPERATIONS CENTER (SOC) & BRUTE FORCE PROTECTION</h2>

              <div style={{ background: '#0b192e', border: '1px solid #ff2a6d44', borderRadius: 8, padding: 20 }}>
                <h3 style={{ color: '#ff2a6d', margin: '0 0 12px 0', fontSize: '0.95rem' }}>🛡 REGISTRE DES ADRESSES IP SUSPECTES & BLOCAGE SERVEUR</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1c365d', color: '#7894b8' }}>
                      <th style={{ padding: '8px' }}>IP SOURCE</th>
                      <th style={{ padding: '8px' }}>TENTATIVES</th>
                      <th style={{ padding: '8px' }}>COMPTE CIBLÉ</th>
                      <th style={{ padding: '8px' }}>ENDPOINT CIBLÉ</th>
                      <th style={{ padding: '8px' }}>DERNIÈRE ACTIVITÉ</th>
                      <th style={{ padding: '8px' }}>STATUT SÉCURITÉ</th>
                      <th style={{ padding: '8px' }}>ACTION DEVOPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipBlocks.map((entry) => (
                      <tr key={entry.ip} style={{ borderBottom: '1px solid #12243d' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 800, color: '#00f0ff' }}>{entry.ip}</td>
                        <td style={{ padding: '10px 8px', color: '#ffb703', fontWeight: 800 }}>{entry.attempts}</td>
                        <td style={{ padding: '10px 8px', color: '#fff' }}>{entry.targetAccount}</td>
                        <td style={{ padding: '10px 8px', color: '#7894b8' }}>{entry.endpoint}</td>
                        <td style={{ padding: '10px 8px', color: '#7894b8' }}>{entry.lastAttempt.split('T')[1]?.substring(0, 8) || entry.lastAttempt}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ background: entry.status === 'BLOCKED' ? '#ff2a6d22' : '#ffb70322', color: entry.status === 'BLOCKED' ? '#ff2a6d' : '#ffb703', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                            {entry.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <button
                            type="button"
                            onClick={() => handleIpBlockToggle(entry.ip)}
                            style={{
                              background: entry.status === 'BLOCKED' ? '#00ff8822' : '#ff2a6d22',
                              color: entry.status === 'BLOCKED' ? '#00ff88' : '#ff2a6d',
                              border: '1px solid transparent',
                              padding: '4px 8px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                            }}
                          >
                            {entry.status === 'BLOCKED' ? 'DEBLOCKED IP' : 'BLOCK IP NOW'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CRASH FORENSICS */}
          {activeTab === 'forensics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#ffb703', fontSize: '1.2rem' }}>🕵 CRASH & INCIDENT FORENSICS (STACKTRACES & CHRONOLOGIE)</h2>

              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: '0.85rem', color: '#ffb703', fontWeight: 800, marginBottom: 8 }}>
                  ⚠️ CHRONOLOGIE D'INCIDENT #INC-2026-0906 (LOCK TIMEOUT DB)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
                  <div style={{ padding: '8px 12px', background: '#0a1628', borderRadius: 6, borderLeft: '4px solid #00f0ff' }}>
                    <strong>21:40:00</strong> — CPU Spike à 89% sur le worker Celery (indexation des électeurs)
                  </div>
                  <div style={{ padding: '8px 12px', background: '#0a1628', borderRadius: 6, borderLeft: '4px solid #ffb703' }}>
                    <strong>21:41:15</strong> — PostgreSQL Operation: Lock timeout sur la table <code style={{ color: '#00f0ff' }}>apps_registry_elector</code>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#0a1628', borderRadius: 6, borderLeft: '4px solid #00ff88' }}>
                    <strong>21:41:18</strong> — Gunicorn master worker a automatiquement recyclé le process (Auto-recovery OK)
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7894b8', marginBottom: 4 }}>STACKTRACE EXTRAITE</div>
                  <pre
                    style={{
                      background: '#040810',
                      border: '1px solid #142845',
                      padding: 12,
                      borderRadius: 6,
                      color: '#ff2a6d',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                    }}
                  >
                    {`django.db.utils.OperationalError: lock timeout occurred
  File "apps/registry/views.py", line 142, in search_electors
    results = list(queryset.select_for_update(nowait=False))
  File "django/db/backends/base/schema.py", line 180, in execute
    return self.cursor.execute(sql, params)`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERVER DETAILS */}
          {activeTab === 'server' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>🖥 SERVER DETAILS & RUNTIME VERSIONS</h2>
              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.85rem' }}>
                  <div>Hostname: <strong style={{ color: '#00f0ff' }}>cep-do-production-01</strong></div>
                  <div>IP Publique: <strong style={{ color: '#00ff88' }}>147.182.161.220</strong></div>
                  <div>Système d'Exploitation: <strong>Ubuntu 24.04 LTS (x86_64)</strong></div>
                  <div>Noyau Kernel Linux: <strong>6.8.0-31-generic</strong></div>
                  <div>Version Python: <strong>3.12.3</strong></div>
                  <div>Version Django Framework: <strong>5.0.3</strong></div>
                  <div>Version Go Engine: <strong>go1.22.1 linux/amd64</strong></div>
                  <div>Version Rust Enclave: <strong>rustc 1.78.0</strong></div>
                  <div>Moteur PostgreSQL: <strong>16.2-alpine</strong></div>
                  <div>Moteur Docker: <strong>26.0.0 (API v1.45)</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CENTRALIZED LOG STREAM */}
          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>📜 LOG CENTER — STREAM DE SÉCURITÉ CENTRALISÉ</h2>
              <div style={{ background: '#040810', border: '1px solid #142845', borderRadius: 8, padding: 16, fontSize: '0.78rem', color: '#00ff88' }}>
                <div>[2026-09-06 21:44:02] [INFO] [nginx] 190.115.18.42 - "GET /api/kernel/metrics HTTP/1.1" 200 482 "-" "Mozilla/5.0"</div>
                <div>[2026-09-06 21:44:05] [WARN] [auth] Failed login attempt for user 'm.mathurin.cep' from IP 190.115.18.42</div>
                <div>[2026-09-06 21:44:06] [SECURITY] [ip-blocker] IP 190.115.18.42 auto-throttled after 5 consecutive failures</div>
                <div>[2026-09-06 21:44:10] [INFO] [audit] AuditEvent logged: DEVOPS_KERNEL_ACCESS by devops.admin</div>
              </div>
            </div>
          )}

          {/* TAB 7: CEP ADMIN USERS MANAGEMENT (RBAC RESTRICTED) */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>👤 ADMINISTRATION DES COMPTES ET RÔLES CEP (STRICT RBAC)</h2>
              {userCreatedMsg && <div style={{ padding: '10px 14px', background: '#00ff8822', border: '1px solid #00ff88', color: '#00ff88', borderRadius: 6, fontSize: '0.85rem' }}>{userCreatedMsg}</div>}

              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7894b8', marginBottom: 4 }}>Nom Complet Officiel</label>
                    <input type="text" required value={newAdmin.fullName} onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })} placeholder="ex: Jean-Baptiste Moïse" style={{ width: '100%', padding: '8px 12px', background: '#040810', border: '1px solid #1c365d', color: '#fff', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7894b8', marginBottom: 4 }}>Identifiant unique (Username)</label>
                    <input type="text" required value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} placeholder="ex: jb.moise.cep" style={{ width: '100%', padding: '8px 12px', background: '#040810', border: '1px solid #1c365d', color: '#fff', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7894b8', marginBottom: 4 }}>Rôle d'Habilitation Institutionnel</label>
                    <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: '#040810', border: '1px solid #1c365d', color: '#fff', borderRadius: 6 }}>
                      <option value="ADMIN_CEP">ADMIN_CEP — Membre du Conseil CEP</option>
                      <option value="MEMBER_CEP">MEMBER_CEP — Conseiller Électoral</option>
                      <option value="BED">BED — Directeur Bureau Départemental</option>
                      <option value="BEC">BEC — Superviseur Bureau Communal</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7894b8', marginBottom: 4 }}>Périmètre Départemental (Scope)</label>
                    <select value={newAdmin.department} onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })} style={{ width: '100%', padding: '8px 12px', background: '#040810', border: '1px solid #1c365d', color: '#fff', borderRadius: 6 }}>
                      <option value="ALL">National (Tous les 10 Départements)</option>
                      <option value="Ouest">Ouest (Port-au-Prince)</option>
                      <option value="Nord">Nord (Cap-Haïtien)</option>
                      <option value="Artibonite">Artibonite (Gonaïves)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" style={{ background: '#003893', color: '#fff', border: '1px solid #00f0ff', padding: '10px 20px', borderRadius: 6, fontWeight: 800, cursor: 'pointer' }}>
                      ➕ CRÉER LE COMPTE INSTITUTIONNEL
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>📱 GESTION DES SESSIONS ACTIVES & RÉVOCATION</h2>
              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1c365d', color: '#7894b8' }}>
                      <th style={{ padding: '8px' }}>UTILISATEUR</th>
                      <th style={{ padding: '8px' }}>RÔLE</th>
                      <th style={{ padding: '8px' }}>IP CONNECTÉE</th>
                      <th style={{ padding: '8px' }}>APPAREIL & NAVIGATEUR</th>
                      <th style={{ padding: '8px' }}>DERNIÈRE ACTIVITÉ</th>
                      <th style={{ padding: '8px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((sess) => (
                      <tr key={sess.id} style={{ borderBottom: '1px solid #12243d' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 800, color: '#00f0ff' }}>{sess.username}</td>
                        <td style={{ padding: '10px 8px', color: '#fff' }}>{sess.role}</td>
                        <td style={{ padding: '10px 8px', color: '#7894b8' }}>{sess.ip}</td>
                        <td style={{ padding: '10px 8px', color: '#7894b8' }}>{sess.device}</td>
                        <td style={{ padding: '10px 8px', color: '#00ff88' }}>{sess.lastActive}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <button type="button" onClick={() => handleRevokeSession(sess.id)} style={{ background: '#ff2a6d22', color: '#ff2a6d', border: '1px solid #ff2a6d', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 800, fontSize: '0.72rem' }}>
                            REVOKE SESSION
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: DEVICE & BIOPAD TELEMETRY */}
          {activeTab === 'devices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>📱 FLOTTE BIOPAD & APK TELEMETRY (13,210 APPAREILS)</h2>
              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>Appareils Actifs: <strong style={{ color: '#00ff88' }}>13,210</strong></div>
                  <div>Hors Ligne / Sync Différée: <strong style={{ color: '#ffb703' }}>120</strong></div>
                  <div>Version APK Déployée: <strong style={{ color: '#00f0ff' }}>v1.4.2-sec</strong></div>
                  <div>Certificats TPM Valides: <strong style={{ color: '#00ff88' }}>100%</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: BACKUP INTEGRITY */}
          {activeTab === 'backups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>💾 BACKUP INTEGRITY & RESTORE CONTROLS</h2>
              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>Dernière Sauvegarde Automatique : il y a 2 heures</div>
                    <div style={{ fontSize: '0.78rem', color: '#7894b8', marginTop: 4 }}>Fichier: <code style={{ color: '#00f0ff' }}>cep_prod_backup_20260906_2000.sql.enc</code> (Size: 4.82 GB, SHA-256 Validated)</div>
                  </div>
                  <button type="button" style={{ background: '#003893', color: '#fff', border: '1px solid #00f0ff', padding: '8px 16px', borderRadius: 6, fontWeight: 800, cursor: 'pointer' }}>
                    ⚡ DECLENCHER BACKUP IMMEDIAT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: DEMO / TEST DATA PURGE */}
          {activeTab === 'environment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#ffb703', fontSize: '1.2rem' }}>🧪 GESTION DE L'ENVIRONNEMENT DE STAGING & DONNÉES DE TEST</h2>
              <div style={{ background: '#0b192e', border: '1px solid #ffb70344', borderRadius: 8, padding: 20 }}>
                <p style={{ color: '#8aa2c0', fontSize: '0.85rem', marginTop: 0 }}>
                  La remise à zéro réinitialise les votes fictifs, incidents simulés et logs de staging avant le basculement officiel du scrutin.
                </p>
                <button type="button" onClick={() => setShowPurgeModal(true)} style={{ background: '#ffb70322', color: '#ffb703', border: '1px solid #ffb703', padding: '10px 20px', borderRadius: 6, fontWeight: 800, cursor: 'pointer' }}>
                  ⚠️ PURGER LES DONNÉES DE TEST DE STAGING
                </button>
              </div>

              {/* High Security Purge Modal */}
              {showPurgeModal && (
                <div style={{ background: '#040810', border: '2px solid #ff2a6d', borderRadius: 8, padding: 24, marginTop: 10 }}>
                  <h3 style={{ color: '#ff2a6d', margin: '0 0 10px 0' }}>🚨 CONFIRMATION HAUTE SÉCURITÉ REQUISE</h3>
                  {purgeStatus && <div style={{ padding: '8px 12px', background: '#ff2a6d22', color: '#fff', border: '1px solid #ff2a6d', borderRadius: 6, marginBottom: 12, fontSize: '0.82rem' }}>{purgeStatus}</div>}
                  <form onSubmit={handlePurgeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ fontSize: '0.8rem', color: '#7894b8' }}>Mot de passe Administrateur DevOps :</label>
                    <input type="password" required value={purgePassword} onChange={(e) => setPurgePassword(e.target.value)} placeholder="••••••••••••" style={{ padding: '8px 12px', background: '#0b192e', border: '1px solid #1c365d', color: '#fff', borderRadius: 6 }} />
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="submit" style={{ background: '#c5221f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 800, cursor: 'pointer' }}>
                        CONFIRMER LA PURGE
                      </button>
                      <button type="button" onClick={() => setShowPurgeModal(false)} style={{ background: '#1c365d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                        ANNULER
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: EMERGENCY MODE SHIELD */}
          {activeTab === 'emergency' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#ff2a6d', fontSize: '1.2rem' }}>⚡ EMERGENCY SHIELD CONTROLS (SÉCURITÉ PLATEFORME)</h2>
              <div style={{ background: '#0b192e', border: '1px solid #ff2a6d', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', display: 'block' }}>Strict Rate Limiting Emergency</strong>
                      <span style={{ fontSize: '0.78rem', color: '#7894b8' }}>Plafonne les requêtes à 50 req/min par IP en cas d'attaque volumétrique</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmergencyMode({ ...emergencyMode, strictRateLimit: !emergencyMode.strictRateLimit })}
                      style={{
                        background: emergencyMode.strictRateLimit ? '#00ff8822' : '#142845',
                        color: emergencyMode.strictRateLimit ? '#00ff88' : '#7894b8',
                        border: '1px solid #00ff88',
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {emergencyMode.strictRateLimit ? 'ACTIVÉ (PROTECTION MAX)' : 'DÉSACTIVÉ'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', display: 'block' }}>Emergency Read-Only Mode</strong>
                      <span style={{ fontSize: '0.78rem', color: '#7894b8' }}>Verrouille les API en lecture seule (Aucune altération possible)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmergencyMode({ ...emergencyMode, readOnly: !emergencyMode.readOnly })}
                      style={{
                        background: emergencyMode.readOnly ? '#ff2a6d22' : '#142845',
                        color: emergencyMode.readOnly ? '#ff2a6d' : '#7894b8',
                        border: '1px solid #ff2a6d',
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {emergencyMode.readOnly ? 'MODE LECTURE SEULE' : 'INACTIF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: DEVOPS AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ margin: 0, color: '#00f0ff', fontSize: '1.2rem' }}>📋 DEVOPS IMMUTABLE AUDIT TRAIL & OPERATIONAL LEDGER</h2>
              <div style={{ background: '#0b192e', border: '1px solid #1c365d', borderRadius: 8, padding: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1c365d', color: '#7894b8' }}>
                      <th style={{ padding: '8px' }}>HORODATAGE</th>
                      <th style={{ padding: '8px' }}>ACTEUR</th>
                      <th style={{ padding: '8px' }}>RÔLE</th>
                      <th style={{ padding: '8px' }}>IP</th>
                      <th style={{ padding: '8px' }}>ACTION</th>
                      <th style={{ padding: '8px' }}>CIBLE</th>
                      <th style={{ padding: '8px' }}>RÉSULTAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #12243d' }}>
                        <td style={{ padding: '8px', color: '#7894b8' }}>{log.timestamp.split('T')[1]?.substring(0, 8) || log.timestamp}</td>
                        <td style={{ padding: '8px', fontWeight: 800, color: '#00f0ff' }}>{log.user}</td>
                        <td style={{ padding: '8px', color: '#fff' }}>{log.role}</td>
                        <td style={{ padding: '8px', color: '#7894b8' }}>{log.ip}</td>
                        <td style={{ padding: '8px', color: '#ffb703', fontWeight: 800 }}>{log.action}</td>
                        <td style={{ padding: '8px', color: '#7894b8' }}>{log.resource}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ color: log.status === 'SUCCESS' ? '#00ff88' : '#ff2a6d', fontWeight: 800 }}>{log.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

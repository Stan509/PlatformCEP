import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { adminApi } from '../lib/api';
import { ALL_PERMISSIONS } from '../lib/mockData';
import type { AdminRole, AdminUser, PermissionDefinition } from '../lib/mockData';
import { HAITI_DEPARTMENTS, getCommunesByDepartmentName } from '../lib/haitiGeo';

export function Users(): JSX.Element {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<AdminUser>(() => adminApi.getActiveUser());

  // User Filter State
  const [userSearch, setUserSearch] = useState('');

  // User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleCode, setUserRoleCode] = useState('ADMIN_CEP');
  const [userDept, setUserDept] = useState('');
  const [userCommune, setUserCommune] = useState('');
  const [userMtls, setUserMtls] = useState(true);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

  // Role Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [roleCode, setRoleCode] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, rList] = await Promise.all([adminApi.users(), adminApi.roles()]);
      setUsers(uList);
      setRoles(rList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchUser = (u: AdminUser) => {
    setActiveUser(u);
    adminApi.setActiveUser(u);
    window.location.reload();
  };

  // --- USER HANDLERS ---
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFullName('');
    setUserUsername('');
    setUserPassword('CepUser2026!');
    setUserRoleCode(roles[0]?.code || 'ADMIN_CEP');
    setUserDept('');
    setUserCommune('');
    setUserMtls(true);
    setUserStatus('ACTIVE');
    setUserModalOpen(true);
  };

  const openEditUserModal = (u: AdminUser) => {
    setEditingUser(u);
    setUserFullName(u.fullName);
    setUserUsername(u.username);
    setUserPassword(u.password || 'CepUser2026!');
    setUserRoleCode(u.role);
    setUserDept(u.department || '');
    setUserCommune(u.commune || '');
    setUserMtls(u.mTLSVerified);
    setUserStatus(u.status);
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleObj = roles.find((r) => r.code === userRoleCode);
    const userData: AdminUser = {
      id: editingUser ? editingUser.id : `u-${Date.now()}`,
      fullName: userFullName,
      username: userUsername.trim().toLowerCase(),
      password: userPassword,
      role: userRoleCode,
      roleTitle: roleObj ? roleObj.title : userRoleCode,
      department: userDept || undefined,
      commune: userCommune || undefined,
      status: userStatus,
      mTLSVerified: userMtls,
      lastActive: editingUser ? editingUser.lastActive : 'À l\'instant',
    };

    const updated = await adminApi.saveUser(userData);
    setUsers(updated);
    setUserModalOpen(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (users.length <= 1) {
      alert('Impossible de supprimer le dernier utilisateur.');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const updated = await adminApi.deleteUser(id);
      setUsers(updated);
    }
  };

  // --- ROLE HANDLERS ---
  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleCode('');
    setRoleTitle('');
    setRoleDescription('');
    setSelectedPermissions(['PERM_DASHBOARD_VIEW']);
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (r: AdminRole) => {
    setEditingRole(r);
    setRoleCode(r.code);
    setRoleTitle(r.title);
    setRoleDescription(r.description);
    setSelectedPermissions(r.permissions || []);
    setRoleModalOpen(true);
  };

  const openDuplicateRoleModal = (r: AdminRole) => {
    setEditingRole(null);
    setRoleCode(`${r.code}_COPY`);
    setRoleTitle(`Copie de ${r.title}`);
    setRoleDescription(r.description);
    setSelectedPermissions(r.permissions || []);
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleData: AdminRole = {
      id: editingRole ? editingRole.id : `role-${Date.now()}`,
      code: roleCode.trim().toUpperCase().replace(/\s+/g, '_'),
      title: roleTitle,
      description: roleDescription,
      permissions: selectedPermissions,
      isSystem: editingRole ? editingRole.isSystem : false,
    };

    const updated = await adminApi.saveRole(roleData);
    setRoles(updated);
    setRoleModalOpen(false);
  };

  const handleDeleteRole = async (id: string) => {
    const roleToDelete = roles.find((r) => r.id === id);
    if (roleToDelete?.isSystem) {
      alert('Les rôles système prédéfinis du CEP ne peuvent pas être supprimés.');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      const updated = await adminApi.deleteRole(id);
      setRoles(updated);
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const selectAllCategoryPermissions = (category: string) => {
    const catPerms = ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.id);
    const combined = Array.from(new Set([...selectedPermissions, ...catPerms]));
    setSelectedPermissions(combined);
  };

  const deselectAllCategoryPermissions = (category: string) => {
    const catPerms = ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.id);
    setSelectedPermissions(selectedPermissions.filter((p) => !catPerms.includes(p)));
  };

  const currentCommunes = userDept ? getCommunesByDepartmentName(userDept) : [];

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const categories = [
    { key: 'SUPERVISION', label: '📊 Supervision & Command Center', color: '#0d6efd' },
    { key: 'ELECTIONS', label: '🗳️ Scrutins & Modalités', color: '#6f42c1' },
    { key: 'PARTIES_CANDIDATES', label: '🏛️ Partis Politiques & Candidats', color: '#003893' },
    { key: 'OPERATIONS', label: '📋 Opérations, PV & Appareils BIOPAD', color: '#137333' },
    { key: 'AUDIT', label: '🔍 Audit Cryptographique SHA-256', color: '#d97706' },
    { key: 'USERS', label: '👥 Administration Utilisateurs & RBAC', color: '#dc3545' },
  ];

  return (
    <div style={{ padding: 'var(--cep-space-4)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
            Gestion des Utilisateurs & Matrice des Rôles (RBAC)
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
            Contrôle d'accès granulaire basé sur les rôles (Role-Based Access Control) et attribution des privilèges d'autorisation.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div style={{ display: 'flex', background: '#e0e0e0', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.5rem 1.2rem',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'users' ? 'white' : 'transparent',
              color: activeTab === 'users' ? 'var(--cep-color-deep-blue)' : '#555',
              boxShadow: activeTab === 'users' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            👤 Utilisateurs ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '0.5rem 1.2rem',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'roles' ? 'white' : 'transparent',
              color: activeTab === 'roles' ? 'var(--cep-color-deep-blue)' : '#555',
              boxShadow: activeTab === 'roles' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🛡️ Rôles & Permissions ({roles.length})
          </button>
        </div>
      </div>

      {/* Active Session Banner */}
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

      {/* ==================== TAB 1: USERS MANAGEMENT ==================== */}
      {activeTab === 'users' && (
        <>
          {/* Top Actions & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un utilisateur par nom, identifiant, rôle ou département..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--cep-radius-md)',
                border: '1px solid var(--cep-color-border)',
                minWidth: 320,
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={openCreateUserModal}
              style={{
                background: 'var(--cep-color-cep-blue)',
                color: 'white',
                border: 'none',
                padding: '0.66rem 1.3rem',
                borderRadius: 'var(--cep-radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Nouvel Utilisateur Institutionnel
            </button>
          </div>

          {/* Users Table */}
          <div style={{ background: 'white', borderRadius: 'var(--cep-radius-lg)', border: '1px solid var(--cep-color-border)', padding: '1.5rem' }}>
            {loading ? (
              <div>{t('common.loading')}</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--cep-color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Utilisateur / Identifiant</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Rôle Institutionnel</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Portée Géographique</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Certificat mTLS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Statut</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isCurrent = activeUser.id === u.id;
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee', background: isCurrent ? '#f0f7ff' : 'transparent' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--cep-color-deep-blue)' }}>
                              {u.fullName} {isCurrent && <span style={{ color: 'var(--cep-color-cep-blue)', fontSize: '0.75rem' }}>(Actif)</span>}
                            </div>
                            <code style={{ fontSize: '0.78rem', color: 'gray' }}>@{u.username}</code>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ background: '#e0e8f5', color: '#003893', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                              {u.roleTitle}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {u.department ? (
                              <span>{u.department} {u.commune ? `(${u.commune})` : ''}</span>
                            ) : (
                              <span style={{ fontStyle: 'italic', color: '#555' }}>National (Toute Haïti)</span>
                            )}
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
                              {u.mTLSVerified ? '🔒 Certifié mTLS' : '⚠️ Non certifié'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: u.status === 'ACTIVE' ? '#e6f4ea' : '#fef7e0',
                                color: u.status === 'ACTIVE' ? '#137333' : '#b06000',
                              }}
                            >
                              {u.status === 'ACTIVE' ? 'ACTIF' : 'SUSPENDU'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                disabled={isCurrent}
                                onClick={() => handleSwitchUser(u)}
                                style={{
                                  background: isCurrent ? '#ccc' : 'var(--cep-color-cep-blue)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: 4,
                                  cursor: isCurrent ? 'default' : 'pointer',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                {isCurrent ? 'Actif' : 'Simuler'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditUserModal(u)}
                                style={{ background: '#f1f3f4', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Éditer
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== TAB 2: ROLES & PERMISSIONS MATRIX ==================== */}
      {activeTab === 'roles' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--cep-color-deep-blue)', fontSize: '1.2rem' }}>
                Registre des Rôles & Privilèges d'Accès CEP
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#666' }}>
                Configurez les permissions accordées à chaque profil institutionnel pour garantir la ségrégation des tâches.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateRoleModal}
              style={{
                background: '#137333',
                color: 'white',
                border: 'none',
                padding: '0.66rem 1.3rem',
                borderRadius: 'var(--cep-radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Créer un Rôle sur Mesure
            </button>
          </div>

          {/* Roles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.2rem' }}>
            {roles.map((r) => {
              const permCount = r.permissions?.length || 0;
              const isAllPerms = permCount >= ALL_PERMISSIONS.length;
              return (
                <div
                  key={r.id}
                  style={{
                    background: 'white',
                    borderRadius: 'var(--cep-radius-lg)',
                    border: r.isSystem ? '2px solid #003893' : '1px solid var(--cep-color-border)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cep-color-cep-blue)', letterSpacing: '0.5px' }}>
                        CODE : {r.code}
                      </span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', color: 'var(--cep-color-deep-blue)' }}>{r.title}</h3>
                    </div>
                    {r.isSystem && (
                      <span style={{ background: '#e0e8f5', color: '#003893', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 12 }}>
                        🔒 RÔLE SYSTÈME
                      </span>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.4 }}>{r.description}</p>

                  <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 700, color: 'var(--cep-color-deep-blue)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Permissions attribuées :</span>
                      <span style={{ color: isAllPerms ? '#137333' : '#0d6efd' }}>
                        {permCount} / {ALL_PERMISSIONS.length} {isAllPerms && '(Accès Total)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {r.permissions?.map((pId) => {
                        const pDef = ALL_PERMISSIONS.find((p) => p.id === pId);
                        if (!pDef) return null;
                        const cat = categories.find((c) => c.key === pDef.category);
                        return (
                          <span
                            key={pId}
                            title={pDef.description}
                            style={{
                              background: '#fff',
                              border: `1px solid ${cat ? cat.color : '#ccc'}`,
                              color: cat ? cat.color : '#333',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {pDef.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                    <button
                      type="button"
                      onClick={() => openDuplicateRoleModal(r)}
                      style={{ background: '#f1f3f4', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Dupliquer
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditRoleModal(r)}
                      style={{ background: '#e0e8f5', color: '#003893', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Modifier Permissions
                    </button>
                    {!r.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(r.id)}
                        style={{ background: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 10px', borderRadius: 4, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ==================== MODAL: CREATE / EDIT USER ==================== */}
      {userModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              {editingUser ? 'Modifier l\'Utilisateur Institutionnel' : 'Enregistrer un Nouvel Utilisateur'}
            </h2>
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Nom complet de l'Autorité / Membre</label>
                <input type="text" required value={userFullName} onChange={(e) => setUserFullName(e.target.value)} placeholder="ex: Me. Max Mathurin" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Identifiant (Username)</label>
                  <input type="text" required value={userUsername} onChange={(e) => setUserUsername(e.target.value)} placeholder="ex: m.mathurin.cep" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Mot de passe initial</label>
                  <input type="text" required value={userPassword} onChange={(e) => setUserPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Rôle Attribué (RBAC)</label>
                <select value={userRoleCode} onChange={(e) => setUserRoleCode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.title} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Portée Départementale (Optionnel)</label>
                  <select value={userDept} onChange={(e) => { setUserDept(e.target.value); setUserCommune(''); }} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="">National (Toute Haïti)</option>
                    {HAITI_DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Commune (Optionnel)</label>
                  <select value={userCommune} disabled={!userDept} onChange={(e) => setUserCommune(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="">Toutes les communes</option>
                    {currentCommunes.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: '#f8f9fa', padding: '0.8rem', borderRadius: 6 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Statut du Compte</label>
                  <select value={userStatus} onChange={(e) => setUserStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')} style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="ACTIVE">ACTIF</option>
                    <option value="SUSPENDED">SUSPENDU</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 18 }}>
                  <input type="checkbox" id="userMtlsCheck" checked={userMtls} onChange={(e) => setUserMtls(e.target.checked)} />
                  <label htmlFor="userMtlsCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Certificat mTLS Activé</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setUserModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: 'var(--cep-color-cep-blue)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREATE / EDIT ROLE & PERMISSIONS ==================== */}
      {roleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 720, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cep-color-deep-blue)' }}>
              {editingRole ? `Modifier le Rôle : ${editingRole.title}` : 'Créer un Rôle & Attribuer les Permissions'}
            </h2>

            <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Code du Rôle (Unique)</label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystem}
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    placeholder="ex: LEGAL_INSPECTOR"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Intitulé Officiel du Rôle</label>
                  <input type="text" required value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="ex: Inspecteur des Contentieux Électoraux" style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Description des Responsabilités</label>
                <input type="text" required value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="Description courte de la mission attribuée..." style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
              </div>

              {/* Permissions Matrix */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cep-color-deep-blue)' }}>
                    Matrice des Permissions Attribuées ({selectedPermissions.length} / {ALL_PERMISSIONS.length})
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id))}
                      style={{ background: '#e0e8f5', color: '#003893', border: 'none', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Tout Sélectionner
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      style={{ background: '#f1f3f4', border: 'none', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Tout Désélectionner
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {categories.map((cat) => {
                    const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat.key);
                    return (
                      <div key={cat.key} style={{ border: `1px solid ${cat.color}40`, borderRadius: 8, padding: '0.75rem', background: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cat.color }}>{cat.label}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => selectAllCategoryPermissions(cat.key)}
                              style={{ background: 'transparent', border: 'none', color: cat.color, fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Cocher la catégorie
                            </button>
                            <span style={{ color: '#ccc' }}>|</span>
                            <button
                              type="button"
                              onClick={() => deselectAllCategoryPermissions(cat.key)}
                              style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Décocher
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                          {catPerms.map((p) => {
                            const isChecked = selectedPermissions.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  background: isChecked ? '#fff' : '#f3f4f6',
                                  padding: '6px 8px',
                                  borderRadius: 6,
                                  border: isChecked ? `1px solid ${cat.color}` : '1px solid #e5e7eb',
                                  cursor: 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(p.id)}
                                  style={{ marginTop: 2 }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: isChecked ? cat.color : '#333' }}>{p.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#666', lineHeight: 1.2 }}>{p.description}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRoleModalOpen(false)} style={{ background: '#f1f3f4', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ background: '#137333', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Sauvegarder le Rôle & Permissions</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

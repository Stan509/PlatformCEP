import { useState } from 'react';
import type { JSX } from 'react';
import type { UserAccount, UserScope } from '../lib/mockData';
import { USER_ACCOUNTS } from '../lib/mockData';
import { PERMISSION_REGISTRY } from '../lib/permissions';
import { ConfirmationModal } from '../components/admin/ConfirmationModal';

interface PermissionsManageProps {
  currentUser: UserAccount;
}

export function PermissionsManage({ currentUser }: PermissionsManageProps): JSX.Element {
  const [users, setUsers] = useState<UserAccount[]>(USER_ACCOUNTS);
  const [selectedUser, setSelectedUser] = useState<UserAccount>(USER_ACCOUNTS[1]!);
  const [userPerms, setUserPerms] = useState<string[]>(selectedUser.permissions || []);
  const [userScope, setUserScope] = useState<UserScope>(selectedUser.scope || { departments: ['Ouest'], elections: ['e1'] });

  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectUser = (u: UserAccount) => {
    setSelectedUser(u);
    setUserPerms(u.permissions || []);
    setUserScope(u.scope || { departments: ['Ouest'], elections: ['e1'] });
  };

  const togglePermission = (code: string) => {
    setUserPerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const handleSaveClick = () => {
    setModalOpen(true);
  };

  const handleConfirmSave = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions: userPerms, scope: userScope } : u))
    );
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 'var(--cep-space-4)' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--cep-color-deep-blue)' }}>
          ⚙️ Gestion des Permissions Granulaires & Matrice de Scope (RBAC / ABAC)
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--cep-color-text-muted)', fontSize: '0.9rem' }}>
          Attribution fine des permissions (resource.action) et des limites territoriales/électorales par administrateur CEP.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* User Selector List */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#002d62', fontSize: '1.05rem' }}>Sélectionner un Administrateur</h3>
          {users.map((u) => {
            const isSelected = u.id === selectedUser.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectUser(u)}
                style={{
                  textAlign: 'left',
                  padding: '0.7rem',
                  borderRadius: 6,
                  border: isSelected ? '2px solid #003893' : '1px solid #eee',
                  background: isSelected ? '#eef4ff' : '#f8f9fa',
                  cursor: 'pointer',
                }}
              >
                <strong style={{ display: 'block', color: '#002d62', fontSize: '0.9rem' }}>{u.fullName}</strong>
                <span style={{ fontSize: '0.78rem', color: '#555' }}>{u.roleTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Permissions & Scope Matrix Editor */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e0e0e0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#002d62', fontSize: '1.2rem' }}>Matrice de Permissions : {selectedUser.fullName}</h2>
              <span style={{ fontSize: '0.82rem', color: '#666' }}>Rôle : {selectedUser.role} | Compte : <code>{selectedUser.username}</code></span>
            </div>
            <button
              type="button"
              onClick={handleSaveClick}
              style={{ background: '#003893', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
            >
              Enregistrer les Modificators
            </button>
          </div>

          {/* Scope Editor */}
          <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 8px', color: '#002d62' }}>📍 Définition du Périmètre (Scope ABAC)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Départements Autorisés (séparés par virgule ou ALL)</label>
                <input
                  type="text"
                  value={userScope.departments?.join(', ') || ''}
                  onChange={(e) => setUserScope({ ...userScope, departments: e.target.value.split(',').map((s) => s.trim()) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Scrutins Autorisés (e.g. e1 ou ALL)</label>
                <input
                  type="text"
                  value={userScope.elections?.join(', ') || ''}
                  onChange={(e) => setUserScope({ ...userScope, elections: e.target.value.split(',').map((s) => s.trim()) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
                />
              </div>
            </div>
          </div>

          {/* Permissions Checkbox Grid */}
          <div>
            <h4 style={{ margin: '0 0 10px', color: '#002d62' }}>🔑 Catalogue des Permissions Granulaires (resource.action)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
              {PERMISSION_REGISTRY.map((perm) => {
                const isChecked = userPerms.includes(perm.code) || userPerms.includes('system.superadmin');
                return (
                  <label
                    key={perm.code}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: '0.82rem',
                      padding: '0.6rem',
                      borderRadius: 6,
                      border: isChecked ? '1px solid #b8d1f9' : '1px solid #eee',
                      background: isChecked ? '#eef4ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.code)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: '#002d62' }}>{perm.label}</strong>
                      <code style={{ fontSize: '0.72rem', color: '#555' }}>{perm.code}</code>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        title="Mise à jour des habilitations administrateur"
        actionName="Modification des permissions & scopes RBAC"
        targetResource={`${selectedUser.fullName} (${selectedUser.username})`}
        consequenceSummary={`L'administrateur verra son menu et ses accès ajustés immédiatement (${userPerms.length} permissions attribuées).`}
        tone="warning"
        onConfirm={handleConfirmSave}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

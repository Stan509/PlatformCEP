/**
 * CEP ADMIN V3 — Permission & Scope Verification Suite
 * Automated tests validating RBAC & Scope evaluation rules.
 */

import { hasPermission } from '../lib/permissions';
import { hasScope, canAccessUI } from '../lib/scopes';
import type { UserSessionProfile } from '../lib/scopes';

function runPermissionScopeTests(): { passed: number; failed: number; log: string[] } {
  let passed = 0;
  let failed = 0;
  const log: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      log.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      log.push(`❌ FAIL: ${testName}`);
    }
  }

  // User A Persona: Responsable Candidatures (Ouest)
  const userA: UserSessionProfile = {
    id: 'u-cand-mgr',
    username: 'cand.mgr.ouest',
    fullName: 'Dr. Yolette Mengual',
    role: 'MEMBER_CEP',
    roleTitle: 'Responsable Candidats (Ouest)',
    permissions: ['candidate.view', 'candidate.approve', 'party.view', 'mandate.view'],
    scope: { departments: ['Ouest', 'Centre'], elections: ['e1'] },
  };

  // User B Persona: Responsable Opérations (Nord)
  const userB: UserSessionProfile = {
    id: 'u-ops-mgr',
    username: 'ops.mgr.nord',
    fullName: 'Ing. Fritz Bernard',
    role: 'MEMBER_CEP',
    roleTitle: 'Responsable Opérations (Nord)',
    permissions: ['station.view', 'device.view', 'device.revoke', 'elector.assign'],
    scope: { departments: ['Nord', 'Nord-Est'], elections: ['e1'] },
  };

  // Test 1: User A has candidate.view permission
  assert(hasPermission(userA.permissions, 'candidate.view') === true, 'User A has candidate.view permission');

  // Test 2: User A does NOT have device.revoke permission
  assert(hasPermission(userA.permissions, 'device.revoke') === false, 'User A lacks device.revoke permission');

  // Test 3: User B has device.revoke permission
  assert(hasPermission(userB.permissions, 'device.revoke') === true, 'User B has device.revoke permission');

  // Test 4: User A scope covers department Ouest
  assert(hasScope(userA.scope, { department: 'Ouest' }) === true, 'User A scope includes Ouest');

  // Test 5: User A scope does NOT cover department Nord
  assert(hasScope(userA.scope, { department: 'Nord' }) === false, 'User A scope excludes Nord');

  // Test 6: User B scope covers department Nord
  assert(hasScope(userB.scope, { department: 'Nord' }) === true, 'User B scope includes Nord');

  // Test 7: canAccessUI allows User A for candidate.view in Ouest
  const res1 = canAccessUI(userA, 'candidate.view', { department: 'Ouest' });
  assert(res1.allowed === true, 'User A permitted for candidate.view in Ouest');

  // Test 8: canAccessUI denies User A for device.view (MISSING_PERMISSION)
  const res2 = canAccessUI(userA, 'device.view', { department: 'Ouest' });
  assert(res2.allowed === false && res2.reason === 'MISSING_PERMISSION', 'User A denied device.view due to missing permission');

  // Test 9: canAccessUI denies User A for candidate.view in Nord (SCOPE_RESTRICTED)
  const res3 = canAccessUI(userA, 'candidate.view', { department: 'Nord' });
  assert(res3.allowed === false && res3.reason === 'SCOPE_RESTRICTED', 'User A denied candidate.view in Nord due to scope restriction');

  // Test 10: USER A (Menu A) != USER B (Menu B)
  const menuA = ['candidate.view', 'party.view', 'mandate.view'].every((p) => hasPermission(userA.permissions, p as any));
  const menuBForUserA = ['station.view', 'device.view'].some((p) => hasPermission(userA.permissions, p as any));
  assert(menuA && !menuBForUserA, 'USER A Menu A is distinct from USER B Menu B');

  log.push(`\nSummary: ${passed} passed, ${failed} failed.`);
  return { passed, failed, log };
}

export { runPermissionScopeTests };

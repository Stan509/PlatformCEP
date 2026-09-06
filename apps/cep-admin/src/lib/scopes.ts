/**
 * CEP ADMIN V3 — Scope Engine (ABAC / Territorial & Contextual Boundaries)
 * Evaluates whether a user's assigned scope covers a given resource or action target.
 */

import { hasPermission } from './permissions';
import type { PermissionCode } from './permissions';

export interface UserScope {
  departments?: string[]; // e.g. ['Ouest', 'Nord'] or ['ALL']
  communes?: string[]; // e.g. ['Port-au-Prince', 'Cap-Haïtien'] or ['ALL']
  elections?: string[]; // e.g. ['e1'] or ['ALL']
  stationCodes?: string[]; // e.g. ['BV-PAP-012'] or ['ALL']
  partyIds?: string[]; // e.g. ['p1'] or ['ALL']
  candidateIds?: string[]; // e.g. ['c1'] or ['ALL']
}

export interface ResourceScopeTarget {
  department?: string;
  commune?: string;
  electionId?: string;
  stationCode?: string;
  partyId?: string;
  candidateId?: string;
}

export interface UserSessionProfile {
  id: string;
  username: string;
  fullName: string;
  role: string;
  roleTitle: string;
  permissions: string[];
  scope: UserScope;
  department?: string;
  commune?: string;
}

/**
 * Verifies if the target resource fits inside the user's scope boundaries.
 */
export function hasScope(userScope: UserScope | undefined, target?: ResourceScopeTarget): boolean {
  if (!target) return true;
  if (!userScope) return true; // Default fallback if scope not specified

  // Department Scope Check
  if (target.department && userScope.departments && userScope.departments.length > 0) {
    if (!userScope.departments.includes('ALL') && !userScope.departments.includes(target.department)) {
      return false;
    }
  }

  // Commune Scope Check
  if (target.commune && userScope.communes && userScope.communes.length > 0) {
    if (!userScope.communes.includes('ALL') && !userScope.communes.includes(target.commune)) {
      return false;
    }
  }

  // Election Scope Check
  if (target.electionId && userScope.elections && userScope.elections.length > 0) {
    if (!userScope.elections.includes('ALL') && !userScope.elections.includes(target.electionId)) {
      return false;
    }
  }

  // Polling Station Code Check
  if (target.stationCode && userScope.stationCodes && userScope.stationCodes.length > 0) {
    if (!userScope.stationCodes.includes('ALL') && !userScope.stationCodes.includes(target.stationCode)) {
      return false;
    }
  }

  // Political Party Scope Check
  if (target.partyId && userScope.partyIds && userScope.partyIds.length > 0) {
    if (!userScope.partyIds.includes('ALL') && !userScope.partyIds.includes(target.partyId)) {
      return false;
    }
  }

  // Candidate Scope Check
  if (target.candidateId && userScope.candidateIds && userScope.candidateIds.length > 0) {
    if (!userScope.candidateIds.includes('ALL') && !userScope.candidateIds.includes(target.candidateId)) {
      return false;
    }
  }

  return true;
}

/**
 * Unified check verifying both Permission and Scope.
 */
export function canAccessUI(
  user: UserSessionProfile | null | undefined,
  requiredPermissions?: PermissionCode | PermissionCode[],
  targetScope?: ResourceScopeTarget
): { allowed: boolean; reason?: 'NO_SESSION' | 'MISSING_PERMISSION' | 'SCOPE_RESTRICTED' } {
  if (!user) return { allowed: false, reason: 'NO_SESSION' };

  if (requiredPermissions && !hasPermission(user.permissions, requiredPermissions)) {
    return { allowed: false, reason: 'MISSING_PERMISSION' };
  }

  if (targetScope && !hasScope(user.scope, targetScope)) {
    return { allowed: false, reason: 'SCOPE_RESTRICTED' };
  }

  return { allowed: true };
}

/**
 * Business authorization check for executing a sensitive operation.
 */
export function canExecute(
  action: PermissionCode,
  user: UserSessionProfile | null | undefined,
  targetScope?: ResourceScopeTarget
): boolean {
  if (!user) return false;
  return hasPermission(user.permissions, action) && hasScope(user.scope, targetScope);
}

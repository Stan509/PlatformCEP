import {
  ADMIN_AUDIT,
  ADMIN_DEVICES,
  ADMIN_ELECTIONS,
  ADMIN_INCIDENTS,
  ADMIN_RELEASES,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Client API admin simulé (démo). En production : appels DRF avec JWT/RBAC. */
export const adminApi = {
  async elections() { await delay(400); return ADMIN_ELECTIONS; },
  async devices() { await delay(400); return ADMIN_DEVICES; },
  async incidents() { await delay(400); return ADMIN_INCIDENTS; },
  async audit() { await delay(400); return ADMIN_AUDIT; },
  async releases() { await delay(400); return ADMIN_RELEASES; },
};

/** Types du moteur local-first CEP (Document Maître §24-25). */

/** Statut de synchronisation d'une transaction locale. */
export type LocalSyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'BLOCKED';

/** Transaction hors ligne — signée, séquencée, protégée contre le replay. */
export interface LocalTransaction {
  transactionId: string;
  deviceId: string;
  /** Séquence strictement croissante par appareil (serveur fait foi). */
  sequence: number;
  createdAt: string;
  /** Hash SHA-256 du payload. */
  payloadHash: string;
  /** Signature (Ed25519 en production via le core Rust). */
  signature: string;
  /** Hash de la transaction précédente — chaîne anti-rollback. */
  previousHash: string | null;
  /** Contenu applicatif chiffré/sérialisé (jamais d'identité en clair). */
  payload: Record<string, unknown>;
  syncStatus: LocalSyncStatus;
}

/** Interface d'un apposeur de signature (remplacé par Rust en production). */
export interface Signer {
  sign(payload: Record<string, unknown>): Promise<string>;
  verify(payload: Record<string, unknown>, signature: string): Promise<boolean>;
}

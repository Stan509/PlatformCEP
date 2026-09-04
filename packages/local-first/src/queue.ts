import type { LocalSyncStatus, LocalTransaction, Signer } from './types.js';
import { hashObject } from './signer.js';

const STORAGE_KEY = 'cep.local-first.queue';

/**
 * File de transactions locale (offline-first, Document Maître §24-25).
 *
 * Chaque transaction est :
 * - identifiée (transactionId) ;
 * - séquencée (sequence stricte par appareil) ;
 * - hachée (payloadHash) ;
 * - signée via le `Signer` ;
 * - chaînée (previousHash) — anti-rollback ;
 * - conservée localement (chiffrée côté app) ;
 * - synchronisée dès que le réseau revient.
 *
 * Le serveur (Go sync-service) vérifie la signature et la monotonie de séquence —
 * il ne fait jamais confiance au compteur client.
 */
export class LocalQueue {
  private items: LocalTransaction[] = [];
  private lastHash: string | null = null;

  constructor(
    private readonly deviceId: string,
    private readonly signer: Signer,
    private readonly persistence: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage,
  ) {
    this.load();
  }

  private load(): void {
    try {
      const raw = this.persistence.getItem(STORAGE_KEY);
      if (raw) {
        this.items = JSON.parse(raw) as LocalTransaction[];
        // Reconstruit la chaîne à partir de la dernière transaction synchronisée.
        const last = [...this.items].reverse().find((tx) => tx.syncStatus === 'SYNCED');
        this.lastHash = last ? last.payloadHash : null;
      }
    } catch {
      this.items = [];
    }
  }

  private persist(): void {
    try {
      this.persistence.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      /* stockage plein — l'app doit gérer l'erreur sans perte silencieuse. */
    }
  }

  /** Ajoute une transaction signée à la file. */
  async enqueue(kind: string, payload: Record<string, unknown>): Promise<LocalTransaction> {
    const sequence = this.items.length === 0 ? 1 : Math.max(...this.items.map((tx) => tx.sequence)) + 1;
    const payloadHash = await hashObject(payload);
    const signature = await this.signer.sign(payload);
    const tx: LocalTransaction = {
      transactionId: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      deviceId: this.deviceId,
      sequence,
      createdAt: new Date().toISOString(),
      payloadHash,
      signature,
      previousHash: this.lastHash,
      payload,
      syncStatus: 'PENDING',
    };
    this.items.push(tx);
    this.lastHash = payloadHash;
    this.persist();
    return tx;
  }

  /** Transactions en attente de synchronisation (FIFO). */
  pending(): LocalTransaction[] {
    return this.items.filter((tx) => tx.syncStatus === 'PENDING');
  }

  /** Transactions erronées/bloquées. */
  failures(): LocalTransaction[] {
    return this.items.filter((tx) => tx.syncStatus === 'ERROR' || tx.syncStatus === 'BLOCKED');
  }

  /** Marque une transaction synchronisée. */
  markSynced(transactionId: string): void {
    this.updateStatus(transactionId, 'SYNCED');
  }

  /** Marque une transaction en erreur. */
  markError(transactionId: string, _reason?: string): void {
    this.updateStatus(transactionId, 'ERROR');
  }

  private updateStatus(transactionId: string, status: LocalSyncStatus): void {
    this.items = this.items.map((tx) => (tx.transactionId === transactionId ? { ...tx, syncStatus: status } : tx));
    this.persist();
  }

  /** Nombre total de transactions locales. */
  get size(): number {
    return this.items.length;
  }
}

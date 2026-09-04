import type { Signer } from './types.js';

/** SHA-256 via WebCrypto (SUBTLE) — disponible en contexte sécurisé/localhost. */
async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Signe de DÉMONSTRATION (HMAC-like, basé sur deviceId).
 *
 * ⚠️ Ce n'est PAS une signature Ed25519. En production, la transaction est
 * signée par le keystore matériel / le core Rust (`@cep/crypto-core`) sur
 * l'appareil. Ce module reproduit le contrat (sign / verify) pour démontrer la
 * file de synchronisation offline-first.
 */
export class DemoSigner implements Signer {
  constructor(private readonly deviceId: string) {}

  async sign(payload: Record<string, unknown>): Promise<string> {
    return sha256(`${JSON.stringify(payload)}|${this.deviceId}`);
  }

  async verify(payload: Record<string, unknown>, signature: string): Promise<boolean> {
    return (await this.sign(payload)) === signature;
  }
}

/** Hash SHA-256 d'un objet (utilisé pour payloadHash / previousHash). */
export async function hashObject(value: unknown): Promise<string> {
  return sha256(JSON.stringify(value));
}

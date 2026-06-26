import { encrypt } from 'eciesjs'

/**
 * Encrypts LLM credentials for the Golden Node TEE executor.
 * Compatible with Python eciespy (secp256k1 + AES-256-GCM, 12-byte nonce).
 */
export async function encryptSecrets(
  executorPubKeyHex: string,
  secrets: Record<string, string>
): Promise<Uint8Array> {
  const secretsJson = JSON.stringify(secrets)
  const pubKeyBytes = Buffer.from(executorPubKeyHex.startsWith('0x') ? executorPubKeyHex.slice(2) : executorPubKeyHex, 'hex')
  const plaintext = Buffer.from(secretsJson, 'utf8')
  return encrypt(pubKeyBytes, plaintext)
}

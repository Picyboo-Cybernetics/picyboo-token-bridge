import { createHash, createHmac, timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto';

export type ChecksumAlgorithm = 'sha256' | 'sha512' | 'blake2b512';
export type SignatureAlgorithm = 'hmac-sha256' | 'hmac-sha512';

const HASH_ALIASES: Record<ChecksumAlgorithm, string> = {
  sha256: 'sha256',
  sha512: 'sha512',
  blake2b512: 'blake2b512',
};

const HMAC_ALIASES: Record<SignatureAlgorithm, string> = {
  'hmac-sha256': 'sha256',
  'hmac-sha512': 'sha512',
};

export function createChecksum(buffer: Buffer, algorithm: ChecksumAlgorithm = 'sha256'): string {
  const hash = createHash(HASH_ALIASES[algorithm]);
  hash.update(buffer);
  return hash.digest('hex');
}

export function verifyChecksum(buffer: Buffer, expected: string, algorithm: ChecksumAlgorithm = 'sha256'): boolean {
  const actual = createChecksum(buffer, algorithm);
  return timingSafeEqual(actual, expected);
}

export function createSignature(buffer: Buffer, key: Buffer | string, algorithm: SignatureAlgorithm = 'hmac-sha256'): string {
  const hmac = createHmac(HMAC_ALIASES[algorithm], key);
  hmac.update(buffer);
  return hmac.digest('hex');
}

export function verifySignature(buffer: Buffer, signature: string, key: Buffer | string, algorithm: SignatureAlgorithm = 'hmac-sha256'): boolean {
  const actual = createSignature(buffer, key, algorithm);
  return timingSafeEqual(actual, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const aBuffer = Buffer.from(a, 'hex');
    const bBuffer = Buffer.from(b, 'hex');
    if (aBuffer.length === 0 || bBuffer.length === 0) {
      return false;
    }
    if (aBuffer.length !== bBuffer.length) {
      return false;
    }
    return cryptoTimingSafeEqual(aBuffer, bBuffer);
  } catch {
    return false;
  }
}

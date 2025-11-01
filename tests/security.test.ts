import { describe, expect, it } from 'vitest';
import { createChecksum, verifyChecksum, createSignature, verifySignature } from '../src/lib/security.js';

const data = Buffer.from('hello-world');

describe('security helpers', () => {
  it('generates stable checksums', () => {
    const checksum = createChecksum(data, 'sha256');
    expect(checksum).toMatch(/^[0-9a-f]+$/);
    expect(verifyChecksum(data, checksum, 'sha256')).toBe(true);
  });

  it('creates and verifies hmac signatures', () => {
    const key = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
    const signature = createSignature(data, key, 'hmac-sha256');
    expect(signature).toMatch(/^[0-9a-f]+$/);
    expect(verifySignature(data, signature, key, 'hmac-sha256')).toBe(true);
  });
});

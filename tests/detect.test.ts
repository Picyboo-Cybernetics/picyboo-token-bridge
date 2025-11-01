import { describe, expect, it } from 'vitest';
import { detectEncoding } from '../src/lib/detect.js';

describe('detectEncoding', () => {
  it('detects hex data', () => {
    const result = detectEncoding('deadbeef');
    expect(result.encoding).toBe('hex');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('detects base58 payloads', () => {
    const result = detectEncoding('72k1xXWE6YyPQCPqRY');
    expect(result.encoding).toBe('base58');
  });

  it('defaults gracefully when unsure', () => {
    const result = detectEncoding('');
    expect(result.confidence).toBe(0);
  });
});

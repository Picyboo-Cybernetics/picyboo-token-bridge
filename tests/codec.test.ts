import { describe, expect, it } from 'vitest';
import { convertToken, decodeToken, encodeToken } from '../src/lib/codec.js';

const hex = '48656c6c6f2050494359424f4f';
const base64 = 'SGVsbG8gUElDWUJPTw==';
const base58 = '72k1xXWE6YyPQCPqRY';

describe('codec', () => {
  it('encodes and decodes hex', () => {
    const buffer = decodeToken(hex, 'hex');
    expect(encodeToken(buffer, 'hex')).toEqual(hex);
  });

  it('converts between formats', () => {
    expect(convertToken(hex, { inputEncoding: 'hex', outputEncoding: 'base64' })).toEqual(base64);
    expect(convertToken(base64, { inputEncoding: 'base64', outputEncoding: 'base58' })).toEqual(base58);
  });
});

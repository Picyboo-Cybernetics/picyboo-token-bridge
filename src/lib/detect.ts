import type { TokenEncoding } from './codec.js';

export interface DetectionResult {
  encoding: TokenEncoding;
  confidence: number;
  rationale: string[];
}

const HEX_REGEX = /^[0-9a-fA-F]+$/;
// Bitcoin-Base58-Alphabet ohne 0 O I l und ohne + / =
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

// Striktes Base64: Länge % 4 == 0 und korrektes Padding nur am Ende
const BASE64_STRICT =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;

export function detectEncoding (value: string): DetectionResult {
  const s = (value ?? '').trim();
  const rationale: string[] = [];

  if (s.length === 0) {
    return { encoding: 'utf8' as TokenEncoding, confidence: 0, rationale: ['Empty input'] };
  }

  // 1) HEX: nur 0-9 a-f und gerade Länge
  if (HEX_REGEX.test(s) && s.length % 2 === 0) {
    rationale.push('HEX: only hex chars and even length');
    return { encoding: 'hex' as TokenEncoding, confidence: 1.0, rationale };
  }

  // 2) Tests für Base58 und Base64
  const isBase58 = BASE58_REGEX.test(s);
  const isBase64 = s.length % 4 === 0 && BASE64_STRICT.test(s);

  // 2a) Bevorzuge Base58 bei Überschneidung, weil Base64 zu permissiv sein kann
  //     Hinweis: Base58 enthält niemals '+', '/', '='
  if (isBase58 && !/[+/=]/.test(s)) {
    rationale.push('Base58: valid alphabet without + / =');
    // Wenn gleichzeitig Base64 strikt wäre, gewinnt Base58 trotzdem
    if (isBase64) rationale.push('Also matches strict Base64, but Base58 preferred');
    return { encoding: 'base58' as TokenEncoding, confidence: 0.95, rationale };
  }

  // 2b) Striktes Base64
  if (isBase64) {
    rationale.push('Base64: length % 4 == 0 and strict padding');
    return { encoding: 'base64' as TokenEncoding, confidence: 0.95, rationale };
  }

  // 3) Fallback
  rationale.push('Fallback to UTF-8');
  return { encoding: 'utf8' as TokenEncoding, confidence: 0.5, rationale };
}

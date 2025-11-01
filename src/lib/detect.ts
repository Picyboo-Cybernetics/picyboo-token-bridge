import type { TokenEncoding } from './codec.js';

type DetectionRule = {
  encoding: TokenEncoding;
  description: string;
  score: (value: string) => number;
};

export interface DetectionResult {
  encoding: TokenEncoding;
  confidence: number;
  rationale: string[];
}

const BASE58_REGEX = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
const HEX_REGEX = /^[0-9a-fA-F]+$/;
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const detectionRules: DetectionRule[] = [
  {
    encoding: 'hex',
    description: 'Only hexadecimal characters and even length',
    score: (value) => {
      const cleaned = value.replace(/\s+/g, '');
      if (cleaned.length === 0) return 0;
      if (!HEX_REGEX.test(cleaned)) return 0;
      return cleaned.length % 2 === 0 ? 1 : 0.6;
    },
  },
  {
    encoding: 'base58',
    description: 'Alphabet restricted to Bitcoin-style Base58',
    score: (value) => {
      const trimmed = value.replace(/\s+/g, '');
      if (trimmed.length === 0) return 0;
      return BASE58_REGEX.test(trimmed) ? Math.min(1, trimmed.length / 64) : 0;
    },
  },
  {
    encoding: 'base64',
    description: 'Base64 padding and alphabet',
    score: (value) => {
      const trimmed = value.replace(/\s+/g, '');
      if (trimmed.length === 0) return 0;
      if (trimmed.length % 4 !== 0) return 0.3;
      return BASE64_REGEX.test(trimmed) ? Math.min(1, trimmed.length / 64) : 0;
    },
  },
];

export function detectEncoding(value: string): DetectionResult {
  const evaluations = detectionRules
    .map((rule) => ({
      rule,
      score: rule.score(value),
    }))
    .filter((entry) => entry.score > 0);

  const rationale = evaluations.map((entry) => `${entry.rule.encoding}: ${entry.rule.description} (score ${entry.score.toFixed(2)})`);

  const best = evaluations.sort((a, b) => b.score - a.score)[0];

  if (!best) {
    return {
      encoding: 'base64',
      confidence: 0,
      rationale: rationale.length ? rationale : ['No heuristics matched. Defaulting to base64.'],
    };
  }

  return {
    encoding: best.rule.encoding,
    confidence: Math.min(1, best.score),
    rationale: rationale.length ? rationale : [`${best.rule.encoding}: heuristic matched.`],
  };
}

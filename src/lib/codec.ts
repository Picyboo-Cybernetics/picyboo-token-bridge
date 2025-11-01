import bs58 from 'bs58';

export type TokenEncoding = 'hex' | 'base58' | 'base64';

export interface ConversionOptions {
  inputEncoding: TokenEncoding;
  outputEncoding: TokenEncoding;
}

const SUPPORTED_ENCODINGS: TokenEncoding[] = ['hex', 'base58', 'base64'];

export function isTokenEncoding(value: string): value is TokenEncoding {
  return (SUPPORTED_ENCODINGS as string[]).includes(value);
}

export function decodeToken(data: string, encoding: TokenEncoding): Buffer {
  switch (encoding) {
    case 'hex':
      return Buffer.from(data.replace(/\s+/g, ''), 'hex');
    case 'base58':
      return Buffer.from(bs58.decode(data.trim()));
    case 'base64':
      return Buffer.from(data.trim(), 'base64');
    default:
      throw new Error(`Unsupported encoding: ${encoding satisfies never}`);
  }
}

export function encodeToken(buffer: Buffer, encoding: TokenEncoding): string {
  switch (encoding) {
    case 'hex':
      return buffer.toString('hex');
    case 'base58':
      return bs58.encode(buffer);
    case 'base64':
      return buffer.toString('base64');
    default:
      throw new Error(`Unsupported encoding: ${encoding satisfies never}`);
  }
}

export function convertToken(data: string, options: ConversionOptions): string {
  const buffer = decodeToken(data, options.inputEncoding);
  return encodeToken(buffer, options.outputEncoding);
}

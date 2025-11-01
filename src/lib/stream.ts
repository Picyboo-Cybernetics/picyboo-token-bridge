import { Transform, type TransformCallback } from 'node:stream';
import type { TokenEncoding } from './codec.js';
import { decodeToken, encodeToken } from './codec.js';

type ChunkDecoder = {
  onChunk(chunk: string): Buffer;
  onFlush(): Buffer;
};

function createHexDecoder(): ChunkDecoder {
  let remainder = '';
  return {
    onChunk(chunk: string) {
      const combined = (remainder + chunk).replace(/\s+/g, '');
      const evenLength = combined.length - (combined.length % 2);
      remainder = combined.slice(evenLength);
      const slice = combined.slice(0, evenLength);
      return slice ? Buffer.from(slice, 'hex') : Buffer.alloc(0);
    },
    onFlush() {
      if (!remainder) {
        return Buffer.alloc(0);
      }
      if (remainder.length % 2 !== 0) {
        throw new Error('Unexpected odd-length hex payload at stream termination.');
      }
      const data = Buffer.from(remainder, 'hex');
      remainder = '';
      return data;
    },
  };
}

function createBase64Decoder(): ChunkDecoder {
  let remainder = '';
  return {
    onChunk(chunk: string) {
      const combined = (remainder + chunk).replace(/\s+/g, '');
      const length = combined.length - (combined.length % 4);
      remainder = combined.slice(length);
      const slice = combined.slice(0, length);
      return slice ? Buffer.from(slice, 'base64') : Buffer.alloc(0);
    },
    onFlush() {
      if (!remainder) {
        return Buffer.alloc(0);
      }
      const padded = (remainder + '===').slice(0, Math.ceil(remainder.length / 4) * 4);
      remainder = '';
      return Buffer.from(padded, 'base64');
    },
  };
}

function createBufferedDecoder(encoding: TokenEncoding): ChunkDecoder {
  let buffer = '';
  return {
    onChunk(chunk: string) {
      buffer += chunk.replace(/\s+/g, '');
      return Buffer.alloc(0);
    },
    onFlush() {
      const data = buffer;
      buffer = '';
      return data ? decodeToken(data, encoding) : Buffer.alloc(0);
    },
  };
}

function createEncoder(encoding: TokenEncoding) {
  return (buffer: Buffer) => encodeToken(buffer, encoding);
}

export interface ConversionStreamOptions {
  from: TokenEncoding;
  to: TokenEncoding;
}

export function createConversionStream(options: ConversionStreamOptions): Transform {
  const { from, to } = options;
  const decoder = from === 'hex' ? createHexDecoder() : from === 'base64' ? createBase64Decoder() : createBufferedDecoder(from);
  const encode = createEncoder(to);

  return new Transform({
    readableObjectMode: false,
    writableObjectMode: false,
    transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
      try {
        const decoded = decoder.onChunk(chunk.toString('utf8'));
        if (decoded.length > 0) {
          this.push(encode(decoded));
        }
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
    flush(callback: TransformCallback) {
      try {
        const decoded = decoder.onFlush();
        if (decoded.length > 0) {
          this.push(encode(decoded));
        }
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}

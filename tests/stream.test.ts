import { describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';
import { createConversionStream } from '../src/lib/stream.js';

function collect(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(data));
  });
}

describe('conversion stream', () => {
  it('converts chunked hex to base64', async () => {
    const readable = Readable.from(['4865', '6c6c', '6f']);
    const stream = readable.pipe(createConversionStream({ from: 'hex', to: 'base64' }));
    const result = await collect(stream);
    expect(result).toBe(Buffer.from('Hello', 'utf8').toString('base64'));
  });
});

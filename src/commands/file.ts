import { Command } from 'commander';
import { createReadStream, createWriteStream, openSync, readSync, closeSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createConversionStream } from '../lib/stream.js';
import { detectEncoding } from '../lib/detect.js';
import { isTokenEncoding } from '../lib/codec.js';

interface FileOptions {
  in: string;
  out: string;
  detect: boolean;
  output?: string;
}

export function registerFileCommand(program: Command): void {
  program
    .command('file')
    .description('Convert a file between encodings using streaming transforms')
    .argument('<path>', 'input file path')
    .option('--in <encoding>', 'hex|base58|base64', 'auto')
    .option('--out <encoding>', 'hex|base58|base64', 'hex')
    .option('-o, --output <path>', 'optional output file path')
    .option('--detect', 'emit detection insights on stderr', false)
    .action(async (path: string, options: FileOptions) => {
      const inputData = options.in === 'auto' ? detectEncodingFromFile(path, options.detect) : options.in;
      if (!isTokenEncoding(inputData)) {
        throw new Error(`Unsupported input encoding: ${options.in}`);
      }
      if (!isTokenEncoding(options.out)) {
        throw new Error(`Unsupported output encoding: ${options.out}`);
      }

      const readStream = createReadStream(path, { encoding: 'utf8' });
      const convertStream = createConversionStream({ from: inputData, to: options.out });
      const writeStream = options.output ? createWriteStream(options.output, { encoding: 'utf8' }) : undefined;

      if (writeStream) {
        await pipeline(readStream, convertStream, writeStream);
      } else {
        await pipeline(readStream, convertStream, process.stdout);
      }
    });
}

function detectEncodingFromFile(path: string, verbose: boolean): string {
  const fd = openSync(path, 'r');
  try {
    const buffer = Buffer.alloc(4096);
    const bytesRead = readSync(fd, buffer, 0, buffer.length, 0);
    if (bytesRead === 0) {
      throw new Error('Unable to detect encoding from empty file. Provide --in explicitly.');
    }
    const preview = buffer.slice(0, bytesRead).toString('utf8');
    const detection = detectEncoding(preview);
    if (verbose) {
      console.error(`Detected ${detection.encoding} (confidence ${(detection.confidence * 100).toFixed(1)}%)`);
      for (const rationale of detection.rationale) {
        console.error(` • ${rationale}`);
      }
    }
    return detection.encoding;
  } finally {
    closeSync(fd);
  }
}

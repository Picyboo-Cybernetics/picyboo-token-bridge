import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { createSignature, verifySignature } from '../lib/security.js';

interface SignOptions {
  file?: string;
  key?: string;
  keyFile?: string;
  algorithm: 'hmac-sha256' | 'hmac-sha512';
  verify?: string;
}

export function registerSignCommand(program: Command): void {
  program
    .command('sign')
    .description('Produce or verify HMAC signatures for auditability checks')
    .argument('[data]', 'token data (omit when using --file)')
    .option('-k, --key <key>', 'secret key as hex string')
    .option('--key-file <path>', 'load key from file instead of CLI option')
    .option('-f, --file <path>', 'read data from file instead of argument')
    .option('-a, --algorithm <algorithm>', 'hmac-sha256|hmac-sha512', 'hmac-sha256')
    .option('--verify <signature>', 'signature to validate')
    .action((data: string | undefined, options: SignOptions) => {
      const payload = options.file ? readFileSync(options.file) : Buffer.from(data ?? '', 'utf8');
      const key = resolveKey(options);
      const signature = createSignature(payload, key, options.algorithm);

      if (options.verify) {
        const ok = verifySignature(payload, options.verify, key, options.algorithm);
        if (!ok) {
          console.error('Signature mismatch.');
          process.exitCode = 1;
          return;
        }
        console.log('Signature verified.');
        return;
      }

      console.log(signature);
    });
}

function resolveKey(options: SignOptions): Buffer {
  if (options.keyFile) {
    return readFileSync(options.keyFile);
  }
  if (!options.key) {
    throw new Error('Missing key: provide --key <hex> or --key-file <path>.');
  }
  const normalized = options.key.startsWith('0x') ? options.key.slice(2) : options.key;
  if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length % 2 !== 0) {
    throw new Error('Key must be an even-length hex string.');
  }
  return Buffer.from(normalized, 'hex');
}

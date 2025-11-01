import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { createChecksum, verifyChecksum } from '../lib/security.js';

interface ChecksumOptions {
  file?: string;
  algorithm: 'sha256' | 'sha512' | 'blake2b512';
  verify?: string;
}

export function registerChecksumCommand(program: Command): void {
  program
    .command('checksum')
    .description('Create or verify cryptographic checksums for payloads')
    .argument('[data]', 'token data (omit when using --file)')
    .option('-f, --file <path>', 'read data from file instead of argument')
    .option('-a, --algorithm <algorithm>', 'sha256|sha512|blake2b512', 'sha256')
    .option('--verify <checksum>', 'expected checksum to verify against')
    .action((data: string | undefined, options: ChecksumOptions) => {
      const payload = options.file ? readFileSync(options.file) : Buffer.from(data ?? '', 'utf8');
      const checksum = createChecksum(payload, options.algorithm);

      if (options.verify) {
        const ok = verifyChecksum(payload, options.verify, options.algorithm);
        if (!ok) {
          console.error('Checksum mismatch.');
          process.exitCode = 1;
          return;
        }
        console.log('Checksum verified.');
        return;
      }

      console.log(checksum);
    });
}

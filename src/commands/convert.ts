import { Command } from 'commander';
import { convertToken, isTokenEncoding } from '../lib/codec.js';
import { detectEncoding } from '../lib/detect.js';

export function registerConvertCommand(program: Command): void {
  program
    .command('convert')
    .description('Convert token data between encodings')
    .argument('<data>', 'token payload')
    .option('--in <encoding>', 'hex|base58|base64', 'auto')
    .option('--out <encoding>', 'hex|base58|base64', 'hex')
    .option('--verbose', 'print detection rationale when auto-detecting', false)
    .action((data: string, options: { in: string; out: string; verbose?: boolean }) => {
      const detection = options.in === 'auto' ? detectEncoding(data) : undefined;
      const inputEncoding = detection ? detection.encoding : options.in;

      if (!isTokenEncoding(inputEncoding)) {
        throw new Error(`Unsupported input encoding: ${options.in}`);
      }
      if (!isTokenEncoding(options.out)) {
        throw new Error(`Unsupported output encoding: ${options.out}`);
      }

      if (detection && options.verbose) {
        console.error(`Detected ${detection.encoding} (confidence ${(detection.confidence * 100).toFixed(1)}%)`);
        for (const rationale of detection.rationale) {
          console.error(` • ${rationale}`);
        }
      }

      const result = convertToken(data, {
        inputEncoding,
        outputEncoding: options.out,
      });
      console.log(result);
    });
}

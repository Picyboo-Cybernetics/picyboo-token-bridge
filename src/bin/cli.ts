#!/usr/bin/env node
import { Command } from 'commander';
import packageJson from '../../package.json' with { type: 'json' };
import { registerConvertCommand } from '../commands/convert.js';
import { registerFileCommand } from '../commands/file.js';
import { registerChecksumCommand } from '../commands/checksum.js';
import { registerSignCommand } from '../commands/sign.js';

const program = new Command();

program
  .name('pbbridge')
  .description('PICYBOO token bridge toolbox for working with offline tokens')
  .version(packageJson.version);

registerConvertCommand(program);
registerFileCommand(program);
registerChecksumCommand(program);
registerSignCommand(program);

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { program } from 'commander';
import bs58 from 'bs58';
import { readFileSync, writeFileSync } from 'fs';

function bufFrom(data, fmt){
  if(fmt==='hex') return Buffer.from(data, 'hex');
  if(fmt==='base58') return Buffer.from(bs58.decode(data));
  if(fmt==='base64') return Buffer.from(data, 'base64');
  throw new Error('Unsupported input fmt: '+fmt);
}
function strTo(buf, fmt){
  if(fmt==='hex') return buf.toString('hex');
  if(fmt==='base58') return bs58.encode(buf);
  if(fmt==='base64') return buf.toString('base64');
  throw new Error('Unsupported output fmt: '+fmt);
}

program.name('pbbridge').description('PICYBOO token bridge').version('0.1.0');

program.command('encode')
  .requiredOption('--in <fmt>', 'hex|base58|base64')
  .requiredOption('--out <fmt>', 'hex|base58|base64')
  .argument('<data>')
  .action((data, opts)=>{
    const out = strTo(bufFrom(data.trim(), opts.in), opts.out);
    console.log(out);
  });

program.command('file')
  .requiredOption('--in <fmt>','hex|base58|base64')
  .requiredOption('--out <fmt>','hex|base58|base64')
  .argument('<path>')
  .option('-o, --output <path>')
  .action((path, opts)=>{
    const raw = readFileSync(path, 'utf8').trim();
    const out = strTo(bufFrom(raw, opts.in), opts.out);
    if(opts.output) writeFileSync(opts.output, out); else console.log(out);
  });

program.parse();

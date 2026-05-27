/**
 * File-based fundamentals cache (Node). One JSON per ticker under cache/.
 * Each block: { fetchedAt, ttlMs, data } — refresh when Date.now() > fetchedAt + ttlMs.
 * Writes: temp file + atomic rename to avoid torn JSON on crash.
 *
 * Usage (from repo root or pass CACHE_DIR):
 *   node Nexus/scripts/fundamentals-cache.mjs get NVDA fundamentals_revenue_net
 *   node Nexus/scripts/fundamentals-cache.mjs set NVDA fundamentals_revenue_net '{"revB":61}'
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve TTL (ms) from block id — order matters (e.g. "eps" before "pe"). */
export function ttlForBlock(blockName){
  const b = String(blockName || '').toLowerCase();
  if(b.includes('quote')) return 30_000;
  if(b.includes('revenue') || b.includes('net_income') || b.endsWith('_ni')) return 7_776_000_000;
  if(b.includes('eps') || b.includes('beta')) return 604_800_000;
  if(b.includes('analyst') || b.includes('recommendation') || b.includes('sentiment')) return 604_800_000;
  if(b.includes('52w') || b.includes('mcap') || b.includes('_pe') || b.includes('pe_ratio')) return 86_400_000;
  if(b.includes('pe')) return 86_400_000;
  return 86_400_000;
}

const SCHEMA_VERSION = 1;

export function cacheDir(){
  const fromEnv = process.env.NEXUS_CACHE_DIR;
  if(fromEnv && fromEnv.trim()) return path.resolve(fromEnv.trim());
  return path.resolve(__dirname, '..', 'cache');
}

function tickerPath(sym){
  const s = String(sym || '').trim().toUpperCase().replace(/[^A-Z0-9._-]/g, '');
  if(!s) throw new Error('Invalid symbol');
  return path.join(cacheDir(), `${s}.json`);
}

function atomicWriteJson(filePath, obj){
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const payload = JSON.stringify(obj, null, 2);
  const tmp = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, payload, 'utf8');
  fs.renameSync(tmp, filePath);
}

export function readTickerDoc(sym){
  const p = tickerPath(sym);
  if(!fs.existsSync(p)) return null;
  try{
    const raw = fs.readFileSync(p, 'utf8');
    const j = JSON.parse(raw);
    if(!j || typeof j !== 'object' || j.schemaVersion !== SCHEMA_VERSION) return null;
    if(!j.blocks || typeof j.blocks !== 'object') return null;
    j.symbol = String(j.symbol || sym).toUpperCase();
    return j;
  }catch{
    return null;
  }
}

export function writeTickerDoc(sym, doc){
  const s = String(sym || '').trim().toUpperCase();
  const out = {
    schemaVersion: SCHEMA_VERSION,
    symbol: s,
    blocks: doc && typeof doc.blocks === 'object' ? doc.blocks : {},
  };
  atomicWriteJson(tickerPath(s), out);
}

/** @returns {{ stale: boolean, block: object|null, doc: object }} */
export function getBlock(sym, blockName){
  const doc = readTickerDoc(sym) || { schemaVersion: SCHEMA_VERSION, symbol: sym.toUpperCase(), blocks: {} };
  const b = doc.blocks[blockName];
  if(!b || typeof b.fetchedAt !== 'number' || !b.data){
    return { stale: true, block: null, doc };
  }
  const ttl = typeof b.ttlMs === 'number' && b.ttlMs > 0 ? b.ttlMs : 86_400_000;
  const stale = Date.now() > b.fetchedAt + ttl;
  return { stale, block: b, doc };
}

export function setBlock(sym, blockName, data, ttlMs){
  const doc = readTickerDoc(sym) || { schemaVersion: SCHEMA_VERSION, symbol: sym.toUpperCase(), blocks: {} };
  doc.blocks = doc.blocks && typeof doc.blocks === 'object' ? { ...doc.blocks } : {};
  doc.blocks[blockName] = {
    fetchedAt: Date.now(),
    ttlMs: typeof ttlMs === 'number' && ttlMs > 0 ? ttlMs : 86_400_000,
    data: data && typeof data === 'object' ? data : {},
  };
  writeTickerDoc(sym, doc);
  return doc.blocks[blockName];
}

export function invalidateBlock(sym, blockName){
  const doc = readTickerDoc(sym);
  if(!doc || !doc.blocks[blockName]) return false;
  delete doc.blocks[blockName];
  writeTickerDoc(sym, doc);
  return true;
}

function cli(){
  const [, , cmd, sym, block, jsonStr] = process.argv;
  if(!cmd || (cmd !== 'get' && cmd !== 'set' && cmd !== 'invalidate')){
    console.error(`Usage:
  NEXUS_CACHE_DIR=./my-cache  node Nexus/scripts/fundamentals-cache.mjs get <SYMBOL> <BLOCK>
  node Nexus/scripts/fundamentals-cache.mjs set <SYMBOL> <BLOCK> '<JSON>'
  node Nexus/scripts/fundamentals-cache.mjs invalidate <SYMBOL> <BLOCK>`);
    process.exit(1);
  }
  if(!sym || !block){
    console.error('Missing SYMBOL or BLOCK');
    process.exit(1);
  }
  if(cmd === 'get'){
    const { stale, block: b } = getBlock(sym, block);
    console.log(JSON.stringify({ stale, block: b }, null, 2));
    process.exit(0);
  }
  if(cmd === 'invalidate'){
    const ok = invalidateBlock(sym, block);
    console.log(JSON.stringify({ ok }));
    process.exit(0);
  }
  let data = {};
  try{
    data = jsonStr ? JSON.parse(jsonStr) : {};
  }catch(e){
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }
  const ttl = ttlForBlock(block);
  const saved = setBlock(sym, block, data, ttl);
  console.log(JSON.stringify({ ok: true, saved }, null, 2));
}

if(process.argv[1] && process.argv[1].endsWith('fundamentals-cache.mjs')) cli();

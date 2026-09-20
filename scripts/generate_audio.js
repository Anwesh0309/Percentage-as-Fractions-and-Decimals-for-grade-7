// Offline ElevenLabs audio generator.           Usage:  npm run audio
//
//   node scripts/generate_audio.js               generate every missing MP3 (skips files that already exist)
//   node scripts/generate_audio.js --dry-run     show what would be generated (no API calls, no credits used)
//   node scripts/generate_audio.js --force       regenerate everything
//   node scripts/generate_audio.js --only=w3_    only keys that start with "w3_" (handy for small quotas)
//   node scripts/generate_audio.js --limit=50    stop after 50 API calls (resume later — existing files are skipped)
//
// Reads every phrase from src/data/narration.js (the single source of truth), converts it to spoken words
// (src/utils/speech.js), applies the per-style ElevenLabs voice settings (src/utils/voiceSettings.js),
// saves MP3s to public/assets/audio/ and rebuilds src/utils/audioMap.js.
// Rate limit: 500 ms between API calls.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { narrationEntries } from '../src/data/narration.js';
import { toSpeech } from '../src/utils/speech.js';
import { VOICE_ID, MODEL_ID, getVoiceSettings } from '../src/utils/voiceSettings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

const OUT_DIR = path.join(ROOT, 'public/assets/audio');
const MAP_FILE = path.join(ROOT, 'src/utils/audioMap.js');
const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
const DELAY_MS = 500;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1];
const DRY = flag('dry-run');
const FORCE = flag('force');
const ONLY = opt('only');
const LIMIT = opt('limit') ? parseInt(opt('limit'), 10) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (file) => fs.existsSync(file) && fs.statSync(file).size > 0;

// ── Build the phrase list (dedupe identical spoken text + style so credits are not wasted) ──
const phrases = [];               // unique audio files to make
const aliasOf = new Map();        // key -> key of the phrase whose file it shares
const seen = new Map();           // "spoken|style" -> first key
for (const e of narrationEntries) {
  const spoken = toSpeech(e.text);
  const sig = `${spoken}|${e.style}`;
  if (seen.has(sig)) { aliasOf.set(e.key, seen.get(sig)); continue; }
  seen.set(sig, e.key);
  phrases.push({ key: e.key, spoken, style: e.style, file: `${e.key}.mp3` });
}

async function synthesize({ spoken, style }) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { Accept: 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': API_KEY },
      body: JSON.stringify({ text: spoken, model_id: MODEL_ID, voice_settings: getVoiceSettings(style) }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());

    const body = await res.text();
    if (res.status === 429 || res.status >= 500) {            // rate-limited / server hiccup → back off and retry
      const wait = 1500 * attempt;
      console.warn(`   ⏳ ${res.status} — retrying in ${wait} ms (attempt ${attempt}/4)`);
      await sleep(wait);
      continue;
    }
    const fatal = new Error(`ElevenLabs API error ${res.status}: ${body.slice(0, 300)}`);
    fatal.fatal = res.status === 401 || /quota/i.test(body);
    throw fatal;
  }
  throw new Error('Gave up after 4 attempts');
}

function writeAudioMap() {
  const map = {};
  for (const e of narrationEntries) {
    const owner = aliasOf.get(e.key) || e.key;
    const file = `${owner}.mp3`;
    if (!exists(path.join(OUT_DIR, file))) continue;         // only map files that really exist
    const url = `/assets/audio/${file}`;
    map[toSpeech(e.text)] = url;
    map[`key:${e.key}`] = url;
  }
  const code = `// Auto-generated Audio Asset Map\n// Populated by:  npm run audio   (scripts/generate_audio.js)\n// Key   : the exact spoken text  (and "key:<narration key>" aliases)\n// Value : path of the pre-generated MP3 in /public/assets/audio\nexport const audioMap = ${JSON.stringify(map, null, 2)};\nexport default audioMap;\n`;
  fs.writeFileSync(MAP_FILE, code, 'utf-8');
  return Object.keys(map).filter((k) => k.startsWith('key:')).length;
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let todo = phrases.filter((p) => (!ONLY || p.key.startsWith(ONLY)) && (FORCE || !exists(path.join(OUT_DIR, p.file))));
  const chars = todo.reduce((n, p) => n + p.spoken.length, 0);
  console.log(`🎙️  Voice: Alice (${VOICE_ID}) · model ${MODEL_ID}`);
  console.log(`📋 ${narrationEntries.length} narration lines → ${phrases.length} unique audio files`);
  console.log(`🔎 To generate now: ${todo.length} files (~${chars.toLocaleString()} characters)${ONLY ? `  [only "${ONLY}*"]` : ''}`);

  if (DRY) {
    todo.slice(0, 8).forEach((p) => console.log(`   • ${p.file}  [${p.style}]  "${p.spoken.slice(0, 70)}${p.spoken.length > 70 ? '…' : ''}"`));
    if (todo.length > 8) console.log(`   … and ${todo.length - 8} more`);
    console.log('\n(dry run — nothing was generated)');
    return;
  }
  if (!API_KEY && todo.length > 0) {
    console.error('\n❌ No ElevenLabs API key found. Add  ELEVENLABS_API_KEY=...  to .env.local (see .env.example).');
    process.exit(1);
  }

  todo = todo.slice(0, LIMIT);
  let ok = 0, failed = 0, aborted = false;
  for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    process.stdout.write(`🗣️  [${i + 1}/${todo.length}] ${p.file} (${p.style}) … `);
    try {
      const buf = await synthesize(p);
      fs.writeFileSync(path.join(OUT_DIR, p.file), buf);
      console.log(`✅ ${(buf.length / 1024).toFixed(0)} KB`);
      ok++;
    } catch (err) {
      console.log('❌');
      console.error(`   ${err.message}`);
      failed++;
      if (err.fatal) {
        console.error('\n⛔ Stopping: invalid API key or quota used up. Fix it and run  npm run audio  again — finished files are kept.');
        aborted = true;
        break;
      }
    }
    if (i < todo.length - 1) await sleep(DELAY_MS);
  }

  const mapped = writeAudioMap();
  const remaining = phrases.filter((p) => !exists(path.join(OUT_DIR, p.file))).length;
  console.log(`\n🎉 Done — generated ${ok}, failed ${failed}. audioMap.js now maps ${mapped}/${narrationEntries.length} narration lines.`);
  if (remaining > 0) console.log(`ℹ️  ${remaining} audio file(s) still missing${aborted ? '' : ' — run again to retry'}. Missing lines use the browser voice until then.`);
}

run().catch((e) => { console.error(e); process.exit(1); });

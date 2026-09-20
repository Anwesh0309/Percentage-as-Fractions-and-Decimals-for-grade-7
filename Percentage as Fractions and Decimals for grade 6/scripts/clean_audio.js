// Removes orphaned MP3s that are no longer referenced by src/utils/audioMap.js.   Usage: npm run audio:clean
//   node scripts/clean_audio.js --dry-run   → only list what would be deleted

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { audioMap } from '../src/utils/audioMap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '../public/assets/audio');
const DRY = process.argv.includes('--dry-run');

const referenced = new Set(Object.values(audioMap).map((p) => path.basename(p)));
if (referenced.size === 0) {
  console.error('audioMap.js is empty — refusing to delete anything. Run  npm run audio  first.');
  process.exit(1);
}
if (!fs.existsSync(AUDIO_DIR)) { console.log('No audio folder yet — nothing to clean.'); process.exit(0); }

let removed = 0;
for (const file of fs.readdirSync(AUDIO_DIR)) {
  if (!file.endsWith('.mp3') || referenced.has(file)) continue;
  console.log(`${DRY ? 'would delete' : '🗑️  deleting'} ${file}`);
  if (!DRY) fs.unlinkSync(path.join(AUDIO_DIR, file));
  removed++;
}
console.log(`\n${DRY ? 'Would remove' : 'Removed'} ${removed} orphaned file(s). ${referenced.size} file(s) in use.`);

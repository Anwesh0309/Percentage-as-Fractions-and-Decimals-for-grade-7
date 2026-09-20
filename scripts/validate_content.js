// Content validator:  npm run validate
// Re-checks every practice question numerically and makes sure all narration converts to clean spoken words.

import { staticQuestionBank } from '../src/data/questionBank.js';
import { narrationEntries } from '../src/data/narration.js';
import { detectiveCases, sorterRounds } from '../src/data/stationData.js';
import { parseValue, sameValue, gcd } from '../src/utils/mathValue.js';
import { toSpeech } from '../src/utils/speech.js';

const errors = [];
const err = (msg) => errors.push(msg);
const DIAGRAMS = ['grid', 'bar', 'numberline', 'card', 'battery', 'dots'];

// ── Practice questions ───────────────────────────────────────
let total = 0;
const ids = new Set();
for (let w = 1; w <= 10; w++) {
  const list = staticQuestionBank[w];
  if (!list || list.length !== 10) err(`World ${w}: expected 10 questions, found ${list ? list.length : 0}`);
  for (const q of list || []) {
    total++;
    const tag = q.id;
    if (ids.has(q.id)) err(`${tag}: duplicate id`);
    ids.add(q.id);
    if (q.options.length !== 4) err(`${tag}: needs exactly 4 options`);
    if (new Set(q.options).size !== q.options.length) err(`${tag}: duplicate options ${q.options}`);
    if (q.options.filter((o) => o === q.correctAnswer).length !== 1) err(`${tag}: correct answer must appear exactly once`);
    if (!q.prompt || !q.hint || !q.explanation) err(`${tag}: missing prompt/hint/explanation`);
    if (!DIAGRAMS.includes(q.diagram?.type)) err(`${tag}: unknown diagram type ${q.diagram?.type}`);
    if (q.diagram.type === 'grid' && !(q.diagram.shaded >= 0 && q.diagram.shaded <= 100)) err(`${tag}: bad grid`);
    if (q.diagram.type === 'bar' && q.diagram.filled > q.diagram.parts) err(`${tag}: bar filled > parts`);
    if (q.diagram.type === 'dots' && q.diagram.count > q.diagram.total) err(`${tag}: dots count > total`);

    const c = q.check || {};
    const wrongs = q.options.filter((o) => o !== q.correctAnswer);

    if (c.equal) {
      const [a, b] = c.equal;
      if (!sameValue(a, b)) err(`${tag}: ${a} !== ${b}`);
      if (Number.isNaN(parseValue(q.correctAnswer)) || !sameValue(q.correctAnswer, b)) err(`${tag}: correctAnswer ${q.correctAnswer} does not equal ${b}`);
    }
    if (c.simplest) {
      const [n, d] = c.simplest.split('/').map(Number);
      if (gcd(n, d) !== 1) err(`${tag}: ${c.simplest} is not in simplest form`);
    }
    if (c.notEqual) c.notEqual.forEach(([a, b]) => { if (sameValue(a, b)) err(`${tag}: distractor ${b} equals ${a}`); });
    if (c.oddOneOut) {
      const { ref, odd, same } = c.oddOneOut;
      if (sameValue(ref, odd)) err(`${tag}: odd one equals ref`);
      same.forEach((s) => { if (!sameValue(ref, s)) err(`${tag}: ${s} should equal ${ref}`); });
      if (q.correctAnswer !== odd) err(`${tag}: correctAnswer should be the odd one`);
    }
    if (c.compare) {
      const { kind, items, correct, lo, hi, than } = c.compare;
      const v = (s) => parseValue(s);
      const cv = v(correct);
      const others = items.filter((s) => s !== correct).map(v);
      const ok = {
        greatest: () => others.every((x) => cv > x + 1e-9),
        smallest: () => others.every((x) => cv < x - 1e-9),
        between: () => cv > lo && cv < hi && others.every((x) => !(x > lo && x < hi)),
        closest: () => others.every((x) => Math.abs(1 - cv) < Math.abs(1 - x) - 1e-9),
        greater: () => cv > than && others.every((x) => !(x > than + 1e-9)),
        less: () => cv < than && others.every((x) => !(x < than - 1e-9)),
      }[kind];
      if (!ok || !ok()) err(`${tag}: comparison '${kind}' is wrong or ambiguous for ${items}`);
      if (new Set(items.map(v).map((x) => x.toFixed(9))).size !== items.length && kind !== 'greater' && kind !== 'less') err(`${tag}: two choices have the same value`);
    }
    // No distractor may equal the correct answer numerically (except the deliberate "not simplified" trap)
    if (!c.simplest && !c.oddOneOut && !c.compare) {
      wrongs.forEach((wv) => {
        const a = parseValue(wv), b = parseValue(q.correctAnswer);
        if (!Number.isNaN(a) && !Number.isNaN(b) && Math.abs(a - b) < 1e-9) err(`${tag}: distractor ${wv} equals correct answer`);
      });
    }
  }
}

// ── Station data ─────────────────────────────────────────────
detectiveCases.forEach((cs) => {
  const others = cs.cards.filter((_, i) => i !== cs.imposter);
  const ref = parseValue(others[0]);
  others.forEach((o) => { if (!sameValue(others[0], o)) err(`Case ${cs.id}: ${o} does not match ${others[0]}`); });
  if (Math.abs(parseValue(cs.cards[cs.imposter]) - ref) < 1e-9) err(`Case ${cs.id}: imposter equals the others`);
});
sorterRounds.forEach((r) => {
  r.cards.forEach((c) => {
    if (Math.abs(parseValue(c.label) * 100 - c.value) > 1e-6) err(`Sorter round ${r.id}: ${c.label} is ${parseValue(c.label) * 100}% not ${c.value}%`);
    if (!r.slots.includes(c.value)) err(`Sorter round ${r.id}: no slot at ${c.value}%`);
  });
  if (new Set(r.cards.map((c) => c.value)).size !== r.cards.length) err(`Sorter round ${r.id}: two cards share a slot`);
});

// ── Narration / audio ────────────────────────────────────────
const keys = new Set();
let chars = 0;
const uniqueSpoken = new Map();
narrationEntries.forEach((e) => {
  if (keys.has(e.key)) err(`Duplicate narration key ${e.key}`);
  keys.add(e.key);
  const spoken = toSpeech(e.text);
  if (/[0-9%/=×÷−→]/.test(spoken)) err(`Narration ${e.key}: spoken text still has digits/symbols → "${spoken}"`);
  if (!uniqueSpoken.has(spoken + '|' + e.style)) { uniqueSpoken.set(spoken + '|' + e.style, e.key); chars += spoken.length; }
});

console.log(`Questions checked : ${total}`);
console.log(`Narration entries : ${narrationEntries.length} (${uniqueSpoken.size} unique audio files, ~${chars.toLocaleString()} characters)`);
if (errors.length) {
  console.error(`\n❌ ${errors.length} problem(s):`);
  errors.forEach((e) => console.error('  • ' + e));
  process.exit(1);
}
console.log('✅ All content checks passed.');

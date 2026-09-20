// 100 Deterministic Practice Questions across 10 Worlds (10 Questions per World)
// Topic: Percentage as Fractions and Decimals
//
// Answers are COMPUTED from the underlying numbers (not hand-typed) and distractors are built from
// real student misconceptions (slipping the decimal point the wrong way, forgetting to simplify,
// mixing up numerator/denominator, etc.).  Run `npm run validate` to re-check every question.
//
// Question shape (same as the previous module):
//   { id, worldId, difficulty, fact, prompt, diagram, options[4], correctAnswer, hint, explanation, check }
// `check` is metadata used ONLY by scripts/validate_content.js — the UI ignores it.

import { worldsData } from './worlds.js';
import { gcd, roundClean, percentToDecimal, toPercentString, parseValue } from '../utils/mathValue.js';

const difficultyOf = (w) => worldsData[w - 1].difficulty;

// Put the correct answer at a varied (but deterministic) position among the 4 options.
function arrange(correct, wrongs, w, i) {
  const pos = (i * 3 + w) % 4;
  const opts = [...wrongs];
  opts.splice(pos, 0, correct);
  return opts;
}

function mk(w, i, { fact, prompt, diagram, correct, wrongs, hint, explanation, check }) {
  return {
    id: `w${w}_q${i}`,
    worldId: w,
    difficulty: difficultyOf(w),
    fact,
    prompt,
    diagram,
    options: arrange(correct, wrongs, w, i),
    correctAnswer: correct,
    hint,
    explanation,
    check,
  };
}

const num = (x) => String(roundClean(x));

// ─────────────────────────────────────────────────────────────
// WORLD 1 — Meet Percent (percent = out of 100, from a hundred grid)
// ─────────────────────────────────────────────────────────────
const w1 = [
  { prompt: 'The hundred grid has 37 shaded squares. What percent of the grid is shaded?', diagram: { type: 'grid', shaded: 37 }, correct: '37%', wrongs: ['63%', '73%', '3.7%'], hint: 'The grid has 100 squares in all. The number of shaded squares out of 100 is the percent.', explanation: '37 out of 100 squares are shaded, so 37%.' },
  { prompt: 'Only 8 squares on the hundred grid are shaded. What percent is shaded?', diagram: { type: 'grid', shaded: 8 }, correct: '8%', wrongs: ['80%', '92%', '0.8%'], hint: 'Count the shaded squares. It is 8 out of 100.', explanation: '8 out of 100 squares are shaded, so 8%.' },
  { prompt: 'The word percent means out of how many?', diagram: { type: 'card', top: '%', label: 'PERCENT', sub: 'out of ?' }, correct: '100', wrongs: ['10', '1000', '50'], hint: 'Think of a hundred grid. How many squares make the whole?', explanation: 'Percent means out of 100.' },
  { prompt: '64 squares are shaded on a hundred grid. What percent is NOT shaded?', diagram: { type: 'grid', shaded: 64 }, correct: '36%', wrongs: ['64%', '46%', '6.4%'], hint: 'The whole grid is 100%. Subtract the shaded part from 100.', explanation: '100 − 64 = 36, so 36% is not shaded.' },
  { prompt: 'Exactly 25 squares are shaded on a hundred grid. What percent is shaded?', diagram: { type: 'grid', shaded: 25 }, correct: '25%', wrongs: ['75%', '52%', '2.5%'], hint: 'Count the shaded squares out of 100.', explanation: '25 out of 100 squares are shaded, so 25%.' },
  { prompt: 'One square on a hundred grid is what percent of the whole grid?', diagram: { type: 'grid', shaded: 1 }, correct: '1%', wrongs: ['10%', '100%', '0.1%'], hint: 'It is 1 out of 100 squares.', explanation: '1 out of 100 squares is 1%.' },
  { prompt: '90 squares are shaded on a hundred grid. What percent is shaded?', diagram: { type: 'grid', shaded: 90 }, correct: '90%', wrongs: ['9%', '10%', '99%'], hint: 'Count the shaded squares out of 100.', explanation: '90 out of 100 squares are shaded, so 90%.' },
  { prompt: '60 out of 100 students like football. What percent of the students like football?', diagram: { type: 'grid', shaded: 60 }, correct: '60%', wrongs: ['6%', '40%', '100%'], hint: 'Percent means out of 100. The number out of 100 is the percent.', explanation: '60 out of 100 is 60%.' },
  { prompt: 'The whole hundred grid is shaded. What percent is that?', diagram: { type: 'grid', shaded: 100 }, correct: '100%', wrongs: ['10%', '1%', '0%'], hint: 'All 100 squares out of 100 squares.', explanation: 'The whole grid is 100 out of 100, which is 100%.' },
  { prompt: '45 squares are shaded on a hundred grid. Which percent shows the shaded part?', diagram: { type: 'grid', shaded: 45 }, correct: '45%', wrongs: ['54%', '4.5%', '55%'], hint: 'Count the shaded squares out of 100.', explanation: '45 out of 100 squares are shaded, so 45%.' },
];

// ─────────────────────────────────────────────────────────────
// WORLD 2 — Percent to Fraction (over 100)
// ─────────────────────────────────────────────────────────────
const w2 = [47, 9, 63, 81, 23, 5, 78, 99, 31, 16].map((p, idx) => ({
  prompt: idx < 5 ? `Write ${p}% as a fraction with denominator 100.` : `Which fraction is the same as ${p}%?`,
  diagram: idx < 5 ? { type: 'card', top: `${p}%`, label: 'PERCENT', sub: '= ?/100' } : { type: 'grid', shaded: p },
  correct: `${p}/100`,
  wrongs: [`100/${p}`, `${p}/10`, `${p}/1000`],
  hint: 'Percent means out of 100. Put the percent number over 100.',
  explanation: `${p}% means ${p} out of 100, so ${p}% = ${p}/100.`,
  check: { equal: [`${p}%`, `${p}/100`] },
}));

// ─────────────────────────────────────────────────────────────
// WORLD 3 — Simplify It! (percent → simplest fraction)
// ─────────────────────────────────────────────────────────────
const w3Spec = [
  [25, ['25/100', '1/25', '2/5']],
  [50, ['50/100', '1/50', '1/5']],
  [20, ['20/100', '1/20', '2/5']],
  [60, ['60/100', '3/10', '6/5']],
  [75, ['75/100', '7/5', '4/3']],
  [40, ['40/100', '4/5', '2/10']],
  [35, ['35/100', '3/5', '7/10']],
  [90, ['90/100', '1/9', '9/100']],
  [45, ['45/100', '4/5', '9/10']],
  [4, ['4/100', '1/4', '4/25']],
];
const w3 = w3Spec.map(([p, wrongs]) => {
  const g = gcd(p, 100);
  const s = `${p / g}/${100 / g}`;
  return {
    prompt: `Write ${p}% as a fraction in simplest form.`,
    diagram: { type: 'grid', shaded: p },
    correct: s,
    wrongs,
    hint: `Write ${p}/100 first. Then divide the top and bottom by the same number until you can't any more.`,
    explanation: `${p}% = ${p}/100 = ${s} (divide top and bottom by ${g}).`,
    check: { equal: [`${p}%`, s], simplest: s },
  };
});

// ─────────────────────────────────────────────────────────────
// WORLD 4 — Percent to Decimal (÷ 100)
// ─────────────────────────────────────────────────────────────
const w4 = [45, 7, 80, 62, 9, 30, 99, 12, 5, 100].map((p) => {
  const d = percentToDecimal(p);
  return {
    prompt: `Write ${p}% as a decimal.`,
    diagram: { type: 'card', top: `${p}%`, label: 'PERCENT', sub: '÷ 100 = ?' },
    correct: d,
    wrongs: [`${p}`, num(p / 10), num(p / 1000)],
    hint: 'Divide by 100. That slides the decimal point 2 places to the left.',
    explanation: `${p}% = ${p} ÷ 100 = ${d}.`,
    check: { equal: [`${p}%`, d] },
  };
});

// ─────────────────────────────────────────────────────────────
// WORLD 5 — Decimal to Percent (× 100)
// ─────────────────────────────────────────────────────────────
const w5 = [0.6, 0.05, 0.32, 0.9, 0.07, 0.75, 0.4, 0.18, 0.01, 0.5].map((d) => {
  const pct = toPercentString(d);
  return {
    prompt: `Write ${d} as a percent.`,
    diagram: { type: 'numberline', max: 1, value: d, label: String(d) },
    correct: pct,
    wrongs: [`${num(d)}%`, `${num(d * 10)}%`, `${num(d * 1000)}%`],
    hint: 'Multiply by 100. That slides the decimal point 2 places to the right.',
    explanation: `${d} × 100 = ${pct}.`,
    check: { equal: [String(d), pct] },
  };
});

// ─────────────────────────────────────────────────────────────
// WORLD 6 — Fraction to Percent (make the denominator 100)
// ─────────────────────────────────────────────────────────────
const w6Spec = [
  [1, 4, ['14%', '4%', '75%']],
  [3, 5, ['35%', '3%', '40%']],
  [7, 10, ['7%', '30%', '17%']],
  [9, 20, ['9%', '55%', '20%']],
  [3, 25, ['3%', '25%', '88%']],
  [17, 50, ['17%', '50%', '66%']],
  [1, 2, ['12%', '2%', '20%']],
  [4, 5, ['45%', '4%', '20%']],
  [13, 20, ['13%', '35%', '20%']],
  [11, 25, ['11%', '56%', '25%']],
];
const w6 = w6Spec.map(([n, d, wrongs]) => {
  const k = 100 / d;
  const p = n * k;
  return {
    prompt: `Write ${n}/${d} as a percent.`,
    diagram: d <= 25
      ? { type: 'bar', parts: d, filled: n }
      : { type: 'card', top: `${n}/${d}`, label: 'FRACTION', sub: '= ?%' },
    correct: `${p}%`,
    wrongs,
    hint: `Multiply the top and the bottom by ${k} to make the denominator 100.`,
    explanation: `${n}/${d} = ${n * k}/100 = ${p}%  (× ${k} on the top and bottom).`,
    check: { equal: [`${n}/${d}`, `${p}%`] },
  };
});

// ─────────────────────────────────────────────────────────────
// WORLD 7 — Same Amount, New Costume
// ─────────────────────────────────────────────────────────────
const w7Equal = (given, correct, wrongs, hint, explanation, diagramSub = 'same amount as ?') => ({
  prompt: `Which is equal to ${given}?`,
  diagram: { type: 'card', top: given, label: 'GIVEN', sub: diagramSub },
  correct, wrongs, hint, explanation,
  check: { equal: [given, correct], notEqual: wrongs.map((w) => [given, w]) },
});
const w7 = [
  w7Equal('1/2', '0.5', ['0.2', '5%', '2%'], '1/2 means 1 out of 2. Half of 100 is 50, so 1/2 is 50%, or 0.5.', '1/2 = 50/100 = 50% = 0.5.'),
  w7Equal('0.25', '1/4', ['2/5', '25/10', '1/25'], '0.25 is 25/100. Divide the top and bottom by 25.', '0.25 = 25/100 = 1/4.'),
  w7Equal('60%', '3/5', ['6/5', '1/6', '5/3'], '60% is 60/100. Divide the top and bottom by 20.', '60% = 60/100 = 3/5.'),
  w7Equal('3/4', '0.75', ['0.34', '3.4', '0.7'], 'Make the denominator 100. Multiply the top and bottom by 25.', '3/4 = 75/100 = 0.75.'),
  w7Equal('0.2', '20%', ['2%', '0.2%', '0.02'], 'Multiply by 100. Slide the decimal point 2 places to the right.', '0.2 × 100 = 20%.'),
  w7Equal('45%', '9/20', ['4/5', '45/10', '4/50'], '45% is 45/100. Divide the top and bottom by 5.', '45% = 45/100 = 9/20.'),
  w7Equal('0.8', '4/5', ['8/100', '1/8', '80/10'], '0.8 is 8/10. Divide the top and bottom by 2.', '0.8 = 8/10 = 4/5.'),
  w7Equal('1/5', '20%', ['5%', '15%', '0.5'], 'Multiply the top and bottom by 20 to get a denominator of 100.', '1/5 = 20/100 = 20%.'),
  {
    prompt: 'Which one is NOT equal to 0.4?',
    diagram: { type: 'card', top: '0.4', label: 'REFERENCE', sub: 'find the odd one out' },
    correct: '4/100',
    wrongs: ['2/5', '40%', '4/10'],
    hint: 'Change every choice into a decimal. Which one is not 0.4?',
    explanation: '4/100 = 0.04. The other three all equal 0.4.',
    check: { oddOneOut: { ref: '0.4', odd: '4/100', same: ['2/5', '40%', '4/10'] } },
  },
  w7Equal('3/8', '0.375', ['0.38', '0.83', '3.8'], 'Divide the top by the bottom: 3 ÷ 8.', '3 ÷ 8 = 0.375, which is 37.5%.'),
];

// ─────────────────────────────────────────────────────────────
// WORLD 8 — Compare & Order
// ─────────────────────────────────────────────────────────────
const asPercents = (items) => items.map((s) => `${s} = ${toPercentString(parseValue(s))}`).join(', ');
const NL = { type: 'numberline', max: 1, value: null, labels: 'percent' };
const w8Spec = [
  { kind: 'greatest', prompt: 'Which number is the greatest?', items: ['0.45', '2/5', '43%', '0.05'], correct: '0.45' },
  { kind: 'smallest', prompt: 'Which number is the smallest?', items: ['1/2', '0.55', '48%', '3/5'], correct: '48%' },
  { kind: 'greatest', prompt: 'Which number is the greatest?', items: ['7/10', '0.68', '71%', '3/5'], correct: '71%' },
  { kind: 'smallest', prompt: 'Which number is the smallest?', items: ['0.3', '1/4', '28%', '0.35'], correct: '1/4' },
  { kind: 'greatest', prompt: 'Which number is the greatest?', items: ['9/20', '0.4', '44%', '3/10'], correct: '9/20' },
  { kind: 'between', prompt: 'Which number is between 40% and 60%?', items: ['0.35', '1/2', '0.65', '3/4'], correct: '1/2', lo: 0.4, hi: 0.6 },
  { kind: 'closest', prompt: 'Which number is closest to 1 whole (100%)?', items: ['0.9', '95%', '4/5', '0.85'], correct: '95%' },
  { kind: 'greater', prompt: 'Which number is greater than 0.6?', items: ['55%', '3/5', '0.59', '13/20'], correct: '13/20', than: 0.6 },
  { kind: 'less', prompt: 'Which number is less than 1/4?', items: ['0.3', '20%', '0.26', '2/5'], correct: '20%', than: 0.25 },
  { kind: 'greatest', prompt: 'Which number is the greatest?', items: ['0.08', '9%', '1/8', '0.1'], correct: '1/8' },
];
const w8 = w8Spec.map((q) => ({
  prompt: q.prompt,
  diagram: NL,
  correct: q.correct,
  wrongs: q.items.filter((x) => x !== q.correct),
  hint: 'Change every choice into a percent. Then compare the percents.',
  explanation: `${asPercents(q.items)}. So ${q.correct} is the answer.`,
  check: { compare: q },
}));

// ─────────────────────────────────────────────────────────────
// WORLD 9 — Beyond 100% & Below 1%
// ─────────────────────────────────────────────────────────────
const w9 = [
  { prompt: 'Write 150% as a decimal.', diagram: { type: 'card', top: '150%', label: 'PERCENT', sub: '÷ 100 = ?' }, correct: '1.5', wrongs: ['0.15', '15', '1.05'], hint: 'Divide by 100. More than 100% means more than 1 whole.', explanation: '150% = 150 ÷ 100 = 1.5.', check: { equal: ['150%', '1.5'] } },
  { prompt: 'Write 200% as a decimal.', diagram: { type: 'card', top: '200%', label: 'PERCENT', sub: '÷ 100 = ?' }, correct: '2', wrongs: ['0.2', '20', '200'], hint: '100% is 1 whole. So 200% is how many wholes?', explanation: '200% = 200 ÷ 100 = 2.', check: { equal: ['200%', '2'] } },
  { prompt: 'Write 125% as an improper fraction in simplest form.', diagram: { type: 'card', top: '125%', label: 'PERCENT', sub: '= ?' }, correct: '5/4', wrongs: ['4/5', '1/25', '12/5'], hint: 'Write 125/100 and divide the top and bottom by 25.', explanation: '125% = 125/100 = 5/4.', check: { equal: ['125%', '5/4'] } },
  { prompt: 'Write 0.5% as a decimal.', diagram: { type: 'card', top: '0.5%', label: 'PERCENT', sub: '÷ 100 = ?' }, correct: '0.005', wrongs: ['0.5', '0.05', '5'], hint: 'Divide 0.5 by 100. Slide the decimal point 2 places to the left.', explanation: '0.5% = 0.5 ÷ 100 = 0.005.', check: { equal: ['0.5%', '0.005'] } },
  { prompt: 'Write 2.5 as a percent.', diagram: { type: 'numberline', max: 3, value: 2.5, label: '2.5' }, correct: '250%', wrongs: ['25%', '2.5%', '0.25%'], hint: 'Multiply by 100. Slide the decimal point 2 places to the right.', explanation: '2.5 × 100 = 250%.', check: { equal: ['2.5', '250%'] } },
  { prompt: 'Write 300% as a decimal.', diagram: { type: 'card', top: '300%', label: 'PERCENT', sub: '÷ 100 = ?' }, correct: '3', wrongs: ['0.3', '30', '300'], hint: 'Every 100% is 1 whole. How many wholes is 300%?', explanation: '300% = 300 ÷ 100 = 3.', check: { equal: ['300%', '3'] } },
  { prompt: 'Write 1.2 as a percent.', diagram: { type: 'numberline', max: 2, value: 1.2, label: '1.2' }, correct: '120%', wrongs: ['12%', '1.2%', '102%'], hint: 'Multiply by 100. Slide the decimal point 2 places to the right.', explanation: '1.2 × 100 = 120%.', check: { equal: ['1.2', '120%'] } },
  { prompt: 'Write 0.2% as a decimal.', diagram: { type: 'card', top: '0.2%', label: 'PERCENT', sub: '÷ 100 = ?' }, correct: '0.002', wrongs: ['0.02', '0.2', '2'], hint: 'Divide 0.2 by 100. Slide the decimal point 2 places to the left.', explanation: '0.2% = 0.2 ÷ 100 = 0.002.', check: { equal: ['0.2%', '0.002'] } },
  { prompt: 'Write 3/2 as a percent.', diagram: { type: 'card', top: '3/2', label: 'FRACTION', sub: '= ?%' }, correct: '150%', wrongs: ['32%', '15%', '60%'], hint: 'Multiply the top and bottom by 50 to make the denominator 100.', explanation: '3/2 = 150/100 = 150%.', check: { equal: ['3/2', '150%'] } },
  { prompt: 'Write 175% as a mixed number in simplest form.', diagram: { type: 'card', top: '175%', label: 'PERCENT', sub: '= ?' }, correct: '1 3/4', wrongs: ['3/4', '1 1/4', '17/5'], hint: '175% is 100% + 75%. That is 1 whole and 75/100.', explanation: '175% = 1 whole + 75/100 = 1 3/4.', check: { equal: ['175%', '1 3/4'] } },
];

// ─────────────────────────────────────────────────────────────
// WORLD 10 — Real-Life Percent Problems (MOE P6 style)
// ─────────────────────────────────────────────────────────────
const w10 = [
  { prompt: 'There are 40 students in a class. 30 of them walk to school. What percent of the students walk to school?', diagram: { type: 'dots', total: 40, count: 30 }, correct: '75%', wrongs: ['25%', '30%', '70%'], hint: 'Write 30/40 and simplify to 3/4. Then make the denominator 100.', explanation: '30/40 = 3/4 = 75/100 = 75%.', check: { equal: ['30/40', '75%'] } },
  { prompt: 'Mei scored 18 out of 20 on a quiz. What is her score as a percent?', diagram: { type: 'dots', total: 20, count: 18 }, correct: '90%', wrongs: ['18%', '80%', '98%'], hint: 'Multiply the top and bottom of 18/20 by 5 to make the denominator 100.', explanation: '18/20 = 90/100 = 90%.', check: { equal: ['18/20', '90%'] } },
  { prompt: 'A phone battery is 35% charged. What fraction of the battery is charged? Give your answer in simplest form.', diagram: { type: 'battery', level: 35 }, correct: '7/20', wrongs: ['35/100', '3/5', '5/7'], hint: 'Write 35/100. Then divide the top and bottom by 5.', explanation: '35% = 35/100 = 7/20.', check: { equal: ['35%', '7/20'], simplest: '7/20' } },
  { prompt: 'A jug is 0.75 full of juice. What percent of the jug is full?', diagram: { type: 'battery', level: 75, kind: 'jug' }, correct: '75%', wrongs: ['7.5%', '0.75%', '25%'], hint: 'Multiply 0.75 by 100. Slide the decimal point 2 places to the right.', explanation: '0.75 × 100 = 75%.', check: { equal: ['0.75', '75%'] } },
  { prompt: 'A bag has 25 marbles. 7 of them are red. What percent of the marbles are red?', diagram: { type: 'dots', total: 25, count: 7 }, correct: '28%', wrongs: ['7%', '32%', '72%'], hint: 'Write 7/25. Multiply the top and bottom by 4 to make the denominator 100.', explanation: '7/25 = 28/100 = 28%.', check: { equal: ['7/25', '28%'] } },
  { prompt: 'A shop takes 20% off the price of a bag. What fraction of the price is taken off? Give your answer in simplest form.', diagram: { type: 'card', top: '20% OFF', label: 'SALE', sub: 'fraction taken off = ?' }, correct: '1/5', wrongs: ['1/20', '2/5', '4/5'], hint: 'Write 20/100. Then divide the top and bottom by 20.', explanation: '20% = 20/100 = 1/5.', check: { equal: ['20%', '1/5'] } },
  { prompt: 'Rui has read 0.4 of his book. What percent of the book is left to read?', diagram: { type: 'bar', parts: 10, filled: 4 }, correct: '60%', wrongs: ['40%', '6%', '0.6%'], hint: 'First change 0.4 into a percent. Then subtract it from 100%.', explanation: '0.4 = 40%. Left to read: 100% − 40% = 60%.', check: { equal: ['0.6', '60%'] } },
  { prompt: '45% of the students in a club are boys. What fraction of the club are girls? Give your answer in simplest form.', diagram: { type: 'dots', total: 20, count: 9 }, correct: '11/20', wrongs: ['9/20', '5/11', '55/10'], hint: 'Girls are 100% − 45%. Then write the percent over 100 and simplify.', explanation: 'Girls: 100% − 45% = 55%. 55/100 = 11/20.', check: { equal: ['55%', '11/20'] } },
  { prompt: 'A tank is 3/8 full of water. What percent of the tank is full?', diagram: { type: 'battery', level: 37.5, kind: 'tank' }, correct: '37.5%', wrongs: ['38%', '3.75%', '83.3%'], hint: 'Divide 3 by 8 to get a decimal. Then multiply by 100.', explanation: '3 ÷ 8 = 0.375. 0.375 × 100 = 37.5%.', check: { equal: ['3/8', '37.5%'] } },
  { prompt: 'Aisha spent 0.35 of her savings. What percent of her savings did she NOT spend?', diagram: { type: 'grid', shaded: 35 }, correct: '65%', wrongs: ['35%', '6.5%', '0.65%'], hint: 'Change 0.35 into a percent. Then subtract from 100%.', explanation: '0.35 = 35%. Not spent: 100% − 35% = 65%.', check: { equal: ['0.65', '65%'] } },
];

const rawWorlds = { 1: w1, 2: w2, 3: w3, 4: w4, 5: w5, 6: w6, 7: w7, 8: w8, 9: w9, 10: w10 };

const fact = {
  1: 'percent_meaning', 2: 'percent_to_fraction', 3: 'simplify_fraction', 4: 'percent_to_decimal',
  5: 'decimal_to_percent', 6: 'fraction_to_percent', 7: 'equivalent_forms', 8: 'compare_order',
  9: 'beyond_100_below_1', 10: 'word_problem',
};

export const staticQuestionBank = Object.fromEntries(
  Object.entries(rawWorlds).map(([w, list]) => [
    w,
    list.map((q, idx) => mk(Number(w), idx + 1, { fact: fact[w], ...q })),
  ]),
);

export function buildWorldSession(worldId, sessionSize = 10) {
  const worldQuestions = staticQuestionBank[worldId] || staticQuestionBank[1];
  return [...worldQuestions].slice(0, sessionSize);
}

export function generateQuestionForWorld(worldId) {
  const worldQuestions = staticQuestionBank[worldId] || staticQuestionBank[1];
  return worldQuestions[0];
}

export default staticQuestionBank;

// Converts on-screen math text into fully spelled-out speech text so ElevenLabs
// never mis-reads things like "3/4" (a date!) or "0.375" or "45%".
//
//   "45% = 45/100 = 9/20"   ->  "forty-five percent equals forty-five over one hundred equals nine over twenty"
//   "0.375"                 ->  "zero point three seven five"
//   "1 3/4"                 ->  "one and three quarters"
//
// Pure JS (no DOM) so it is shared by the Node audio generator and the browser engine.

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function intToWords(n) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n)) return String(n);
  if (n < 0) return `minus ${intToWords(-n)}`;
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const o = n % 10;
    return o ? `${t}-${ONES[o]}` : t;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return r ? `${ONES[h]} hundred ${intToWords(r)}` : `${ONES[h]} hundred`;
  }
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    return r ? `${intToWords(th)} thousand ${intToWords(r)}` : `${intToWords(th)} thousand`;
  }
  return String(n);
}

// "0.375" -> "zero point three seven five" | "37.5" -> "thirty-seven point five"
export function decimalToWords(str) {
  const [whole, frac = ''] = String(str).split('.');
  const w = intToWords(parseInt(whole || '0', 10));
  if (!frac) return w;
  const digits = frac.split('').map((d) => ONES[parseInt(d, 10)]).join(' ');
  return `${w} point ${digits}`;
}

const ORDINALS = {
  3: 'third', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 12: 'twelfth',
};

export function fractionToWords(num, den) {
  num = parseInt(num, 10);
  den = parseInt(den, 10);
  const numW = intToWords(num);
  const plural = num !== 1;
  if (den === 2) return plural ? `${numW} halves` : `${numW} half`;
  if (den === 4) return plural ? `${numW} quarters` : `${numW} quarter`;
  if (ORDINALS[den]) return plural ? `${numW} ${ORDINALS[den]}s` : `${numW} ${ORDINALS[den]}`;
  if (den === 100 && num === 1) return 'one hundredth';
  // 20, 25, 50, 100 ... read as "over" — much clearer to hear than "twenty-fifths"
  return `${numW} over ${intToWords(den)}`;
}

export function toSpeech(text) {
  if (!text) return '';
  let s = String(text);

  // Typographic clean-up
  s = s
    .replace(/[“”"]/g, '')
    .replace(/[’]/g, "'")
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s*→\s*/g, ' becomes ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/−/g, ' minus ')
    .replace(/\s\+\s/g, ' plus ')
    .replace(/=/g, ' equals ')
    .replace(/≈/g, ' is about ')
    .replace(/…/g, '...')
    .replace(/[✨🎉🔍📋🚀🎯🏆⭐]/gu, '');

  // Numbers: mixed number | fraction | decimal/integer with optional percent
  s = s.replace(
    /(\d+)\s(\d+)\/(\d+)|(\d+)\/(\d+)|(\d+(?:\.\d+)?)(%?)/g,
    (m, mw, mn, md, fn, fd, num, pct) => {
      if (mw !== undefined) return `${intToWords(mw)} and ${fractionToWords(mn, md)}`;
      if (fn !== undefined) return fractionToWords(fn, fd);
      const words = num.includes('.') ? decimalToWords(num) : intToWords(num);
      return pct ? `${words} percent` : words;
    },
  );

  return s.replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}

export default toSpeech;

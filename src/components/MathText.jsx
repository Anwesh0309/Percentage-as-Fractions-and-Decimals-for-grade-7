import React from 'react';

// Stacked fraction  (numerator over denominator)
export const Frac = ({ n, d }) => (
  <span
    className="inline-flex flex-col items-center align-middle leading-[1.05] mx-[0.12em]"
    style={{ fontSize: '0.8em' }}
  >
    <span className="px-[0.2em] pb-[0.04em] border-b-[0.09em] border-current">{n}</span>
    <span className="px-[0.2em] pt-[0.04em]">{d}</span>
  </span>
);

// Turns "3/4" and "1 3/4" inside any string into nicely stacked fractions.
const TOKEN_SOURCE = /(\d+)\s(\d+)\/(\d+)|(\d+)\/(\d+)/.source;

export const MathText = ({ children, className = '' }) => {
  const text = String(children ?? '');
  const parts = [];
  let last = 0;
  let m;
  const TOKEN = new RegExp(TOKEN_SOURCE, 'g');
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(<span key={m.index}>{m[1]}<Frac n={m[2]} d={m[3]} /></span>);
    } else {
      parts.push(<Frac key={m.index} n={m[4]} d={m[5]} />);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span className={className}>{parts}</span>;
};

export default MathText;

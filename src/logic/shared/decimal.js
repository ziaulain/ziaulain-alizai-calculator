import Decimal from 'decimal.js';

export const Money = Decimal.clone({ precision: 512, rounding: Decimal.ROUND_HALF_UP });
const DECIMAL_INPUT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function parseDecimal(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  if (!text || text.length > 200 || !DECIMAL_INPUT.test(text)) return null;
  try {
    const decimal = new Money(text);
    if (!decimal.isFinite() || decimal.sd() > 100 || Math.abs(decimal.e) > 100) return null;
    return decimal;
  } catch {
    return null;
  }
}


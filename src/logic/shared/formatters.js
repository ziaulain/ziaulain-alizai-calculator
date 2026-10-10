import { parseDecimal } from './decimal.js';

const FREELANCE_FIELDS = ['gross', 'preTaxNet', 'taxAmount', 'takeHomeNet'];
const AGENCY_FIELDS = ['basePrice', 'agencyProfit', 'finalPrice', 'effectiveProfit'];

export function amount(value) {
  const rounded = value.toDecimalPlaces(2);
  return rounded.isZero() ? '0.00' : rounded.toFixed(2);
}

/** Format without converting to a binary floating-point Number. */
export function formatUSD(value) {
  const decimal = parseDecimal(value);
  if (decimal === null) return '—';
  const fixed = amount(decimal);
  const negative = fixed.startsWith('-');
  const [whole, fraction] = (negative ? fixed.slice(1) : fixed).split('.');
  return `${negative ? '-' : ''}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
}

/** Return a formatted copy of either calculator result; preserve errors/flags. */
export function formatCurrencyOutputs(result) {
  const formatted = { ...result };
  for (const field of [...FREELANCE_FIELDS, ...AGENCY_FIELDS]) {
    if (Object.hasOwn(formatted, field)) {
      // Calculated amounts may exceed the input magnitude limit, so format their
      // already-rounded strings directly rather than reparsing them as inputs.
      const value = formatted[field];
      if (typeof value === 'string' && /^-?\d+\.\d{2}$/.test(value)) {
        const negative = value.startsWith('-');
        const [whole, fraction] = (negative ? value.slice(1) : value).split('.');
        formatted[field] = `${negative ? '-' : ''}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
      } else {
        formatted[field] = formatUSD(value);
      }
    }
  }
  return formatted;
}

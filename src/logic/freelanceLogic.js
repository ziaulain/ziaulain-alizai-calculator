import { Money, parseDecimal } from './shared/decimal.js';
import { validate } from './shared/validation.js';
import { amount } from './shared/formatters.js';

export const FREELANCE_DEFAULTS = Object.freeze({ hours: '40', hourlyRate: '75', overheadExpenses: '300', taxRatePercent: '20' });

/** Amounts are decimal strings rounded half-up; invalid amounts are null,
 * except zero hours returns a zero gross for the acceptance guard. */
export function calculateFreelanceFee(params) {
  const { values, errors } = validate(params, {
    hours: { positive: true, zeroMessage: 'Estimated hours must be greater than 0' },
    hourlyRate: {},
    overheadExpenses: {},
    taxRatePercent: { percent: true },
  });
  if (errors.length) {
    const zeroHours = parseDecimal(params?.hours)?.isZero() === true;
    return { gross: zeroHours ? '0.00' : null, preTaxNet: null, taxAmount: null, takeHomeNet: null, isDeficit: false, errors };
  }
  const { hours, hourlyRate, overheadExpenses, taxRatePercent } = values;
  const gross = hours.times(hourlyRate);
  const preTaxNet = gross.minus(overheadExpenses);
  const taxAmount = Money.max(0, preTaxNet).times(taxRatePercent.div(100));
  return {
    gross: amount(gross),
    preTaxNet: amount(preTaxNet),
    taxAmount: amount(taxAmount),
    takeHomeNet: amount(preTaxNet.minus(taxAmount)),
    isDeficit: preTaxNet.lt(0),
    errors,
  };
}


import { describe, expect, it } from 'vitest';
import { calculateFreelanceFee } from '../logic/freelanceLogic.js';
import { calculateAgencyFee, calculateAgencyContractorCost, calculateEffectiveMargin } from '../logic/agencyLogic.js';
import { formatUSD, formatCurrencyOutputs } from '../logic/shared/formatters.js';
const freelance = { hours: 10, hourlyRate: 100, overheadExpenses: 200, taxRatePercent: 25 };
const agency = { subcontractorCost: 1000, targetMarginPercent: 20, clientDiscountPercent: 10 };

describe('validation and formatting', () => {
  it.each([undefined, null, '', ' ', 'abc', '0x10', NaN, Infinity, -Infinity, true, {}, [], '1e999999', '9'.repeat(201)])('rejects malformed input %s safely', value => {
    for (const result of [calculateFreelanceFee({ ...freelance, hours: value }), calculateAgencyFee({ ...agency, subcontractorCost: value })]) {
      expect(result.errors).toHaveLength(1);
      expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
    }
    expect(formatUSD(value)).toBe('—');
  });
  it('collects all missing field errors', () => {
    expect(calculateFreelanceFee().errors).toHaveLength(4);
    expect(calculateAgencyFee(null).errors).toHaveLength(3);
  });
  it('formats USD with exact cents, grouping, and normalized negative zero', () => {
    expect(formatUSD('1250')).toBe('$1,250.00');
    expect(formatUSD('-1250.005')).toBe('-$1,250.01');
    expect(formatUSD('-0.001')).toBe('$0.00');
    expect(formatUSD('9007199254740993.01')).toBe('$9,007,199,254,740,993.01');
  });
  it('formats all output amounts without mutating the result', () => {
    const raw = calculateAgencyFee(agency);
    expect(formatCurrencyOutputs(raw)).toEqual({ ...raw, basePrice: '$1,250.00', agencyProfit: '$250.00', finalPrice: '$1,125.00', effectiveProfit: '$125.00' });
    expect(raw.basePrice).toBe('1250.00');
    expect(formatCurrencyOutputs(calculateFreelanceFee(freelance)).taxAmount).toBe('$200.00');
    expect(formatCurrencyOutputs(calculateAgencyFee()).basePrice).toBe('—');
  });
  it('does not mutate input objects', () => {
    expect(() => calculateFreelanceFee(Object.freeze(freelance))).not.toThrow();
    expect(() => calculateAgencyFee(Object.freeze(agency))).not.toThrow();
  });
});

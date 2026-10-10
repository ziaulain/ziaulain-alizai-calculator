import { describe, expect, it } from 'vitest';
import { calculateAgencyFee, calculateAgencyContractorCost, calculateEffectiveMargin } from '../logic/agencyLogic.js';
import { formatUSD, formatCurrencyOutputs } from '../logic/shared/formatters.js';
const agency = { subcontractorCost: 1000, targetMarginPercent: 20, clientDiscountPercent: 10 };

describe('agency project billing modes', () => {
  const hourly = { billingMode: 'hourly', subcontractorHours: '40', subcontractorHourlyRate: '50', targetMarginPercent: '20', clientDiscountPercent: '0' };
  const fixed = { billingMode: 'fixed', flatSubcontractorCost: '2000', targetMarginPercent: '20', clientDiscountPercent: '0' };

  it('quotes 40 contractor hours at $50 with 20% margin as $2,500.00', () => {
    const result = calculateAgencyFee(hourly);
    expect(calculateAgencyContractorCost(hourly)).toBe('2000.00');
    expect(result).toEqual({ basePrice: '2500.00', agencyProfit: '500.00', finalPrice: '2500.00', effectiveProfit: '500.00', operatesBelowCost: false, errors: [] });
    expect(formatCurrencyOutputs(result).finalPrice).toBe('$2,500.00');
    expect(calculateEffectiveMargin(hourly)).toBe('20.00');
  });
  it('gives identical downstream results for equivalent fixed and hourly costs', () => {
    for (const clientDiscountPercent of ['0', '20', '25', '100']) {
      expect(calculateAgencyFee({ ...hourly, clientDiscountPercent })).toEqual(calculateAgencyFee({ ...fixed, clientDiscountPercent }));
    }
  });
  it.each([0, '0'])('rejects zero contractor hours (%s) with the required inline error', subcontractorHours => {
    expect(calculateAgencyFee({ ...hourly, subcontractorHours })).toEqual({ basePrice: null, agencyProfit: null, finalPrice: null, effectiveProfit: null, operatesBelowCost: false, errors: [{ field: 'subcontractorHours', message: 'Subcontractor hours must be greater than 0' }] });
  });
  it.each([['subcontractorHours', -1], ['subcontractorHourlyRate', -1], ['subcontractorHours', ''], ['subcontractorHourlyRate', 'abc'], ['subcontractorHourlyRate', Infinity]])('validates hourly %s = %s', (field, value) => {
    const params = { ...hourly, [field]: value };
    expect(calculateAgencyFee(params).errors).toEqual([{ field, message: expect.any(String) }]);
    expect(calculateAgencyContractorCost(params)).toBeNull();
  });
  it.each([0, -1, '', undefined])('rejects invalid flat cost %s', flatSubcontractorCost => {
    expect(calculateAgencyFee({ ...fixed, flatSubcontractorCost }).errors).toEqual([{ field: 'flatSubcontractorCost', message: expect.any(String) }]);
  });
  it('does not validate inactive cost fields', () => {
    expect(calculateAgencyFee({ ...hourly, flatSubcontractorCost: -1 }).errors).toEqual([]);
    expect(calculateAgencyFee({ ...fixed, subcontractorHours: 0, subcontractorHourlyRate: -1 }).errors).toEqual([]);
  });
  it('requires the new flat field when fixed mode is explicit', () => {
    expect(calculateAgencyFee({ ...agency, billingMode: 'fixed' }).errors[0].field).toBe('flatSubcontractorCost');
  });
  it.each(['day', '', null])('rejects unsupported billing mode %s', billingMode => {
    expect(calculateAgencyFee({ ...fixed, billingMode }).errors).toEqual([{ field: 'billingMode', message: 'Choose fixed or hourly billing mode' }]);
  });
  it('permits zero hourly rate without dividing by zero or flagging below cost', () => {
    const params = { ...hourly, subcontractorHourlyRate: '0', clientDiscountPercent: '25' };
    expect(calculateAgencyFee(params)).toEqual({ basePrice: '0.00', agencyProfit: '0.00', finalPrice: '0.00', effectiveProfit: '0.00', operatesBelowCost: false, errors: [] });
    expect(calculateEffectiveMargin(params)).toBeNull();
  });
  it('does not round the contractor baseline before applying margin', () => {
    expect(calculateAgencyFee({ ...hourly, subcontractorHours: '1', subcontractorHourlyRate: '1.005' }).basePrice).toBe('1.26');
  });
});

describe('US-2 acceptance criteria — Agency Lead', () => {
  const standard = { subcontractorCost: 4000, targetMarginPercent: 20, clientDiscountPercent: 0 };

  it('margin calculation: $4,000 cost at 20% margin produces $5,000 base and $1,000 profit', () => {
    const result = calculateAgencyFee(standard);
    expect(result).toEqual({ basePrice: '5000.00', agencyProfit: '1000.00', finalPrice: '5000.00', effectiveProfit: '1000.00', operatesBelowCost: false, errors: [] });
    expect(formatCurrencyOutputs(result)).toMatchObject({ basePrice: '$5,000.00', agencyProfit: '$1,000.00' });
  });

  it.each([100, 105])('margin limit: %s%% returns the exact inline error', targetMarginPercent => {
    const result = calculateAgencyFee({ ...standard, targetMarginPercent });
    expect(result).toEqual({ basePrice: null, agencyProfit: null, finalPrice: null, effectiveProfit: null, operatesBelowCost: false, errors: [{ field: 'targetMarginPercent', message: 'Agency margin must be less than 100%' }] });
    expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
  });

  it('below-cost warning: a 25% discount exceeds the 20% margin', () => {
    const result = calculateAgencyFee({ ...standard, clientDiscountPercent: 25 });
    expect(result).toEqual({ basePrice: '5000.00', agencyProfit: '1000.00', finalPrice: '3750.00', effectiveProfit: '-250.00', operatesBelowCost: true, errors: [] });
  });
});

describe('agency calculator', () => {
  it('calculates margin pricing and discounted profit', () => {
    expect(calculateAgencyFee(agency)).toEqual({ basePrice: '1250.00', agencyProfit: '250.00', finalPrice: '1125.00', effectiveProfit: '125.00', operatesBelowCost: false, errors: [] });
  });
  it('handles zero margin, no discount, and full discount', () => {
    expect(calculateAgencyFee({ ...agency, targetMarginPercent: 0, clientDiscountPercent: 0 })).toMatchObject({ basePrice: '1000.00', agencyProfit: '0.00', finalPrice: '1000.00', operatesBelowCost: false });
    expect(calculateAgencyFee({ ...agency, clientDiscountPercent: 100 })).toMatchObject({ finalPrice: '0.00', effectiveProfit: '-1000.00', operatesBelowCost: true });
  });
  it('detects discounts that erase the margin', () => {
    expect(calculateAgencyFee({ ...agency, clientDiscountPercent: 20 })).toMatchObject({ effectiveProfit: '0.00', operatesBelowCost: false });
    expect(calculateAgencyFee({ ...agency, clientDiscountPercent: 30 })).toMatchObject({ effectiveProfit: '-125.00', operatesBelowCost: true });
  });
  it('keeps precision for repeating division and near-100% margins', () => {
    expect(calculateAgencyFee({ subcontractorCost: '1', targetMarginPercent: '30', clientDiscountPercent: '30' })).toMatchObject({ basePrice: '1.43', finalPrice: '1.00', effectiveProfit: '0.00', operatesBelowCost: false });
    expect(calculateAgencyFee({ ...agency, targetMarginPercent: '99.999', clientDiscountPercent: 0 }).basePrice).toBe('100000000.00');
  });
  it.each([['subcontractorCost', 0], ['subcontractorCost', -1], ['targetMarginPercent', -1], ['targetMarginPercent', 100], ['targetMarginPercent', 101], ['clientDiscountPercent', -1], ['clientDiscountPercent', 101]])('rejects invalid %s = %s', (field, value) => {
    const result = calculateAgencyFee({ ...agency, [field]: value });
    expect(result.errors).toEqual([{ field, message: expect.any(String) }]);
    expect(result.basePrice).toBeNull();
  });
});


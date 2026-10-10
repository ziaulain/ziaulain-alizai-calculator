import { Money, parseDecimal } from './shared/decimal.js';
import { validate } from './shared/validation.js';
import { amount } from './shared/formatters.js';

export const AGENCY_DEFAULTS = Object.freeze({ billingMode: 'fixed', flatSubcontractorCost: '4000', subcontractorHours: '40', subcontractorHourlyRate: '50', targetMarginPercent: '20', clientDiscountPercent: '0' });

function agencyContractorCost(params) {
  const mode = params?.billingMode === undefined ? 'fixed' : params.billingMode;
  if (!['fixed', 'hourly'].includes(mode)) {
    return { cost: null, errors: [{ field: 'billingMode', message: 'Choose fixed or hourly billing mode' }] };
  }
  // Keep the original API working when callers omit billingMode.
  const fixedField = params?.billingMode === undefined && params?.flatSubcontractorCost === undefined
    ? 'subcontractorCost' : 'flatSubcontractorCost';
  const rules = mode === 'hourly' ? {
    subcontractorHours: { positive: true, zeroMessage: 'Subcontractor hours must be greater than 0' },
    subcontractorHourlyRate: {},
  } : { [fixedField]: { positive: true } };
  const { values, errors } = validate(params, rules);
  return {
    cost: errors.length ? null : mode === 'hourly'
      ? values.subcontractorHours.times(values.subcontractorHourlyRate)
      : values[fixedField],
    errors,
  };
}

/** Derived baseline for UI display; margin/discount errors do not hide it. */
export function calculateAgencyContractorCost(params) {
  const { cost } = agencyContractorCost(params);
  return cost === null ? null : amount(cost);
}

export function calculateAgencyFee(params) {
  const contractor = agencyContractorCost(params);
  const { values, errors } = validate(params, {
    targetMarginPercent: { percent: true, exclusive: true, limitMessage: 'Agency margin must be less than 100%' },
    clientDiscountPercent: { percent: true },
  });
  errors.unshift(...contractor.errors);
  if (errors.length) {
    return { basePrice: null, agencyProfit: null, finalPrice: null, effectiveProfit: null, operatesBelowCost: false, errors };
  }
  const subcontractorCost = contractor.cost;
  const { targetMarginPercent, clientDiscountPercent } = values;
  const denominator = new Money(100).minus(targetMarginPercent);
  const basePrice = subcontractorCost.times(100).div(denominator);
  // Algebraically equivalent formulas avoid cancellation after repeating division.
  const finalPrice = subcontractorCost.times(new Money(100).minus(clientDiscountPercent)).div(denominator);
  const effectiveProfit = subcontractorCost.times(targetMarginPercent.minus(clientDiscountPercent)).div(denominator);
  return {
    basePrice: amount(basePrice),
    agencyProfit: amount(subcontractorCost.times(targetMarginPercent).div(denominator)),
    finalPrice: amount(finalPrice),
    effectiveProfit: amount(effectiveProfit),
    operatesBelowCost: subcontractorCost.gt(0) && clientDiscountPercent.gt(targetMarginPercent),
    errors,
  };
}

/** Effective margin uses unrounded inputs. Null means invalid or zero revenue. */
export function calculateEffectiveMargin(params) {
  if (calculateAgencyFee(params).errors.length) return null;
  if (agencyContractorCost(params).cost.isZero()) return null;
  const margin = parseDecimal(params.targetMarginPercent);
  const discount = parseDecimal(params.clientDiscountPercent);
  if (discount.eq(100)) return null;
  return amount(margin.minus(discount).times(100).div(new Money(100).minus(discount)));
}


import { describe, expect, it } from 'vitest';
import { calculateFreelanceFee } from '../logic/freelanceLogic.js';
import { formatUSD, formatCurrencyOutputs } from '../logic/shared/formatters.js';
const freelance = { hours: 10, hourlyRate: 100, overheadExpenses: 200, taxRatePercent: 25 };

describe('US-1 acceptance criteria — Freelancer', () => {
  const standard = { hours: 40, hourlyRate: 75, overheadExpenses: 300, taxRatePercent: 20 };

  it('standard: 40 hours at $75, $300 expenses, 20% tax', () => {
    const result = calculateFreelanceFee(standard);
    expect(result).toEqual({ gross: '3000.00', preTaxNet: '2700.00', taxAmount: '540.00', takeHomeNet: '2160.00', isDeficit: false, errors: [] });
    expect(formatCurrencyOutputs(result)).toEqual({ gross: '$3,000.00', preTaxNet: '$2,700.00', taxAmount: '$540.00', takeHomeNet: '$2,160.00', isDeficit: false, errors: [] });
  });

  it.each([0, '0'])('zero hours guard: %s returns the exact inline error and $0.00 gross', hours => {
    const result = calculateFreelanceFee({ ...standard, hours });
    expect(result).toEqual({ gross: '0.00', preTaxNet: null, taxAmount: null, takeHomeNet: null, isDeficit: false, errors: [{ field: 'hours', message: 'Estimated hours must be greater than 0' }] });
    expect(formatCurrencyOutputs(result).gross).toBe('$0.00');
  });

  it('negative input: hourly rate -10 returns the exact inline error', () => {
    expect(calculateFreelanceFee({ ...standard, hourlyRate: -10 })).toMatchObject({ gross: null, errors: [{ field: 'hourlyRate', message: 'Values cannot be negative' }] });
  });

  it('deficit: $1,000 gross and $1,200 expenses produces no tax', () => {
    const result = calculateFreelanceFee({ hours: 10, hourlyRate: 100, overheadExpenses: 1200, taxRatePercent: 20 });
    expect(result).toEqual({ gross: '1000.00', preTaxNet: '-200.00', taxAmount: '0.00', takeHomeNet: '-200.00', isDeficit: true, errors: [] });
    expect(formatCurrencyOutputs(result)).toMatchObject({ gross: '$1,000.00', preTaxNet: '-$200.00', taxAmount: '$0.00', takeHomeNet: '-$200.00' });
  });
});

describe('Precision & Decimal Guard acceptance criteria', () => {
  it.each([33.33, '33.33'])('33.33 hours at $40 formats every amount to exactly two decimals (%s)', hours => {
    const result = calculateFreelanceFee({ hours, hourlyRate: 40, overheadExpenses: 0, taxRatePercent: 0 });
    expect(result).toEqual({ gross: '1333.20', preTaxNet: '1333.20', taxAmount: '0.00', takeHomeNet: '1333.20', isDeficit: false, errors: [] });
    expect(formatCurrencyOutputs(result)).toEqual({ gross: '$1,333.20', preTaxNet: '$1,333.20', taxAmount: '$0.00', takeHomeNet: '$1,333.20', isDeficit: false, errors: [] });
    for (const field of ['gross', 'preTaxNet', 'taxAmount', 'takeHomeNet']) {
      expect(result[field]).toMatch(/^\d+\.\d{2}$/);
    }
  });
});

describe('freelance calculator', () => {
  it('calculates revenue, net, and tax', () => {
    expect(calculateFreelanceFee(freelance)).toEqual({ gross: '1000.00', preTaxNet: '800.00', taxAmount: '200.00', takeHomeNet: '600.00', isDeficit: false, errors: [] });
  });
  it('does not tax a deficit', () => {
    expect(calculateFreelanceFee({ ...freelance, overheadExpenses: 1200 })).toMatchObject({ preTaxNet: '-200.00', taxAmount: '0.00', takeHomeNet: '-200.00', isDeficit: true });
  });
  it('allows zero revenue and a 100% tax rate', () => {
    expect(calculateFreelanceFee({ ...freelance, taxRatePercent: 100 }).takeHomeNet).toBe('0.00');
    expect(calculateFreelanceFee({ ...freelance, hourlyRate: 0, overheadExpenses: 0 })).toMatchObject({ gross: '0.00', isDeficit: false, errors: [] });
  });
  it('handles decimal inputs without binary arithmetic and rounds half-up', () => {
    expect(calculateFreelanceFee({ hours: '3', hourlyRate: '0.1', overheadExpenses: '0.2', taxRatePercent: '0' }).takeHomeNet).toBe('0.10');
    expect(calculateFreelanceFee({ ...freelance, hours: 1, hourlyRate: '1.005', overheadExpenses: 0, taxRatePercent: 0 }).gross).toBe('1.01');
  });
  it('uses unrounded amounts for tax and deficit flags', () => {
    expect(calculateFreelanceFee({ hours: 1, hourlyRate: '0.014', overheadExpenses: 0, taxRatePercent: 50 })).toMatchObject({ gross: '0.01', taxAmount: '0.01', takeHomeNet: '0.01' });
    expect(calculateFreelanceFee({ hours: 1, hourlyRate: 0, overheadExpenses: '0.001', taxRatePercent: 10 })).toMatchObject({ preTaxNet: '0.00', isDeficit: true });
  });
  it.each([['hours', 0], ['hours', -1], ['hourlyRate', -1], ['overheadExpenses', -1], ['taxRatePercent', -1], ['taxRatePercent', 101]])('rejects invalid %s = %s', (field, value) => {
    const result = calculateFreelanceFee({ ...freelance, [field]: value });
    expect(result.errors).toEqual([{ field, message: expect.any(String) }]);
    expect(result.gross).toBe(field === 'hours' && value === 0 ? '0.00' : null);
  });
});


import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App.jsx';
import FreelancerCalculator from '../components/freelancer/FreelancerCalculator.jsx';
import AgencyCalculator from '../components/agency/AgencyCalculator.jsx';
import { calculateEffectiveMargin } from '../logic/agencyLogic.js';

const freelance = { hours: '40', hourlyRate: '75', overheadExpenses: '300', taxRatePercent: '20' };
const agency = { subcontractorCost: '4000', targetMarginPercent: '20', clientDiscountPercent: '0' };
const onChange = () => {};

describe('calculator views', () => {
  it('renders hourly inputs and a derived contractor cost badge', () => {
    const html = renderToStaticMarkup(<AgencyCalculator values={{ billingMode: 'hourly', subcontractorHours: '40', subcontractorHourlyRate: '50', targetMarginPercent: '20', clientDiscountPercent: '0' }} onChange={onChange} />);
    expect(html).toContain('Subcontractor Hours');
    expect(html).toContain('Subcontractor Hourly Rate ($/hr)');
    expect(html).toContain('Contractor Cost: $2,000.00');
    expect(html).toContain('$2,500.00');
    expect(html).not.toContain('Subcontractor Total Cost ($)');
  });
  it('shows the hourly zero guard inline and suppresses invalid quotes', () => {
    const html = renderToStaticMarkup(<AgencyCalculator values={{ billingMode: 'hourly', subcontractorHours: '0', subcontractorHourlyRate: '50', targetMarginPercent: '20', clientDiscountPercent: '0' }} onChange={onChange} />);
    expect(html).toContain('Subcontractor hours must be greater than 0');
    expect(html).toContain('Contractor Cost: —');
    expect(html).not.toContain('$2,500.00');
  });
  it('renders the role selector and initial freelance estimate', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Project &amp; Agency Fee Calculator');
    expect(html.match(/type="radio"/g)).toHaveLength(2);
    expect(html).toContain('$2,160.00');
  });
  it('associates inline errors with inputs and suppresses invalid estimates', () => {
    const html = renderToStaticMarkup(<FreelancerCalculator values={{ ...freelance, hours: '' }} onChange={onChange} />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="input-hours-hint input-hours-error"');
    expect(html).toContain('id="input-hours-error"');
    expect(html).toContain('Correct the highlighted fields');
    expect(html).not.toContain('$2,160.00');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it('shows a freelance deficit warning', () => {
    const html = renderToStaticMarkup(<FreelancerCalculator values={{ ...freelance, overheadExpenses: '4000' }} onChange={onChange} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('Deficit Warning');
    expect(html).toContain('-$1,000.00');
  });
  it('treats an empty optional discount as zero', () => {
    const html = renderToStaticMarkup(<AgencyCalculator values={{ ...agency, clientDiscountPercent: '' }} onChange={onChange} />);
    expect(html).toContain('$5,000.00');
    expect(html).toContain('20.00%');
    expect(html).not.toContain('aria-invalid="true"');
  });
  it('shows below-cost warnings and negative effective margin', () => {
    const html = renderToStaticMarkup(<AgencyCalculator values={{ ...agency, clientDiscountPercent: '25' }} onChange={onChange} />);
    expect(html).toContain('Quote Below Contractor Cost');
    expect(html).toContain('$3,750.00');
    expect(html).toContain('-6.67%');
  });
  it('rejects a 100% margin inline and suppresses all outputs', () => {
    const html = renderToStaticMarkup(<AgencyCalculator values={{ ...agency, targetMarginPercent: '100' }} onChange={onChange} />);
    expect(html).toContain('Agency margin must be less than 100%');
    expect(html).toContain('aria-invalid="true"');
    expect(html).not.toContain('$5,000.00');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
});

describe('effective margin', () => {
  it.each([['0', '20.00'], ['20', '0.00'], ['25', '-6.67'], ['100', null]])('handles %s%% discount', (clientDiscountPercent, expected) => {
    expect(calculateEffectiveMargin({ ...agency, clientDiscountPercent })).toBe(expected);
  });
  it('returns null for invalid inputs', () => {
    expect(calculateEffectiveMargin({ ...agency, targetMarginPercent: '100' })).toBeNull();
  });
  it('accepts the same trimmed decimal inputs as the agency calculator', () => {
    expect(calculateEffectiveMargin({ ...agency, targetMarginPercent: ' 20 ', clientDiscountPercent: ' 25 ' })).toBe('-6.67');
  });
});

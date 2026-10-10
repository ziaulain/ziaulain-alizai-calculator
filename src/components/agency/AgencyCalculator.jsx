import { calculateAgencyFee, calculateAgencyContractorCost, calculateEffectiveMargin } from '../../logic/agencyLogic.js';
import { formatCurrencyOutputs } from '../../logic/shared/formatters.js';
import InputCard from '../shared/InputCard.jsx';
import AgencyBreakdown from './AgencyBreakdown.jsx';

export default function AgencyCalculator({ values, onChange }) {
  const billingMode = values.billingMode ?? 'fixed';
  const params = { ...values, clientDiscountPercent: values.clientDiscountPercent.trim() === '' ? '0' : values.clientDiscountPercent };
  const result = calculateAgencyFee(params);
  const display = formatCurrencyOutputs(result);
  const errors = Object.fromEntries(result.errors.map(error => [error.field, error.message]));
  const margin = calculateEffectiveMargin(params);
  const contractorCost = formatCurrencyOutputs({ basePrice: calculateAgencyContractorCost(params) }).basePrice;
  const costFields = billingMode === 'hourly' ? [
    { field: 'subcontractorHours', label: 'Subcontractor Hours', unit: 'hrs', hint: 'Total contractor time. Convert day rates to hours and an hourly rate.', positive: true },
    { field: 'subcontractorHourlyRate', label: 'Subcontractor Hourly Rate ($/hr)', unit: '$/hr', hint: 'Contractor cost per hour in USD. May be zero.' },
  ] : [
    { field: values.billingMode === undefined && values.flatSubcontractorCost === undefined ? 'subcontractorCost' : 'flatSubcontractorCost', label: 'Subcontractor Total Cost ($)', unit: '$', hint: 'Total contractor pass-through cost in USD.', positive: true },
  ];
  const fields = [
    { field: 'targetMarginPercent', label: 'Target Agency Margin %', unit: '%', hint: 'Share of the quote kept as profit. Must be below 100%.', max: 100 },
    { field: 'clientDiscountPercent', label: 'Optional Client Discount %', unit: '%', hint: 'Discount on your standard quote. Leave blank for no discount.', max: 100 },
  ];
  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <section aria-labelledby="agency-inputs" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 id="agency-inputs" className="text-lg font-semibold">Build your client price</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Price for your target margin, then see the impact of a discount.</p>
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Project billing mode</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {[['fixed', 'Flat Fee / Project'], ['hourly', 'Hourly / Day Rate']].map(([mode, label]) => <label key={mode} className="relative cursor-pointer">
            <input type="radio" name="billingMode" value={mode} checked={billingMode === mode} onChange={() => onChange('billingMode', mode)} className="peer sr-only" />
            <span className="block rounded-lg px-3 py-3 text-center text-sm font-semibold text-slate-600 peer-checked:bg-teal-800 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700">{label}</span>
          </label>)}
        </div>
      </fieldset>
      <div className="mt-6 grid gap-6">{costFields.map(props => <InputCard key={props.field} {...props} value={values[props.field]} onChange={onChange} error={errors[props.field]} />)}</div>
      {billingMode === 'hourly' && <p aria-live="polite" className="mt-4 break-all rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Contractor Cost: {contractorCost}</p>}
      <div className="mt-6 grid gap-6">{fields.map(props => <InputCard key={props.field} {...props} value={values[props.field]} onChange={onChange} error={errors[props.field]} />)}</div>
    </section>
    <AgencyBreakdown result={result} display={display} contractorCost={contractorCost} margin={margin} />
  </div>;
}

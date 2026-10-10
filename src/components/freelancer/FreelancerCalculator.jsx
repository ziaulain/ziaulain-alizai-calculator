import { calculateFreelanceFee } from '../../logic/freelanceLogic.js';
import { formatCurrencyOutputs } from '../../logic/shared/formatters.js';
import InputCard from '../shared/InputCard.jsx';
import FreelancerBreakdown from './FreelancerBreakdown.jsx';

export default function FreelancerCalculator({ values, onChange }) {
  const result = calculateFreelanceFee(values);
  const display = formatCurrencyOutputs(result);
  const errors = Object.fromEntries(result.errors.map(error => [error.field, error.message]));
  const fields = [
    { field: 'hours', label: 'Estimated Hours', unit: 'hrs', hint: 'Total time you expect to spend on this project.', positive: true },
    { field: 'hourlyRate', label: 'Hourly Rate', unit: '$', hint: 'Your billable rate in USD.' },
    { field: 'overheadExpenses', label: 'Overhead Expenses', unit: '$', hint: 'Tools, materials, and other project costs.' },
    { field: 'taxRatePercent', label: 'Expected Tax %', unit: '%', hint: 'Percentage of positive net income to set aside.', max: 100 },
  ];
  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <section aria-labelledby="freelance-inputs" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 id="freelance-inputs" className="text-lg font-semibold">Build your quote</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">See what you’ll bill, what you’ll spend, and what you’ll keep.</p>
      <div className="mt-7 grid gap-6 sm:grid-cols-2">{fields.map(props => <InputCard key={props.field} {...props} value={values[props.field]} onChange={onChange} error={errors[props.field]} />)}</div>
    </section>
    <FreelancerBreakdown result={result} display={display} values={values} />
  </div>;
}

import { sanitizeNumericInput } from '../../logic/shared/input.js';

export default function InputCard({ field, label, value, onChange, error, unit, hint, positive }) {
  const id = `input-${field}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <div className={`flex items-center rounded-xl border bg-white transition focus-within:ring-2 ${error ? 'border-red-500 focus-within:ring-red-200' : 'border-slate-300 focus-within:border-teal-700 focus-within:ring-teal-100'}`}>
        <span className="pl-4 text-sm text-slate-500" aria-hidden="true">{unit}</span>
        <input id={id} name={field} type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
          value={value} onChange={event => onChange(field, sanitizeNumericInput(event.target.value, value))}
          aria-invalid={Boolean(error)} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          required={field !== 'clientDiscountPercent'}
          className="min-w-0 w-full rounded-xl bg-transparent px-3 py-3 text-lg font-semibold text-slate-900 outline-none" />
      </div>
      <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-slate-500">{hint}{positive ? ' Must be greater than 0.' : ''}</p>
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

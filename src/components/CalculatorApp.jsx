import { useState } from 'react';
import FreelancerCalculator from './freelancer/FreelancerCalculator.jsx';
import AgencyCalculator from './agency/AgencyCalculator.jsx';
import { FREELANCE_DEFAULTS } from '../logic/freelanceLogic.js';
import { AGENCY_DEFAULTS } from '../logic/agencyLogic.js';

export default function CalculatorApp() {
  const [role, setRole] = useState('freelancer');
  const [freelance, setFreelance] = useState({ ...FREELANCE_DEFAULTS });
  const [agency, setAgency] = useState({ ...AGENCY_DEFAULTS });
  const update = setter => (field, value) => setter(previous => ({ ...previous, [field]: value }));
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <a href="#calculator" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-white focus:p-3">Skip to calculator</a>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Know your numbers</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Project &amp; Agency Fee Calculator</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">A clearer quote. A healthier project. See where every dollar goes.</p>
        <fieldset className="mt-7">
          <legend className="mb-3 text-sm font-semibold text-slate-700">Choose your perspective</legend>
          <div className="inline-grid w-full gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto sm:grid-cols-2">
            {[['freelancer', 'Solo Freelancer (Quote & Take-Home)'], ['agency', 'Agency Lead (Cost & Margin Builder)']].map(([value, label]) => <label key={value} className="relative cursor-pointer">
              <input type="radio" name="perspective" value={value} checked={role === value} onChange={() => setRole(value)} className="peer sr-only" />
              <span className="block rounded-lg px-4 py-3 text-center text-sm font-semibold text-slate-600 transition peer-checked:bg-teal-800 peer-checked:text-white peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700">{label}</span>
            </label>)}
          </div>
        </fieldset>
      </div>
    </header>
    <main id="calculator" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-8 outline-none sm:px-8 sm:py-10">
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => role === 'freelancer' ? setFreelance({ ...FREELANCE_DEFAULTS }) : setAgency({ ...AGENCY_DEFAULTS })}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Reset to Defaults<span className="sr-only"> for {role === 'freelancer' ? 'Solo Freelancer' : 'Agency Lead'}</span></button>
      </div>
      {role === 'freelancer' ? <FreelancerCalculator values={freelance} onChange={update(setFreelance)} /> : <AgencyCalculator values={agency} onChange={update(setAgency)} />}
      <p className="mt-6 text-center text-xs leading-5 text-slate-500">Estimates update as you type. Your inputs stay in this browser session.</p>
    </main>
  </div>;
}

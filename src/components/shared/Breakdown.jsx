export default function Breakdown({ title, valid, rows, highlight, warning, note }) {
  return (
    <section aria-label={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${valid ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>{valid ? 'Live estimate' : 'Check inputs'}</span>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <dl className="space-y-5">
          {rows.map(row => <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-5">
            <dt className="text-sm text-slate-600">{row.label}</dt>
            <dd className="max-w-full break-all text-lg font-semibold tabular-nums text-slate-900">{valid ? row.value : '—'}</dd>
          </div>)}
        </dl>
        <div className={`mt-7 rounded-xl p-5 ${warning ? 'bg-red-50 text-red-900' : 'bg-teal-50 text-teal-950'}`}>
          <p className="text-sm font-medium">{highlight.label}</p>
          <p className="mt-2 break-all text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{valid ? highlight.value : '—'}</p>
          <p className="mt-3 text-xs leading-5">{valid ? note : 'Correct the highlighted fields to see your estimate.'}</p>
        </div>
      </div>
      {valid && warning && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"><p className="font-bold">{warning.title}</p><p>{warning.message}</p></div>}
    </section>
  );
}

import Breakdown from '../shared/Breakdown.jsx';
import { formatUSD } from '../../logic/shared/formatters.js';

export default function FreelancerBreakdown({ result, display, values }) {
  return (
    <Breakdown title="Your project breakdown" valid={!result.errors.length}
      rows={[{ label: 'Gross Quote', value: display.gross }, { label: 'Expenses', value: formatUSD(values.overheadExpenses) }, { label: 'Pre-Tax Net', value: display.preTaxNet }, { label: 'Tax Withholding', value: display.taxAmount }]}
      highlight={{ label: 'Final Take-Home Pay', value: display.takeHomeNet }}
      note="Your quote after expenses and estimated tax withholding. All amounts in USD."
      warning={result.isDeficit ? { title: 'Deficit Warning', message: 'Your expenses exceed your revenue. This project leaves you with a loss; no tax withholding is applied.' } : null} />
  );
}

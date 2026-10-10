import Breakdown from '../shared/Breakdown.jsx';

export default function AgencyBreakdown({ result, display, contractorCost, margin }) {
  return (
    <Breakdown title="Your agency breakdown" valid={!result.errors.length}
      rows={[{ label: 'Standard Client Price', value: display.basePrice }, { label: 'Subcontractor Cost', value: contractorCost }, { label: 'Agency Gross Profit', value: display.agencyProfit }, { label: 'Profit After Discount', value: display.effectiveProfit }, { label: 'Effective Margin', value: margin === null ? 'N/A (zero client price)' : `${margin}%` }]}
      highlight={{ label: 'Quoted Client Price', value: display.finalPrice }}
      note="Final quote after discount. Effective margin is profit after discount divided by the final quote. All amounts in USD."
      warning={result.operatesBelowCost ? { title: 'Quote Below Contractor Cost', message: 'The client discount reduces your quote below contractor pass-through cost. Your agency would cover the difference.' } : null} />
  );
}

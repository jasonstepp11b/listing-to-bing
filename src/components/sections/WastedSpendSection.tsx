import type { CampaignResponse } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  wastedSpendTips: CampaignResponse['wastedSpendTips']
}

export function WastedSpendSection({ wastedSpendTips }: Props) {
  const copyText = [
    'SEARCHES TO AVOID (add these as negative keywords):',
    ...wastedSpendTips.avoidSearches.map(s => `• ${s}`),
    '',
    'BUDGET WARNINGS:',
    ...wastedSpendTips.budgetWarnings.map(w => `• ${w}`),
    '',
    'COMMON MISTAKES TO AVOID:',
    ...wastedSpendTips.commonMistakes.map(m => `• ${m}`),
  ].join('\n')

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-xl font-semibold text-slate-900">Wasted Spend Protection</h2>
        <CopyButton text={copyText} />
      </div>
      <p className="text-sm text-amber-800 mb-5">
        These are the most common ways real estate ad budgets get wasted. Read this before you launch.
      </p>

      <div className="space-y-5">
        <div>
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Searches to Avoid
          </h3>
          <ul className="space-y-1.5">
            {wastedSpendTips.avoidSearches.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 shrink-0 mt-0.5">&#8212;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-amber-200 pt-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Budget Warnings
          </h3>
          <ul className="space-y-1.5">
            {wastedSpendTips.budgetWarnings.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 shrink-0 mt-0.5">&#8212;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-amber-200 pt-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Common Mistakes
          </h3>
          <ul className="space-y-1.5">
            {wastedSpendTips.commonMistakes.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 shrink-0 mt-0.5">&#8212;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

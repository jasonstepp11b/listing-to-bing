import type { CampaignResponse } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  strategy: CampaignResponse['strategy']
}

function buildCopyText(strategy: CampaignResponse['strategy']): string {
  return [
    `Campaign Type: Buyer Lead Campaign`,
    `Target Audience: ${strategy.targetAudience}`,
    `Daily Budget: ${strategy.budgetRecommendation}`,
    `Device Targeting: ${strategy.deviceTargeting}`,
    `Geo Targeting: ${strategy.geoTargeting}`,
  ].join('\n')
}

export function StrategySection({ strategy }: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Campaign Strategy</h2>
        <CopyButton text={buildCopyText(strategy)} />
      </div>

      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-5">
        Buyer Lead Campaign
      </div>

      <dl className="space-y-0">
        {[
          { label: 'Target Audience', value: strategy.targetAudience },
          { label: 'Daily Budget', value: strategy.budgetRecommendation },
          { label: 'Device Targeting', value: strategy.deviceTargeting },
          { label: 'Geo Targeting', value: strategy.geoTargeting },
        ].map(({ label: rowLabel, value }, i) => (
          <div
            key={rowLabel}
            className={`grid grid-cols-[160px_1fr] gap-3 py-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}
          >
            <dt className="text-sm font-medium text-slate-500">{rowLabel}</dt>
            <dd className="text-sm text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

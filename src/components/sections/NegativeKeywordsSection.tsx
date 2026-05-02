import type { CampaignResponse } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  negativeKeywords: CampaignResponse['negativeKeywords']
}

export function NegativeKeywordsSection({ negativeKeywords }: Props) {
  const copyText = negativeKeywords.list.join('\n')

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Negative Keywords — Why These Save You Money
        </h2>
        <CopyButton text={copyText} />
      </div>

      {/* Rationale leads the section — this is the differentiator made visible */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-5">
        <p className="text-sm text-blue-900 leading-relaxed">{negativeKeywords.rationale}</p>
      </div>

      <div>
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
          Keywords to Block
        </h3>
        <div className="flex flex-wrap gap-2">
          {negativeKeywords.list.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

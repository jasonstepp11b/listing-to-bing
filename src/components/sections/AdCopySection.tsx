import type { CampaignResponse } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  adCopy: CampaignResponse['adCopy']
}

export function AdCopySection({ adCopy }: Props) {
  const copyText = [
    'HEADLINES',
    ...adCopy.headlines.map((h, i) => `${i + 1}. ${h}`),
    '',
    'DESCRIPTIONS',
    ...adCopy.descriptions.map((d, i) => `${i + 1}. ${d}`),
  ].join('\n')

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Ad Copy</h2>
        <CopyButton text={copyText} />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            Headlines{' '}
            <span className="normal-case font-normal text-slate-400">
              (max 30 characters each in Bing)
            </span>
          </h3>
          <ol className="space-y-2">
            {adCopy.headlines.map((headline, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-slate-400 font-mono w-5 shrink-0 pt-0.5">
                  {i + 1}.
                </span>
                <span className="text-slate-800">{headline}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            Descriptions{' '}
            <span className="normal-case font-normal text-slate-400">
              (max 90 characters each in Bing)
            </span>
          </h3>
          <ol className="space-y-2">
            {adCopy.descriptions.map((desc, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-slate-400 font-mono w-5 shrink-0 pt-0.5">
                  {i + 1}.
                </span>
                <span className="text-slate-800">{desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

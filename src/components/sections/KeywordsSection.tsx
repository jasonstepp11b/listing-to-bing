import type { CampaignResponse, Keyword } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  keywords: CampaignResponse['keywords']
}

function intentDotClass(score: number): string {
  if (score >= 9) return 'bg-green-500'
  if (score >= 7) return 'bg-blue-500'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-slate-400'
}

function KeywordTable({ list, label }: { list: Keyword[]; label: string }) {
  const sorted = [...list].sort((a, b) => b.intentScore - a.intentScore)
  const copyText = sorted.map(kw => kw.text).join('\n')

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <CopyButton text={copyText} />
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide pb-2 pr-4">
              Keyword
            </th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide pb-2 pr-4">
              Match Type
            </th>
            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide pb-2">
              Intent
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((kw, i) => (
            <tr
              key={i}
              className={`border-t border-slate-100 ${kw.intentScore >= 9 ? 'font-semibold' : ''}`}
            >
              <td className="py-2 pr-4 text-sm text-slate-800">{kw.text}</td>
              <td className="py-2 pr-4">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    kw.matchType === 'exact'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {kw.matchType}
                </span>
              </td>
              <td className="py-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${intentDotClass(kw.intentScore)}`}
                  />
                  {kw.intentScore}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-400 mt-2">
        Bold rows = high priority (intent score 9–10). Use these first.
      </p>
    </div>
  )
}

export function KeywordsSection({ keywords }: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">Keywords</h2>

      <div className="space-y-8">
        {keywords.buyer.length > 0 && <KeywordTable list={keywords.buyer} label="Buyer Keywords" />}
      </div>
    </section>
  )
}

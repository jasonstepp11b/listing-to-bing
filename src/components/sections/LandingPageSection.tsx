import type { CampaignResponse } from '../../lib/types'
import { CopyButton } from '../ui/CopyButton'

type Props = {
  landingPage: CampaignResponse['landingPage']
}

export function LandingPageSection({ landingPage }: Props) {
  const copyText = [
    `Headline: ${landingPage.headline}`,
    `Subheadline: ${landingPage.subheadline}`,
    `CTA Button: ${landingPage.cta}`,
    '',
    'Bullet Points:',
    ...landingPage.bullets.map(b => `• ${b}`),
    '',
    'Trust Elements:',
    ...landingPage.trustElements.map(t => `• ${t}`),
  ].join('\n')

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Landing Page Copy</h2>
        <CopyButton text={copyText} />
      </div>

      {/* Preview — gives the agent a visual sense of what their page should look like */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {landingPage.headline}
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">{landingPage.subheadline}</p>
          {/* Non-functional — shows agents what CTA text to use */}
          <span className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg cursor-default select-none">
            {landingPage.cta}
          </span>
        </div>

        <div className="px-6 py-5 bg-white border-t border-slate-200">
          <ul className="space-y-2 mb-5">
            {landingPage.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 shrink-0">&#10003;</span>
                {bullet}
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-x-5 gap-y-1">
            {landingPage.trustElements.map((element, i) => (
              <span key={i} className="text-xs text-slate-400">
                {element}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Preview only — copy the text above into your landing page builder.
      </p>
    </section>
  )
}

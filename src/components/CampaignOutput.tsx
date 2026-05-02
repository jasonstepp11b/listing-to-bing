import type { CampaignResponse } from '../lib/types'
import { StrategySection } from './sections/StrategySection'
import { KeywordsSection } from './sections/KeywordsSection'
import { NegativeKeywordsSection } from './sections/NegativeKeywordsSection'
import { AdCopySection } from './sections/AdCopySection'
import { LandingPageSection } from './sections/LandingPageSection'
import { WastedSpendSection } from './sections/WastedSpendSection'

type Props = {
  campaign: CampaignResponse
  onReset: () => void
}

const WHAT_NEXT_STEPS = [
  'Sign in to Microsoft Advertising (ads.microsoft.com) and click "Create campaign."',
  'Choose "Visits to my website" as your goal, then select "Search" as the campaign type.',
  'Name your campaign and set the daily budget using the recommendation from the Strategy section above.',
  'Set your geo targeting — enter the city and radius shown in the Strategy section.',
  'Add your keywords — use the keyword list above. Set each match type (phrase or exact) as shown.',
  'Add your negative keywords — go to "Negative Keywords" in the campaign settings and paste the list.',
  'Build your ads — create at least 3 headline and 2 description combinations using the Ad Copy section.',
  'Review all settings, click "Save," and your campaign is live. Check back after 48 hours to see early results.',
]

function WhatsNext() {
  return (
    <section className="bg-slate-900 text-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">How to Use This in Microsoft Ads</h2>
      <p className="text-slate-400 text-sm mb-5">
        Follow these steps to get your campaign live — takes about 15 minutes.
      </p>
      <ol className="space-y-3">
        {WHAT_NEXT_STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="text-slate-500 font-mono w-5 shrink-0 mt-0.5">{i + 1}.</span>
            <span className="text-slate-200">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function CampaignOutput({ campaign, onReset }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Bing Ads Campaign</h1>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Start over
        </button>
      </div>

      <div className="space-y-6">
        <StrategySection strategy={campaign.strategy} />
        <KeywordsSection keywords={campaign.keywords} />
        <NegativeKeywordsSection negativeKeywords={campaign.negativeKeywords} />
        <AdCopySection adCopy={campaign.adCopy} />
        <LandingPageSection landingPage={campaign.landingPage} />
        <WastedSpendSection wastedSpendTips={campaign.wastedSpendTips} />
        <WhatsNext />
      </div>
    </div>
  )
}

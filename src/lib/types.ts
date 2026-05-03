// Validation limits — must stay in sync with supabase/functions/generate-campaign/schema.ts
export const LISTING_MAX_LENGTH = 5000
export const LISTING_MIN_SOFT = 100
export const PRICE_HARD_MIN = 10_000
export const PRICE_HARD_MAX = 50_000_000
// Warn when price is suspiciously low [$10k, $50k) or suspiciously high ($5M, $50M]
export const PRICE_SOFT_MAX_LOW = 50_000
export const PRICE_SOFT_MIN_HIGH = 5_000_000
export const CITY_SOFT_MIN = 2

export type Keyword = {
  text: string
  matchType: 'phrase' | 'exact'
  intentScore: number
}

export type CampaignResponse = {
  strategy: {
    campaignType: 'buyer'
    targetAudience: string
    budgetRecommendation: string
    deviceTargeting: string
    geoTargeting: string
  }
  keywords: {
    buyer: Keyword[]
  }
  negativeKeywords: {
    list: string[]
    rationale: string
  }
  adCopy: {
    headlines: string[]
    descriptions: string[]
  }
  landingPage: {
    headline: string
    subheadline: string
    cta: string
    bullets: string[]
    trustElements: string[]
  }
  wastedSpendTips: {
    avoidSearches: string[]
    budgetWarnings: string[]
    commonMistakes: string[]
  }
}

export type GenerateRequest = {
  listing: string
  city: string
  price: number
}

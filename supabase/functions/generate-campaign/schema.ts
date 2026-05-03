import { z } from 'npm:zod'

// Must stay in sync with src/lib/types.ts
const LISTING_MAX_LENGTH = 5000
const PRICE_HARD_MIN = 10_000
const PRICE_HARD_MAX = 50_000_000

export const RequestSchema = z.object({
  listing: z.string()
    .min(1, 'Please enter the property listing.')
    .max(LISTING_MAX_LENGTH, `Listing must be ${LISTING_MAX_LENGTH} characters or fewer.`),
  city: z.string().min(1, 'Please enter a city.'),
  price: z.number()
    .min(PRICE_HARD_MIN, 'Please enter a realistic price.')
    .max(PRICE_HARD_MAX, 'Please enter a realistic price.'),
})

export type GenerateRequest = z.infer<typeof RequestSchema>

const KeywordSchema = z.object({
  text: z.string(),
  matchType: z.enum(['phrase', 'exact']),
  intentScore: z.number().min(1).max(10),
})

export const ResponseSchema = z.object({
  strategy: z.object({
    campaignType: z.literal('buyer'),
    targetAudience: z.string(),
    budgetRecommendation: z.string(),
    deviceTargeting: z.string(),
    geoTargeting: z.string(),
  }),
  keywords: z.object({
    buyer: z.array(KeywordSchema),
  }),
  negativeKeywords: z.object({
    list: z.array(z.string()),
    rationale: z.string(),
  }),
  adCopy: z.object({
    headlines: z.array(z.string()).min(5).max(10),
    descriptions: z.array(z.string()).min(3).max(5),
  }),
  landingPage: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta: z.string(),
    bullets: z.array(z.string()).min(3).max(6),
    trustElements: z.array(z.string()).min(2).max(4),
  }),
  wastedSpendTips: z.object({
    avoidSearches: z.array(z.string()),
    budgetWarnings: z.array(z.string()),
    commonMistakes: z.array(z.string()),
  }),
})

export type CampaignResponse = z.infer<typeof ResponseSchema>

export const NEGATIVE_KEYWORD_BASELINE = ['rent', 'apartment', 'jobs', 'cheap', 'craigslist', 'free']

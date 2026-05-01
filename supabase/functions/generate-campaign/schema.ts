import { z } from 'zod';

const keywordSchema = z.object({
  text: z.string(),
  matchType: z.enum(['phrase', 'exact']),
  intentScore: z.number().int().min(1).max(10),
});

export const requestSchema = z.object({
  listing: z.string().min(1),
  city: z.string().min(1),
  price: z.number().gt(0),
  leadType: z.enum(['buyer', 'seller']).default('seller'),
});

export const responseSchema = z.object({
  strategy: z.object({
    campaignType: z.enum(['buyer', 'seller']),
    targetAudience: z.string(),
    budgetRecommendation: z.string(),
    deviceTargeting: z.string(),
    geoTargeting: z.string(),
  }),
  keywords: z.object({
    buyer: z.array(keywordSchema),
    seller: z.array(keywordSchema),
  }),
  negativeKeywords: z.object({
    list: z.array(z.string()),
    rationale: z.string(),
  }),
  adCopy: z.object({
    headlines: z.array(z.string()),
    descriptions: z.array(z.string()),
  }),
  landingPage: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta: z.string(),
    bullets: z.array(z.string()),
    trustElements: z.array(z.string()),
  }),
  wastedSpendTips: z.object({
    avoidSearches: z.array(z.string()),
    budgetWarnings: z.array(z.string()),
    commonMistakes: z.array(z.string()),
  }),
});

export type RequestBody = z.infer<typeof requestSchema>;
export type CampaignResponse = z.infer<typeof responseSchema>;

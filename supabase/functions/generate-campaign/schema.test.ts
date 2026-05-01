import { describe, expect, it } from 'vitest';
import { responseSchema } from './schema';

const validCampaign = {
  strategy: {
    campaignType: 'seller' as const,
    targetAudience: 'Homeowners in Austin considering selling in the next 90 days.',
    budgetRecommendation: '$40–$60/day',
    deviceTargeting: 'Desktop-heavy, ~70/30',
    geoTargeting: 'Austin + 15 mi radius',
  },
  keywords: {
    buyer: [{ text: 'homes for sale Austin TX', matchType: 'phrase' as const, intentScore: 9 }],
    seller: [{ text: 'sell my home Austin', matchType: 'exact' as const, intentScore: 10 }],
  },
  negativeKeywords: {
    list: ['rent', 'apartment', 'jobs', 'cheap', 'craigslist', 'free'],
    rationale: 'These terms attract renters and job seekers, not motivated sellers.',
  },
  adCopy: {
    headlines: ['Sell Your Austin Home Fast', 'Free Home Valuation', 'Local Austin Realtor'],
    descriptions: ['Honest advice from a local expert.', 'No pressure. No upfront costs.'],
  },
  landingPage: {
    headline: 'Thinking About Selling Your Austin Home?',
    subheadline: 'Find out what your home is worth — free, fast, no obligation.',
    cta: 'Get My Free Home Value',
    bullets: ['Local market expertise', 'No upfront costs', 'Trusted by 200+ sellers'],
    trustElements: ['5-star rated on Google', 'Licensed in Texas'],
  },
  wastedSpendTips: {
    avoidSearches: ['how to sell without a realtor', 'FSBO Austin'],
    budgetWarnings: ['Avoid broad match on generic terms like "homes"'],
    commonMistakes: ['Running ads 24/7 without dayparting'],
  },
};

describe('responseSchema', () => {
  it('accepts a fully valid CampaignResponse', () => {
    const result = responseSchema.safeParse(validCampaign);
    expect(result.success).toBe(true);
  });

  it('rejects a keyword with intentScore out of range', () => {
    const invalid = {
      ...validCampaign,
      keywords: {
        buyer: [{ text: 'homes for sale Austin TX', matchType: 'phrase', intentScore: 11 }],
        seller: validCampaign.keywords.seller,
      },
    };
    const result = responseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

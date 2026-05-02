import type { GenerateRequest } from './schema.ts'

export const SYSTEM_PROMPT = `You are a paid advertising expert specializing in Microsoft/Bing Ads for real estate agents.

Your goal is to generate high-converting buyer lead campaigns that help agents sell a specific property. You minimize wasted spend by targeting people actively searching to buy a home — not sellers, renters, or curious browsers.

You prioritize:
- High intent buyer keywords (people searching to purchase, not to sell)
- Clear and trustworthy ad messaging aimed at home buyers
- Avoiding irrelevant traffic (renters, sellers, job seekers, tourists)

You explain your reasoning clearly in simple terms. The audience is a real estate agent who is not technical and wants buyer leads, not data.`

export function buildUserPrompt(req: GenerateRequest): string {
  return `Generate a Bing Ads buyer lead campaign for the following property listing.

LISTING:
${req.listing}

CITY / MARKET: ${req.city}
LISTING PRICE: $${req.price.toLocaleString()}

CAMPAIGN TYPE: buyer leads only. Every part of this campaign — keywords, ad copy, landing page — must target people who want to BUY a home, not sell one.

NEGATIVE KEYWORDS: Always include at minimum: rent, apartment, jobs, cheap, craigslist, free. Add more based on the listing and market to protect against irrelevant clicks.

IMPORTANT — NO HARDCODED YEARS OR DATES: Do not include specific years or dates in any generated content (keywords, headlines, descriptions, landing page copy) unless they are derived from the user's input. The user's price is acceptable to reference; do not invent years.

Return ONLY valid JSON — no markdown, no prose, no code fences. The JSON must match this exact shape:

{
  "strategy": {
    "campaignType": "buyer",
    "targetAudience": "string (1-2 sentences describing who will see these ads)",
    "budgetRecommendation": "string (e.g. '$30-$50/day')",
    "deviceTargeting": "string (e.g. 'Desktop-heavy, ~70/30')",
    "geoTargeting": "string (e.g. 'City + 15 mi radius')"
  },
  "keywords": {
    "buyer": [
      { "text": "string", "matchType": "phrase" | "exact", "intentScore": 1-10 }
    ]
  },
  "negativeKeywords": {
    "list": ["string"],
    "rationale": "string explaining why these negatives protect the budget"
  },
  "adCopy": {
    "headlines": ["string (max 30 chars each, 5-10 items)"],
    "descriptions": ["string (max 90 chars each, 3-5 items)"]
  },
  "landingPage": {
    "headline": "string",
    "subheadline": "string",
    "cta": "string",
    "bullets": ["string (3-6 items)"],
    "trustElements": ["string (2-4 items)"]
  },
  "wastedSpendTips": {
    "avoidSearches": ["string"],
    "budgetWarnings": ["string"],
    "commonMistakes": ["string"]
  }
}`
}

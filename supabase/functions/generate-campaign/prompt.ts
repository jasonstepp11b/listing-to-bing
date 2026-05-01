import type { RequestBody } from './schema.ts';

// Verbatim from CLAUDE.md — canonical system prompt, do not paraphrase
export const SYSTEM_PROMPT =
  `You are a paid advertising expert specializing in Microsoft/Bing Ads for real estate agents.

Your goal is to generate high-converting ad campaigns that minimize wasted spend.

You prioritize:
- High intent keywords
- Clear and trustworthy ad messaging
- Avoiding irrelevant traffic

You explain your reasoning clearly in simple terms. The audience is a real estate agent who is not technical and wants leads, not data.`;

// Appended to the user prompt on the one retry after a parse failure
export const RETRY_SUFFIX =
  'Your previous response did not match the required JSON schema. Return ONLY valid JSON matching the schema exactly, with no surrounding text.';

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildUserPrompt(req: RequestBody): string {
  const { listing, city, price, leadType } = req;
  const goalLabel = leadType === 'buyer' ? 'Attract buyers' : 'Attract sellers';

  return `Generate a Bing Ads campaign for the following real estate listing.

Property listing:
${listing}

City: ${city}
Price: $${price.toLocaleString('en-US')}
Campaign goal: ${goalLabel}

Return ONLY a JSON object — no markdown fences, no prose, no explanation. The raw JSON must match this structure exactly:

{
  "strategy": {
    "campaignType": "buyer" or "seller",
    "targetAudience": "1-2 sentences describing the target audience",
    "budgetRecommendation": "human-readable, e.g. '$30-$50/day'",
    "deviceTargeting": "e.g. 'Desktop-heavy, ~70/30'",
    "geoTargeting": "e.g. 'City + 15 mi radius'"
  },
  "keywords": {
    "buyer": [
      { "text": "keyword text", "matchType": "phrase" or "exact", "intentScore": 1-10 }
    ],
    "seller": [
      { "text": "keyword text", "matchType": "phrase" or "exact", "intentScore": 1-10 }
    ]
  },
  "negativeKeywords": {
    "list": ["term1", "term2", ...],
    "rationale": "plain-English explanation of why these negatives protect the budget"
  },
  "adCopy": {
    "headlines": ["headline1", ..., "headline10"],
    "descriptions": ["desc1", ..., "desc5"]
  },
  "landingPage": {
    "headline": "page headline",
    "subheadline": "supporting line",
    "cta": "button text",
    "bullets": ["bullet1", ..., "bullet6"],
    "trustElements": ["trust1", ..., "trust4"]
  },
  "wastedSpendTips": {
    "avoidSearches": ["query1", ...],
    "budgetWarnings": ["warning1", ...],
    "commonMistakes": ["mistake1", ...]
  }
}

The negativeKeywords.list MUST include at minimum these baseline terms (add more as appropriate for this listing):
rent, apartment, jobs, cheap, craigslist, free

Tone: clear, trust-driven, slightly conservative. No hype, no gimmicks, no emoji in ad copy.`;
}

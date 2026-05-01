import { z } from 'zod';
import type { CampaignResponse, GenerateCampaignInput } from './types';

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (!apiUrl) {
  throw new Error('VITE_API_URL is not set. Add it to .env.local before running the app.');
}

// Supabase requires the anon key as a Bearer token to route requests to the project.
// VITE_SUPABASE_ANON_KEY is the public anon key — safe to expose in the frontend.
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const RequestSchema = z.object({
  listing: z.string().min(1),
  city: z.string().min(1),
  price: z.number().positive(),
  leadType: z.enum(['buyer', 'seller']),
});

const KeywordSchema = z.object({
  text: z.string(),
  matchType: z.enum(['phrase', 'exact']),
  intentScore: z.number(),
});

const ResponseSchema = z.object({
  strategy: z.object({
    campaignType: z.enum(['buyer', 'seller']),
    targetAudience: z.string(),
    budgetRecommendation: z.string(),
    deviceTargeting: z.string(),
    geoTargeting: z.string(),
  }),
  keywords: z.object({
    buyer: z.array(KeywordSchema),
    seller: z.array(KeywordSchema),
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

export class ApiError extends Error {
  readonly code: 'bad_input' | 'unparseable' | 'timeout' | 'network' | 'unknown';

  constructor(
    message: string,
    code: 'bad_input' | 'unparseable' | 'timeout' | 'network' | 'unknown',
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export async function generateCampaign(
  input: GenerateCampaignInput,
): Promise<CampaignResponse> {
  RequestSchema.parse(input);

  let response: Response;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Check your internet connection and try again.',
      'network',
    );
  }

  if (response.status === 400) {
    throw new ApiError(
      'The information you entered could not be processed. Please check your inputs and try again.',
      'bad_input',
    );
  }
  if (response.status === 502) {
    throw new ApiError(
      'The AI returned an unexpected response. Please try again.',
      'unparseable',
    );
  }
  if (response.status === 504) {
    throw new ApiError(
      'The request took too long. Please try again.',
      'timeout',
    );
  }
  if (!response.ok) {
    throw new ApiError(
      `Something went wrong (error ${response.status}). Please try again.`,
      'unknown',
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      'Received an unexpected response from the server. Please try again.',
      'unknown',
    );
  }

  const parsed = ResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(
      'The campaign data was in an unexpected format. Please try again.',
      'unparseable',
    );
  }

  return parsed.data;
}

import { requestSchema, responseSchema } from './schema.ts';
import { buildSystemPrompt, buildUserPrompt, RETRY_SUFFIX } from './prompt.ts';
import type { CampaignResponse } from './schema.ts';

// ── Config: read once at module load, fail fast on cold start ────────────────

const rawApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const rawModel = Deno.env.get('ANTHROPIC_MODEL');
const rawAllowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '';

if (!rawApiKey) throw new Error('Missing required env var: ANTHROPIC_API_KEY');
if (!rawModel) throw new Error('Missing required env var: ANTHROPIC_MODEL');

// Narrowed to string after the throws above
const API_KEY: string = rawApiKey;
const MODEL: string = rawModel;

// Empty list → fail closed: every origin check returns false → 403
const ALLOWED_ORIGINS: string[] = rawAllowedOrigin
  ? rawAllowedOrigin.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

const NEGATIVE_BASELINE = ['rent', 'apartment', 'jobs', 'cheap', 'craigslist', 'free'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function truncate(s: string, max = 200): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Using plain fetch rather than the Anthropic SDK — the SDK requires an npm
// specifier in Deno and adds resolution complexity for one POST call.
async function callClaude(userPrompt: string, signal: AbortSignal): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Claude API error ${res.status}: ${truncate(body)}`);
    throw new Error(`Claude API returned ${res.status}`);
  }

  const data = await res.json() as { content: Array<{ text: string }> };
  return data.content[0].text;
}

function tryParse(raw: string): CampaignResponse | null {
  // Claude occasionally wraps JSON in markdown fences; strip them if present
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj: unknown = JSON.parse(match[0]);
    const result = responseSchema.safeParse(obj);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Merge baseline keywords (case-insensitive dedup) to guarantee they appear
function mergeBaseline(list: string[]): string[] {
  const seen = new Set(list.map((s) => s.toLowerCase()));
  const missing = NEGATIVE_BASELINE.filter((kw) => !seen.has(kw));
  return [...list, ...missing];
}

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin);

  if (!allowed) {
    return new Response('Forbidden', { status: 403 });
  }

  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  console.log('Request received');

  // ── Parse request ──────────────────────────────────────────────────────────

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400, cors);
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join(', ');
    console.log(`Validation failed: ${truncate(issues)}`);
    return jsonResponse({ error: `Invalid request: ${issues}` }, 400, cors);
  }

  const { listing, city, price, leadType } = parsed.data;
  console.log(`Validation passed. leadType=${leadType}, city=${truncate(city, 60)}`);

  // ── Call Claude (25 s cap, one retry on parse failure) ─────────────────────

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const firstPrompt = buildUserPrompt({ listing, city, price, leadType });
    let rawText: string;

    const start = Date.now();
    try {
      rawText = await callClaude(firstPrompt, controller.signal);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Claude call timed out (45 s)');
        return jsonResponse(
          { error: 'Campaign generation timed out. Please try again.' },
          504,
          cors,
        );
      }
      console.error('Claude call failed:', err instanceof Error ? truncate(err.message) : 'unknown');
      return jsonResponse(
        { error: 'Failed to reach the AI service. Please try again.' },
        502,
        cors,
      );
    }
    console.log(`Claude responded in ${Date.now() - start}ms`);

    let campaign = tryParse(rawText);

    if (!campaign) {
      console.log('JSON parse failed on first attempt — retrying with stricter prompt');
      const retryPrompt = `${firstPrompt}\n\n${RETRY_SUFFIX}`;
      try {
        rawText = await callClaude(retryPrompt, controller.signal);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Claude retry timed out (25 s total)');
          return jsonResponse(
            { error: 'Campaign generation timed out. Please try again.' },
            504,
            cors,
          );
        }
        console.error('Claude retry failed:', err instanceof Error ? truncate(err.message) : 'unknown');
        return jsonResponse(
          { error: 'Failed to generate a valid campaign. Please try again.' },
          502,
          cors,
        );
      }
      campaign = tryParse(rawText);
    }

    if (!campaign) {
      console.error('JSON parse failed after retry — returning 502');
      return jsonResponse(
        { error: 'Failed to generate a valid campaign. Please try again.' },
        502,
        cors,
      );
    }

    // Guarantee baseline negative keywords are present
    campaign.negativeKeywords.list = mergeBaseline(campaign.negativeKeywords.list);

    console.log('Campaign generated successfully');
    return jsonResponse(campaign, 200, cors);

  } finally {
    clearTimeout(timeoutId);
  }
});

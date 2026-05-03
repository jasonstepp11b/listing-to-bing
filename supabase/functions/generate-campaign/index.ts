import { RequestSchema, ResponseSchema, NEGATIVE_KEYWORD_BASELINE } from './schema.ts'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL')
const ALLOWED_ORIGIN_RAW = Deno.env.get('ALLOWED_ORIGIN')
const ALLOWED_ORIGINS = (ALLOWED_ORIGIN_RAW ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
if (!ANTHROPIC_MODEL) throw new Error('ANTHROPIC_MODEL is not set')
if (ALLOWED_ORIGINS.length === 0) throw new Error('ALLOWED_ORIGIN is not set')

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

// Calls the Anthropic API directly (no SDK) to stay within edge function memory limits.
// 90s timeout gives headroom above the typical 15–25s generation time for longer listings.
async function callClaude(userPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Anthropic API error ${res.status}: ${text}`)
  }

  const data = await res.json() as { content: Array<{ type: string; text: string }> }
  const block = data.content[0]
  if (!block || block.type !== 'text') throw new Error('Unexpected response shape from Claude')
  return block.text
}

function mergeNegativeKeywords(list: string[]): string[] {
  const normalized = new Set(list.map(k => k.toLowerCase().trim()))
  for (const kw of NEGATIVE_KEYWORD_BASELINE) {
    normalized.add(kw.toLowerCase())
  }
  return Array.from(normalized)
}

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get('origin') ?? ''
  const isAllowed = ALLOWED_ORIGINS.includes(requestOrigin)
  const headers = corsHeaders(isAllowed ? requestOrigin : '')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers })
  }

  if (!isAllowed) {
    return new Response('Forbidden', { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? 'Invalid request.'
    return new Response(JSON.stringify({ error: firstMessage }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  const userPrompt = buildUserPrompt(parsed.data)

  // Step 1: call Claude. Timeout/API errors fail immediately — no point retrying a timeout.
  let rawText: string
  try {
    rawText = await callClaude(userPrompt)
  } catch (err) {
    console.error('Claude API call failed:', err)
    return new Response(
      JSON.stringify({ error: 'The AI service took too long or is unavailable. Please try again.' }),
      { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } },
    )
  }

  // Step 2: parse + validate. If invalid, retry once with a stricter JSON reminder.
  let campaign = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    const text = attempt === 1
      ? rawText
      : await callClaude(
          `${userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the raw JSON object — no markdown, no prose, no code fences.`,
        ).catch(() => null)

    if (!text) break

    try {
      const validated = ResponseSchema.safeParse(JSON.parse(text))
      if (validated.success) {
        campaign = validated.data
        break
      } else {
        console.error('Zod validation failed (attempt', attempt, '):', JSON.stringify(validated.error.flatten()))
      }
    } catch (err) {
      console.error('JSON parse failed (attempt', attempt, '):', err)
    }
  }

  if (!campaign) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate a valid campaign. Please try again.' }),
      { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } },
    )
  }

  campaign.negativeKeywords.list = mergeNegativeKeywords(campaign.negativeKeywords.list)

  return new Response(JSON.stringify(campaign), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
})

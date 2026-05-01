# CLAUDE.md

> Guidance for Claude Code when working in this repository.
> Read this entire file before making changes. Re-read it when you feel uncertain about scope.

---

## 🧠 Project Overview

**Listing-to-Bing-Leads Engine** — a lean MVP SaaS that helps real estate agents turn a property listing into a high-quality, ready-to-run Bing Ads campaign in minutes.

**The product does NOT manage ads or integrate with ad platforms.**
It focuses entirely on **campaign generation + decision support**.

### Core value proposition

> "Paste a listing → get a Bing Ads campaign that can generate leads without wasting money."

### Target user

Real estate agents (beginner to intermediate marketers). Likely non-technical. Wants leads, not data. Little understanding of keyword strategy.

---

## 🧭 Product Philosophy (read every time)

Three rules govern every decision:

1. **Simplicity wins.**
2. **Speed wins.**
3. **Clarity wins.**

We are not impressing developers. We are helping agents get leads.

### Key differentiator

- Most tools: generate ads.
- **This tool: helps users avoid wasting money AND generate leads.**

### UX principles

- No clutter.
- No jargon.
- No overwhelm.
- Every screen should answer: **"What do I do next?"**

### When in doubt

If a feature, abstraction, or library doesn't directly serve the success criteria below, **don't add it**.

---

## ✅ Success Criteria

The MVP is successful if:

1. A user can paste a listing.
2. Receive a campaign in **< 10 seconds**.
3. Understand what to do next.
4. Feel confident running ads.

If a change makes any of these worse, push back before implementing.

---

## 🚫 Out of Scope (do NOT build)

These are explicitly excluded from the MVP. Do not add them, even if convenient:

- Microsoft Ads API integration
- Campaign auto-launch
- User dashboards
- Saved projects / project history
- Analytics tracking
- Team collaboration
- Authentication / user accounts (optional later)
- Keyword research tool
- Full ads manager
- Complex analytics platform

### Future roadmap (DO NOT BUILD YET)

Mentioned only so you don't accidentally architect against them:

- Connect to ad accounts
- Pull real search query data
- Auto-generate negative keywords from real spend
- Budget auto-optimization
- Campaign performance tracking

If you find yourself thinking "we should make this extensible for X" where X is in this list — stop. Build for today.

---

## 🛠 Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **React + TypeScript (Vite)** | Strict TypeScript. |
| Styling | **Tailwind CSS** (optional) | Use only if it speeds delivery. Plain CSS is acceptable. |
| UI design | **Minimal** | Clarity > polish. No component libraries unless justified. |
| Backend | **Supabase Edge Functions** | Single function for MVP. |
| AI | **Anthropic Claude API** | Use the latest available Sonnet model. |
| Hosting | **Vercel** (frontend) | Supabase hosts the edge function. |
| Auth | **None** for MVP | Do not add auth scaffolding "for later." |

### Versions and dependencies

- Add a dependency only when there is a clear, immediate reason.
- Prefer the standard library or a few lines of code over a package.
- No state management library (Redux, Zustand, etc.) — local `useState` is enough.
- No form library — a controlled form with `useState` is enough.
- No data-fetching library (React Query, SWR) for MVP — `fetch` + `useState` is enough.

---

## 🏗 Architecture

```
┌──────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│   Frontend   │ →  │ Supabase Edge Func   │ →  │  Claude API      │
│   (React)    │    │ /generate-campaign   │    │  (Anthropic)     │
└──────────────┘    └──────────────────────┘    └──────────────────┘
       ↑                                                  │
       └──────────── structured JSON ─────────────────────┘
```

1. User submits the form in the React app.
2. Frontend POSTs to the single edge function endpoint.
3. Edge function calls the Claude API with a structured prompt.
4. Claude returns structured JSON.
5. Edge function validates and forwards JSON to the frontend.
6. Frontend renders sections.

**There is exactly one backend endpoint: `POST /generate-campaign`.** Do not add others without explicit approval.

---

## 📁 Suggested Repo Layout

```
.
├── CLAUDE.md                  ← this file
├── README.md
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts         (if Tailwind is used)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ListingForm.tsx
│   │   ├── CampaignOutput.tsx
│   │   ├── sections/
│   │   │   ├── StrategySection.tsx
│   │   │   ├── KeywordsSection.tsx
│   │   │   ├── NegativeKeywordsSection.tsx
│   │   │   ├── AdCopySection.tsx
│   │   │   ├── LandingPageSection.tsx
│   │   │   └── WastedSpendSection.tsx
│   │   └── ui/                ← tiny shared primitives only
│   ├── lib/
│   │   ├── api.ts             ← single fetch wrapper for /generate-campaign
│   │   └── types.ts           ← shared TS types for the campaign JSON
│   └── styles.css
└── supabase/
    └── functions/
        └── generate-campaign/
            ├── index.ts       ← edge function entry
            ├── prompt.ts      ← system + user prompt builders
            └── schema.ts      ← JSON schema / Zod validation
```

Keep the tree shallow. Don't pre-create folders for things we don't need yet.

---

## 🎨 Frontend Conventions

- **Single page.** No router needed. The whole app is one screen with two states: form → results.
- **Loading state matters.** Show a clear "Generating your campaign..." state with realistic expectations (≤10s).
- **Error state matters.** If the API fails, show a plain English message and a retry button. No stack traces.
- **Render results in this exact order:**
  1. Strategy
  2. Keywords (buyer + seller)
  3. Negative Keywords (with "why these matter")
  4. Ad Copy (headlines + descriptions)
  5. Landing Page Copy
  6. Wasted Spend Protection / Optimization Tips
- **Copy-to-clipboard** on every section. This is table stakes.
- **"How to use this in Microsoft Ads"** instructions appear at the end. Plain numbered steps.

### Component rules

- Functional components only.
- Props are typed. No `any`.
- No premature abstraction. Inline a thing twice before extracting it.
- Each section component renders one slice of the response and is dumb (presentational).

---

## 🔌 Backend Conventions (Supabase Edge Function)

- **One endpoint:** `POST /generate-campaign`.
- **Request body** (validate with Zod):
  ```ts
  {
    listing: string;        // required, non-empty
    city: string;           // required, non-empty
    price: number;          // required, > 0
    leadType: "buyer" | "seller";  // default "seller"
  }
  ```
- **Response body**: the structured JSON contract below. Validate before returning.
- **Secrets**: `ANTHROPIC_API_KEY` is read from Supabase env vars. Never log it. Never expose it to the client.
- **CORS**: allow the Vercel frontend origin only.
- **Timeout**: cap Claude call at ~25s. Return a clean error if exceeded.
- **No caching** for MVP. Each request is a fresh generation.

---

## 🤖 Claude API Integration

### Model

The model is read from the `ANTHROPIC_MODEL` env var. **Never hardcode a model ID in source.** Anthropic releases new Sonnet versions periodically; routing through env means upgrades are a config change, not a code change.

- **Current default:** `claude-sonnet-4-6` (Claude Sonnet 4.6, the latest Sonnet on the Anthropic API as of this writing).
- **Where it's set:** Supabase edge function env vars (and `.env.example` for local dev).
- **How to upgrade:** when a newer Sonnet ships, update the env var in Supabase, redeploy the function. No code change, no PR.
- **Fallback behavior:** if `ANTHROPIC_MODEL` is unset, fail fast on cold start with a clear error. Do not silently default in code — that defeats the whole point.

Read the value once at function init, not per request.

### System prompt (canonical)

> You are a paid advertising expert specializing in Microsoft/Bing Ads for real estate agents.
>
> Your goal is to generate high-converting ad campaigns that minimize wasted spend.
>
> You prioritize:
> - High intent keywords
> - Clear and trustworthy ad messaging
> - Avoiding irrelevant traffic
>
> You explain your reasoning clearly in simple terms. The audience is a real estate agent who is not technical and wants leads, not data.

### Tone constraints for generated content

- Clear over clever.
- Trust-driven, slightly conservative (older demographic).
- No hype, no gimmicks, no emoji in ad copy.

### Structured output

Ask Claude to return **only** JSON matching the schema below. Use the API's JSON-mode-style instructions in the user prompt and validate server-side with Zod. If parsing fails, retry once with a stricter reminder; if it fails again, return a clean error to the frontend.

### Response schema (authoritative)

```ts
type CampaignResponse = {
  strategy: {
    campaignType: "buyer" | "seller";
    targetAudience: string;        // 1–2 sentences
    budgetRecommendation: string;  // human-readable, e.g. "$30–$50/day"
    deviceTargeting: string;       // e.g. "Desktop-heavy, ~70/30"
    geoTargeting: string;          // e.g. "City + 15 mi radius"
  };
  keywords: {
    buyer: Keyword[];
    seller: Keyword[];
  };
  negativeKeywords: {
    list: string[];
    rationale: string;             // "why these negatives matter"
  };
  adCopy: {
    headlines: string[];           // 5–10 items
    descriptions: string[];        // 3–5 items
  };
  landingPage: {
    headline: string;
    subheadline: string;
    cta: string;
    bullets: string[];             // 3–6 items
    trustElements: string[];       // 2–4 items
  };
  wastedSpendTips: {
    avoidSearches: string[];       // queries to exclude
    budgetWarnings: string[];
    commonMistakes: string[];
  };
};

type Keyword = {
  text: string;
  matchType: "phrase" | "exact";
  intentScore: number;             // 1–10
};
```

### Static negative keyword baseline

Always merge this baseline into `negativeKeywords.list` (deduped):

```
rent, apartment, jobs, cheap, craigslist, free
```

The model should add more based on listing type and intent mismatch.

---

## 🧪 Testing & Quality

- **Type checking** must pass: `tsc --noEmit`.
- **Lint** with the default Vite + TS ESLint config. Don't add custom rules unless asked.
- **No unit tests required for MVP** unless you're touching the JSON parsing/validation layer — that is the one place a small Zod-based test pays off.
- **Manual test checklist** before declaring done:
  1. Submit valid form → see all six sections render in order.
  2. Each section's copy button works.
  3. Submit with empty fields → friendly inline errors.
  4. Simulate API error → friendly retry UI.
  5. Whole flow on a fresh listing completes in < 10s on a normal connection.
  6. **After a model upgrade** (changing `ANTHROPIC_MODEL`): re-run steps 1–5, plus spot-check that the JSON still parses on the first try and that ad copy tone hasn't drifted (no hype, no emoji, trust-driven). If the model returns malformed JSON more than once in five runs, tighten the prompt before shipping.

---

## 🔒 Security & Secrets

- `ANTHROPIC_API_KEY` lives in Supabase env vars only.
- `ANTHROPIC_MODEL` lives in Supabase env vars (default: `claude-sonnet-4-6`). See the Model section above.
- The frontend never holds an API key.
- `.env.example` lists all required env vars with placeholder values. Never commit real `.env`.
- No PII is stored. The MVP is stateless.

---

## 📝 Coding Standards

- TypeScript strict mode on. No `any`, no `as` casts unless commented why.
- Prefer pure functions for prompt building, schema validation, and formatting helpers.
- File names: `PascalCase.tsx` for components, `camelCase.ts` for everything else.
- Imports ordered: React/std → third-party → local.
- Comments explain *why*, not *what*. The code shows what.
- No dead code, no commented-out blocks.

---

## 🧭 How Claude Code Should Work in This Repo

1. **Read this file first.** If a request conflicts with the philosophy or out-of-scope list, surface that before coding.
2. **Stay inside the architecture.** One endpoint, one page, one JSON schema.
3. **Default to fewer files, less code, fewer dependencies.** Justify every addition.
4. **When unsure between two designs, pick the one a non-technical agent would understand if they read it.**
5. **Confirm before scope creep.** If the user asks for something in the "Out of Scope" or "Future Roadmap" lists, ask whether they really want to expand scope before building it.
6. **Show your reasoning briefly.** When making non-obvious choices (prompt structure, validation strategy, error handling), leave a short comment.
7. **Don't reformat unrelated code.** Touch what the task requires.

---

## 🔁 Definition of Done

A change is done when:

- It serves one of the success criteria.
- Types check, lint passes, the manual checklist still passes.
- No new dependency was added without justification.
- Nothing from the "Out of Scope" list snuck in.
- The user-facing copy is plain English an agent would understand.

---

*Last principle, repeated because it matters most:*

**Simplicity wins. Speed wins. Clarity wins.**
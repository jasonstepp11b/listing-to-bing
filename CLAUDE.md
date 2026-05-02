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

- Real estate agents (beginner to intermediate marketers).
- Likely non-technical.
- Wants leads, not data.
- Little understanding of keyword strategy.
- MVP use case: agents trying to generate **buyer leads** for a specific listing. Seller-lead campaigns require a different input form (no listing exists yet) and are deferred to a future version.

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
2. Receive a campaign in **< 30 seconds** (typical real-world range: 15–25s). Set user expectations honestly — under-promise, over-deliver.
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
- Seller-lead campaigns (deferred — needs its own input form built around the agent's service area and value proposition, not a property's attributes)

### Future roadmap (DO NOT BUILD YET)

Mentioned only so you don't accidentally architect against them:

- Connect to ad accounts
- Pull real search query data
- Auto-generate negative keywords from real spend
- Budget auto-optimization
- Campaign performance tracking
- User accounts and authentication
- Property profiles — each property (e.g., "123 Maple Street") is a parent entity that can have multiple campaigns generated against it over time (initial launch, refresh after two weeks, price-drop campaign, post-open-house follow-up, etc.)
- Campaign history per property — agents can see, compare, and re-export prior campaigns for the same listing
- Multi-property dashboard — agents managing several active listings see all their properties at a glance
- Seller-lead campaign form — a separate input flow capturing the agent's target area, value proposition, and service radius (since seller campaigns target homeowners *before* a listing exists)

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

## 🎯 MVP Feature Set

### 1. Input Form (Simple UI)

User provides:
- Listing description (textarea, required)
- City / location (text input, required)
- Price (number input, required, > 0)

The MVP generates buyer-lead campaigns only. The form is purpose-built around an existing listing's attributes (description, city, price), which only makes sense when the agent has a property to advertise. Seller-lead campaigns require fundamentally different inputs (agent's target area, value proposition, service radius rather than a specific property) and are out of scope for the MVP.

### 2. Output Sections (rendered in this exact order)

1. **Strategy** — campaign type, target audience, budget, device, geo
2. **Keywords** — buyer keyword set
3. **Negative Keywords** — list + "why these matter" rationale
4. **Ad Copy** — 5–10 headlines, 3–5 descriptions
5. **Landing Page Copy** — headline, subheadline, CTA, bullets, trust elements
6. **Wasted Spend Protection** — avoid-searches, budget warnings, common mistakes

### 3. Export Options (MVP)

- Copy-to-clipboard on every section.
- "How to use this in Microsoft Ads" — plain numbered steps at the end.

---

## 🎨 Frontend Conventions

- **Single page.** No router needed. The whole app is one screen with two states: form → results.
- **Loading state matters.** Show a clear "Generating your campaign..." state with the message "This usually takes 15–30 seconds." Honest expectations beat optimistic ones — a user who's told 10s and waits 25s feels frustrated; a user who's told 30s and gets it in 18s feels delighted.
- **Error state matters.** If the API fails, show a plain English message and a retry button. No stack traces.
- **Render results in this exact order:**
  1. Strategy
  2. Keywords (buyer)
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
    // leadType is omitted — MVP is buyer-only. Re-introduce when a seller form ships.
  }
  ```
- **Response body**: the structured JSON contract below. Validate before returning.
- **Secrets**: `ANTHROPIC_API_KEY` is read from Supabase env vars. Never log it. Never expose it to the client.
- **CORS**: allow the Vercel frontend origin only. Fail closed if `ALLOWED_ORIGIN` is unset.
- **Timeout**: cap Claude call at 45s. Return a clean error if exceeded. (Real-world generations land in the 15–25s range; 45s gives headroom for occasional slow API responses without leaving users hanging indefinitely.)
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
- **No hardcoded years or dates** in keywords, ad copy, or landing page copy unless the user explicitly provides one. Generated content with stale years (e.g., "Cleveland housing market 2024" appearing in 2026) makes the tool feel outdated and erodes user trust. The user-supplied price is fine to include; trainer-era years are not.

### User prompt requirements

The user prompt builder must:

- Include the user's listing, city, and price.
- Instruct Claude to return ONLY JSON matching the schema (no markdown, no prose).
- Reinforce the "no hardcoded years or dates" constraint inline: *"Do not include specific years or dates in any generated content (keywords, headlines, descriptions, landing page copy) unless they are derived from the user's input. The user's price is acceptable to reference; do not invent years."*
- Call out the static negative keyword baseline so they're guaranteed to appear.

### Structured output

Ask Claude to return **only** JSON matching the schema below. Validate server-side with Zod. If parsing fails, retry once with a stricter reminder; if it fails again, return a clean error to the frontend.

### Response schema (authoritative)

```ts
type CampaignResponse = {
  strategy: {
    campaignType: "buyer";
    targetAudience: string;        // 1–2 sentences
    budgetRecommendation: string;  // human-readable, e.g. "$30–$50/day"
    deviceTargeting: string;       // e.g. "Desktop-heavy, ~70/30"
    geoTargeting: string;          // e.g. "City + 15 mi radius"
  };
  keywords: {
    buyer: Keyword[];
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

Always merge this baseline into `negativeKeywords.list` (deduped, case-insensitive):

```
rent, apartment, jobs, cheap, craigslist, free
```

The model should add more based on listing type and intent mismatch. The merge happens server-side after validation as a belt-and-suspenders guarantee.

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
  5. Whole flow on a fresh listing completes in < 30s on a normal connection (15–25s is typical).
  6. **After a model upgrade** (changing `ANTHROPIC_MODEL`): re-run steps 1–5, plus spot-check that the JSON still parses on the first try and that ad copy tone hasn't drifted (no hype, no emoji, trust-driven, no hardcoded years). If the model returns malformed JSON more than once in five runs, tighten the prompt before shipping.

---

## 🔒 Security & Secrets

- `ANTHROPIC_API_KEY` lives in Supabase env vars only.
- `ANTHROPIC_MODEL` lives in Supabase env vars (default: `claude-sonnet-4-6`). See the Model section above.
- `ALLOWED_ORIGIN` lives in Supabase env vars. Fail closed if unset.
- The frontend never holds an API key.
- `.env.example` lists all required env vars with placeholder values. Never commit real `.env` or `.env.local`.
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
# Agent Ad Starter

> Paste a property listing → get a ready-to-run Bing Ads campaign in under 30 seconds.

**Live:** [agentadstarter.com](https://agentadstarter.com)

A lean MVP that helps real estate agents turn a listing into a high-quality Bing Ads campaign without wasting money on irrelevant clicks. The product does not manage ads or integrate with ad platforms — it focuses entirely on **campaign generation and decision support**.

The differentiator: most ad tools generate ads. This one helps agents *avoid wasting money* on the wrong searches.

---

## How it works

1. Agent pastes a listing description, city, and price into a single form.
2. Frontend sends the inputs to a Supabase Edge Function.
3. The function calls the Anthropic Claude API with a structured prompt and validates the JSON response with Zod.
4. The frontend renders a six-section campaign:
   - **Strategy** — campaign type, audience, budget, device, and geo recommendations
   - **Keywords** — buyer-intent keywords with match types and intent scores
   - **Negative Keywords** — list plus a plain-English explanation of why each matters
   - **Ad Copy** — 5–10 headlines and 3–5 descriptions
   - **Landing Page Copy** — headline, subheadline, CTA, bullets, trust elements
   - **Wasted Spend Protection** — searches to avoid, budget warnings, common mistakes

Each section has copy-to-clipboard so the agent can paste directly into Microsoft Ads.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript (Vite), Tailwind CSS |
| Backend | Supabase Edge Function (Deno) |
| AI | Anthropic Claude API (Sonnet, model configured via env) |
| Hosting | Vercel (frontend) + Supabase (function) |
| Validation | Zod (request and response schemas) |
| Auth | None — the MVP is stateless |

The architecture is intentionally minimal: one frontend page, one backend endpoint (`POST /generate-campaign`), one JSON schema. See `CLAUDE.md` for the full design rationale.

---

## Project status

This is an MVP. It works end-to-end and is deployed. Buyer-lead campaigns only — seller campaigns require a different input form and are deferred to a later version.

What's intentionally NOT built (per `CLAUDE.md` scope):

- User accounts or authentication
- Saved projects or campaign history
- Microsoft Ads API integration or auto-launch
- Analytics or performance tracking
- Multi-property dashboards

Each of these is a deliberate "not yet" — see the Future Roadmap section in `CLAUDE.md` for what may come later.

---

## Local development

### Prerequisites

- Node.js 18+
- Supabase CLI (`brew install supabase/tap/supabase` on macOS)
- An Anthropic API key

### Setup

```bash
# Clone and install
git clone https://github.com/jasonstepp11b/listing-to-bing.git
cd listing-to-bing
npm install

# Create your local env file
cp .env.example .env.local
```

Edit `.env.local` and set:

```
VITE_API_URL=https://YOUR-PROJECT-REF.supabase.co/functions/v1/generate-campaign
```

### Running the frontend

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Building (always run before deploying)

```bash
npm run build
```

The production build is stricter than `dev` — TypeScript errors that the dev server tolerates will fail the build. Run this locally before every push.

### Edge function development

The edge function lives in `supabase/functions/generate-campaign/`. To deploy changes:

```bash
supabase functions deploy generate-campaign
```

The function reads three environment variables, set via Supabase secrets:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-6
supabase secrets set ALLOWED_ORIGIN=http://localhost:5173,https://agentadstarter.com
```

`ALLOWED_ORIGIN` is a comma-separated list. Add every origin that should be allowed to call the function — including localhost for development, the Vercel preview URL, and the production domain.

---

## Deployment

### Frontend (Vercel)

The frontend auto-deploys on every push to `main`. The Vercel project is configured with one environment variable: `VITE_API_URL`, pointing at the deployed Supabase function.

### Backend (Supabase)

The edge function deploys via the Supabase CLI — there is no auto-deploy on git push for backend changes. Run `supabase functions deploy generate-campaign` manually after editing anything in `supabase/functions/`.

### Why these are split

The frontend and backend deploy independently on purpose. Vercel handles the static site; Supabase handles the function. They communicate over HTTPS with CORS and never share a build pipeline. This keeps each side simple and lets either be replaced without touching the other.

---

## Architecture decisions worth knowing

A few choices that look small but matter:

**The Anthropic model is read from `ANTHROPIC_MODEL` env, never hardcoded.** Anthropic releases new Sonnet versions periodically; routing through env means upgrading is a config change, not a code change. The function fails fast on cold start if the env var is unset — silent defaults defeat the point.

**JWT verification is disabled for the `generate-campaign` function** via `supabase/config.toml` (`verify_jwt = false`). This file MUST be tracked in git — losing it re-enables auth and breaks all unauthenticated calls. The MVP doesn't have user accounts, so JWT verification would block every legitimate request.

**CORS handling supports multiple origins.** The function splits `ALLOWED_ORIGIN` on commas, validates the request's `Origin` header is in the allowlist, and echoes back the matched origin in the response (not the raw env value — browsers reject lists). Unknown origins get a 403.

**The static negative keyword baseline is merged server-side** after Claude responds, not in the prompt. Belt-and-suspenders: even if the model omits the baseline, the function guarantees it's present.

**Zod validates both directions** — request body and Claude's response. On response validation failure, the function retries Claude once with a stricter JSON reminder; on second failure, returns 502 to the client. The retry uses a stricter reminder, not a different prompt, because empirically that works better than rewriting the whole prompt.

---

## Known gotchas

These tripped me up while building, in case they trip you up too:

- **Run `npm run build` locally before pushing.** Vercel runs the production build, which is stricter than `npm run dev`. Catching errors locally saves the deploy round-trip.
- **Supabase secrets changes don't take effect until you redeploy the function.** Setting the secret is half the work; `supabase functions deploy generate-campaign` is the other half.
- **Frontend env var changes (`VITE_API_URL`) require a Vercel redeploy** to take effect. Updating in the dashboard isn't enough — trigger a new deploy.
- **`supabase/.temp/` is machine-local cache** and should be gitignored. Don't commit it.
- **The `config.toml` file controls function-level settings** like JWT verification. If it disappears, the next deploy may re-enable auth without warning.

---

## Project structure

```
.
├── CLAUDE.md                  # Source of truth for product scope and conventions
├── README.md                  # This file
├── .env.example               # Template for VITE_API_URL
├── src/
│   ├── App.tsx                # Single-page app
│   ├── components/
│   │   ├── ListingForm.tsx    # The input form
│   │   ├── CampaignOutput.tsx # The six-section results UI
│   │   ├── sections/          # One component per output section
│   │   └── ui/                # Tiny shared primitives (CopyButton)
│   └── lib/
│       ├── api.ts             # Single fetch wrapper
│       └── types.ts           # Shared types (CampaignResponse, Keyword)
└── supabase/
    ├── config.toml            # Function-level config (verify_jwt = false)
    └── functions/
        └── generate-campaign/
            ├── index.ts       # Function entry point
            ├── prompt.ts      # System and user prompt builders
            └── schema.ts      # Zod schemas for request and response
```

---

## License

MIT — see [LICENSE](LICENSE) file.

---

## Acknowledgments

Built with [Claude](https://claude.ai), [Claude Code](https://claude.ai/code), [Vite](https://vitejs.dev), [Supabase](https://supabase.com), [Vercel](https://vercel.com), and a lot of trial-and-error CORS debugging.

# Manny Tracker

Dog behavior tracking app for Manny. Built with Next.js, React, TypeScript, Tailwind CSS. Data stored in Google Sheets. AI insights via Claude API.

## Deployment

- Hosted on **Vercel**, auto-deploys from `main` branch
- Push directly to `main` — do NOT create PRs or feature branches
- Environment variables configured in Vercel dashboard

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Architecture

- `src/config/sections.config.ts` — Central config defining all form sections and fields
- `src/components/LogForm.tsx` — Main daily log form
- `src/components/FormSection.tsx` — Individual section rendering
- `src/hooks/useFormState.ts` — Form state management (reducer pattern)
- `src/lib/sheets.ts` — Google Sheets API integration
- `src/lib/utils.ts` — Data flattening/parsing for Sheets (header-name-based with backward compat aliases)
- `src/lib/claude.ts` — Claude AI behavioral analysis
- `src/app/api/` — API routes (logs, summary, ai, auth)

## Key Details

- PIN-based auth (APP_PIN env var)
- Daily log with "Normal Day" one-tap defaults
- Tracks: Demand Barking (intensity 1-3), Reactivity (triggers + Green/Yellow/Red), Enrichment, Medication, Notes
- Summary page with charts and AI insights
- Google Sheets as database (positional writes, header-name-based reads for backward compat)

# Manny Tracker

Daily behavior tracking app for Manny the dog. Designed for quick once-a-day logging with a "Normal Day" one-tap option.

## instructions for claude
I NEVER UNDER ANY CIRCUMSTANCES want to have branches or PRs. I want to commit everything straight to main

## Features

- **Daily Log** — Track demand barking, reactivity, enrichment, medication, and notes
- **Normal Day** — One tap fills routine defaults, just add notes and submit
- **Summary** — Charts showing behavior trends over time
- **AI Insights** — Claude-powered behavioral pattern analysis
- **Google Sheets** — All data stored in Google Sheets for easy sharing with trainers

## Tech Stack

- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- Google Sheets API (database)
- Anthropic Claude API (AI analysis)
- Vercel (hosting, auto-deploys from main)

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `APP_PIN` — PIN for app access
   - `GOOGLE_SERVICE_ACCOUNT_KEY` — Google service account JSON
   - `GOOGLE_SPREADSHEET_ID` — Target spreadsheet ID
   - `ANTHROPIC_API_KEY` — Claude API key
4. `npm run dev`

## Deployment

Deployed on Vercel. Pushing to `main` triggers auto-deploy.

# 💚 I'm Still Here — PWA

**Tap once. People know you're okay.**

A dead-simple daily check-in PWA for people who live alone. Matches the native Expo app pixel-for-pixel. If you miss your check-in window, your emergency contacts get a gentle email.

## Design System

Matches `imstillhere-expo` exactly:

- **Dark theme default** — `#0a0a0a` background, `#141414` cards
- **Green accent** — `#4ade80` primary, `#22c55e` dark, `#16a34a` darker
- **200px circular check-in button** with pulse glow animation
- **Streak counter** with milestone progress bar and earned badges
- **Confetti celebration** on check-in with streak badge popup
- **Daily quotes** rotated by date
- **Avatar initials** in header linking to settings
- **Components:** Greeting, CheckInButton, Stats, DailyQuote, Confetti, PWAInstallPrompt

## How It Works

1. **Sign up** with email + password
2. **Set your time** — choose when you want your daily check-in (default: 9 AM)
3. **Add contacts** — people who should know if something's off
4. **Tap daily** — one button, one tap, done
5. **Miss it?** — after the grace period (default: 2 hours), contacts get an email

## Tech Stack

- **Next.js 14** (App Router) — server + client components
- **Tailwind CSS** — dark theme matching Expo design tokens
- **Supabase** — Auth, Postgres, Row Level Security
- **PWA** — manifest, service worker, installable, push-ready
- **Resend** — transactional email alerts
- **Vercel** — deploy with cron support

## Quick Start

### 1. Install

```bash
cd imstillhere-pwa
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration:
   ```
   cat supabase/migrations/001_initial_schema.sql
   ```
   Paste into Supabase SQL Editor → Run

3. Authentication → URL Configuration:
   - Site URL: your deploy URL
   - Add `http://localhost:3000/auth/callback` to Redirect URLs

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase URL, anon key, service role key, Resend API key, and cron secret.

### 4. Run

```bash
npm run dev
```

### 5. Deploy

```bash
npx vercel
```

The `vercel.json` includes a cron every 15 minutes for missed check-in detection.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (dark, green accent)
│   ├── auth/page.tsx         # Sign up / Sign in
│   ├── dashboard/page.tsx    # Main check-in screen
│   ├── settings/page.tsx     # Profile + contacts
│   ├── share/page.tsx        # Shareable badge
│   └── api/
│       ├── checkin/           # Check-in endpoint
│       └── cron/check-missed/ # Cron: alert contacts
├── components/
│   ├── DashboardClient.tsx   # CheckIn button + Stats + Quote
│   ├── Confetti.tsx          # Celebration particles + badge
│   ├── SettingsClient.tsx    # Settings form
│   └── PWAInstallPrompt.tsx  # "Add to Home Screen"
├── lib/
│   ├── quotes.ts             # Daily quote rotation
│   ├── types.ts              # TypeScript interfaces
│   └── supabase/             # Client, server, middleware
└── middleware.ts              # Session refresh
```

## License

MIT

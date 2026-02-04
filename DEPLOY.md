# 🚀 I'm Still Here — Deployment Guide

Everything you need to go from zero to live.

---

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Name it `imstillhere` (or whatever you want)
4. Set a strong database password (save it somewhere)
5. Choose region closest to your users
6. Wait for project to spin up (~2 min)

### Run the Migration
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase/migration.sql`
3. Click **Run** — this creates all tables, RLS policies, triggers, and functions

### Enable Email Auth
1. Go to **Authentication → Providers**
2. Email should be enabled by default
3. Under **Email Templates**, customize the confirmation email if you want (optional)
4. Under **URL Configuration**, set:
   - **Site URL**: `https://imstillhere.app` (or your domain)
   - **Redirect URLs**: `https://imstillhere.app/auth/callback`

### Get Your Keys
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep secret!)

---

## 2. Resend (Email Alerts) Setup

1. Sign up at [resend.com](https://resend.com)
2. **Add & verify your domain** (e.g., `imstillhere.app`) under Domains
   - Add the DNS records Resend gives you (SPF, DKIM, etc.)
   - Or use `onboarding@resend.dev` for initial testing
3. Create an **API Key** → `RESEND_API_KEY`
4. The "from" address in the code is `alerts@imstillhere.app` — update in `src/app/api/cron/check-missed/route.ts` if using a different domain

---

## 3. Environment Variables

Create `.env.local` (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
RESEND_API_KEY=re_xxxxxxxxx
NEXT_PUBLIC_APP_URL=https://imstillhere.app
CRON_SECRET=<run: openssl rand -hex 32>
```

---

## 4. Vercel Deployment

### Option A: Deploy from GitHub (recommended)
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js — no config needed
5. Add all env vars from `.env.local` under **Settings → Environment Variables**
6. Click **Deploy**

### Option B: Deploy from CLI
```bash
npm i -g vercel
cd imstillhere-pwa
vercel --prod
# Follow prompts, then add env vars in dashboard
```

### Post-Deploy Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Node.js Version**: 18.x or 20.x

---

## 5. Domain Setup

### On your registrar (Namecheap, Cloudflare, etc.)
1. Add a CNAME record: `@ → cname.vercel-dns.com` (or the value Vercel gives you)
2. Or use Vercel Nameservers for full control

### On Vercel
1. Go to **Project → Settings → Domains**
2. Add `imstillhere.app`
3. Vercel auto-provisions SSL

### Don't forget
- Update `NEXT_PUBLIC_APP_URL` env var to your real domain
- Update Supabase **Site URL** and **Redirect URLs** to match
- Update the `from` address in the cron route if your email domain differs

---

## 6. Cron Job Setup (Missed Check-in Detection)

The `/api/cron/check-missed` endpoint needs to run every 15 minutes.

### Option A: Vercel Cron (easiest)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-missed?secret=YOUR_CRON_SECRET",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

> ⚠️ Vercel Cron requires a **Pro plan** ($20/mo). Free tier only gets 1 daily cron.

### Option B: External Cron (free alternatives)
Use any of these to hit the endpoint every 15 min:

- **[cron-job.org](https://cron-job.org)** — Free, reliable
- **[UptimeRobot](https://uptimerobot.com)** — Free monitoring + HTTP pings
- **GitHub Actions** — Free, uses a scheduled workflow

**URL to call:**
```
GET https://imstillhere.app/api/cron/check-missed?secret=YOUR_CRON_SECRET
```

Or with Authorization header:
```
GET https://imstillhere.app/api/cron/check-missed
Authorization: Bearer YOUR_CRON_SECRET
```

### Option C: Supabase Edge Function + pg_cron
For a fully Supabase-native approach:
1. Enable `pg_cron` extension in Supabase dashboard
2. Create a scheduled function that calls your endpoint
3. This keeps everything in one platform

---

## 7. PWA Icons

The app needs two icon files in `public/icons/`:
- `icon-192.png` (192×192px)
- `icon-512.png` (512×512px)

If these are placeholder files, replace them with your actual app icon (skull emoji on dark background recommended).

---

## 8. OG Image

Place an OG social share image at `public/og-image.png` (1200×630px).

See `OG-IMAGE.md` for the design spec.

Then update `src/app/layout.tsx` metadata:
```ts
openGraph: {
  // ...existing
  images: [{ url: '/og-image.png', width: 1200, height: 630 }],
},
```

---

## 9. Post-Deploy Smoke Test Checklist

Run through these after deploying:

- [ ] **Landing page** loads at root URL — looks correct, no broken styles
- [ ] **Sign up** with a test email — confirmation email arrives
- [ ] **Confirm email** via link — redirects to dashboard
- [ ] **Sign in** with credentials — lands on dashboard
- [ ] **Check-in button** works — confetti fires, streak increments
- [ ] **Settings page** — can update name, check-in time, timezone, grace period
- [ ] **Add emergency contact** — appears in list with name, email, phone
- [ ] **Remove emergency contact** — disappears from list
- [ ] **Share page** — badge renders, X and WhatsApp links work
- [ ] **Sign out** — returns to landing page
- [ ] **Cron endpoint** — hit `/api/cron/check-missed?secret=YOUR_SECRET` manually, get `200` response
- [ ] **PWA install** — on mobile Chrome, "Add to Home Screen" prompt appears
- [ ] **Manifest** — `/manifest.json` loads correctly
- [ ] **Service Worker** — `/sw.js` registers (check DevTools → Application)
- [ ] **Auth redirect** — accessing `/dashboard` while signed out redirects to `/auth`
- [ ] **Mobile responsive** — test on phone or Chrome DevTools mobile view

### Full Flow Test (after cron is running)
- [ ] Create account, set check-in time to 5 min from now, grace period 30 min
- [ ] Don't check in
- [ ] Wait for cron to fire after grace period
- [ ] Emergency contact receives alert email
- [ ] Check the `missed_alerts` table in Supabase — record exists

---

## Quick Reference

| What | Where |
|------|-------|
| Supabase Dashboard | `https://supabase.com/dashboard` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| Resend Dashboard | `https://resend.com` |
| Migration SQL | `supabase/migration.sql` |
| Env template | `.env.example` |
| Cron endpoint | `/api/cron/check-missed` |
| Auth callback | `/auth/callback` |

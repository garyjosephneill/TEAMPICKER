# Lazy Gaffer — Handover Notes

Full-stack app: **React (Vite)** frontend, **Express/Node** backend, **SQLite** database, hosted on **Railway**, deployed via **GitHub**. iOS app submitted to the App Store (Build 5, March 2026).

---

## 🚀 Deployment

Railway auto-deploys on every push to `main`. No manual steps needed.
- **Web app:** https://lazygaffer.com
- **Railway URL:** https://teampicker-production.up.railway.app

"Deploy Crashed!" emails from Railway are **not real crashes** — they fire when the old container is replaced by a new one. Safe to ignore if the new deploy shows Active.

---

## 🛠 Local Development

```bash
cd /Users/gaz/Documents/GitHub/TEAMPICKER
npx vite          # starts at localhost:3000
```
Use this to test web changes instantly without pushing to Railway.

---

## 📦 Project Structure

- `src/App.tsx` — Main app (squad, gaffer, settings views)
- `src/BgScene.tsx` — Background/kit scene
- `src/PaywallScreen.tsx` — Paywall (iOS StoreKit + Stripe web)
- `src/LandingPage.tsx` — Web-only login/entry screen
- `src/LoginScreen.tsx` — iOS-only OTP login (cloud save)
- `server.ts` — Express backend (Stripe, Supabase, SQLite)
- `GLOSSARY.md` — Plain-English explanation of every platform/tool

---

## 🍎 iOS Notes

- **Build 5** submitted to Apple on 2026-03-18 — awaiting review
- iOS uses **StoreKit** for payments (not Stripe)
- iOS login uses **OTP code** (not magic link)
- Do **not** ship new iOS builds while Build 5 is in review unless critical
- After any code change: `npm run build` → `npx cap sync ios` → Xcode Clean (Cmd+Shift+K) → Run (Cmd+R)

---

## ✨ Recent Features (March 2026)

### Share Teams (desktop/web only)
Clicking SHARE TEAMS shows a full-screen wash overlay with three buttons: **EMAIL**, **WHATSAPP**, **CLIPBOARD**. iOS unaffected. All shared text is uppercase.

### Team Name Editing
- **Inline:** After generating teams, tap a team name on the Gaffer page to rename it on the fly. A blinking cursor indicates it's editable.
- **Persistent:** Settings → TEAM NAMES lets users pre-set two fixed names (saved to `localStorage`). When set, the blinking cursor is hidden. CLEAR button reverts to random names.

### Transfers
KEEP/SELL buttons capped to match the width of Settings page buttons on desktop.

---

## 🔑 Key Environment Variables (Railway)

- `DATABASE_URL` — path to SQLite file on persistent volume
- `APP_URL` — `https://lazygaffer.com` (used for Stripe redirects)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe credentials
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase credentials

# Lazy Gaffer — Platform & Tools Glossary

## Hosting & Deployment
**Railway** — A cloud hosting platform. Your Node.js server and web app live here. Every time you push code to GitHub, Railway automatically rebuilds and redeploys the site at `lazygaffer.com`.

**GitHub** — Stores your code in a remote repository. Acts as the bridge between your local machine and Railway — pushing code here triggers a Railway deploy.

**Railway crash emails** — Not real crashes. Railway kills the old container when a new deploy starts, which triggers a "crash" notification email. The server comes straight back up on the new container automatically. Safe to ignore.

**Railway persistent volume** — A storage volume (`teampicker-volume`) mounted at `/app/data` that survives deployments. The SQLite database (`squad.db`) lives here so player and licence data is never wiped on redeploy.

**APP_URL** — A Railway environment variable set to `https://lazygaffer.com`. Used by the server to construct Stripe redirect URLs. Without this, Stripe would redirect back to `teampicker-production.up.railway.app` (a different origin), breaking session persistence.

## Frontend & Build
**Vite** — A build tool that compiles your React/TypeScript code into plain HTML/CSS/JS that browsers can read. Also runs the local dev server at `localhost:5173` for testing.

**React** — The JavaScript framework your app UI is built in. Everything you see on screen (player cards, ratings, team picker) is a React component.

**TypeScript** — A version of JavaScript that adds type checking. Catches bugs before they reach the browser.

**Tailwind CSS** — A CSS utility library. Instead of writing custom CSS, you apply short class names like `border-4` or `text-xl` directly in your HTML.

**Capacitor** — Wraps your web app (React) in a native iOS shell so it can be submitted to the App Store as a real iPhone app.

## Backend & Database
**Node.js / Express** — Your server (the `server.ts` file). Handles things the browser can't do securely — like processing Stripe payments and talking to the database.

**Supabase** — A cloud database and authentication service. Handles magic link email login. Also stores player squads in the cloud when users opt in to cloud save.

**SQLite (better-sqlite3)** — A lightweight local database used on the Railway server. Stores user licensing status (`is_licensed`) and player data. Lives on the persistent volume so it survives deploys.

**Supabase user ID (UUID)** — A unique ID Supabase assigns each user. Used as the key for all Railway SQLite data. **Important:** if you delete a user in Supabase and they re-register, they get a NEW UUID — their old player data in Railway becomes orphaned (unrecoverable). Avoid deleting users.

## Payments
**Stripe** — Handles web/desktop payments. When a user starts a free trial or pays, Stripe processes it and fires a webhook to your server to record the licence.

**Stripe webhook** — A notification Stripe sends to your server when something happens (e.g. checkout completed, subscription cancelled). Your server listens at `/api/webhook` and updates the `is_licensed` flag in SQLite accordingly.

**Stripe customer portal** — A Stripe-hosted page where users can manage their subscription (cancel, update card). Accessible via the SUBSCRIPTION button in app Settings.

**Stripe promo codes** — Discount codes entered on the Stripe checkout page. `CANTONA` = 100% off forever, 5 uses (for press/journalists). `payment_method_collection: 'if_required'` must be set on the checkout session so the "Start Trial" button stays active when a 100% promo is applied (no card needed).

**StoreKit** — Apple's payment system for iOS. Handles the App Store purchase and subscription directly on the iPhone — completely separate from Stripe.

## Apple / App Store
**Xcode** — Apple's IDE (development tool) for building and submitting iOS apps. You use it to compile the Capacitor-wrapped app and push builds to App Store Connect.

**App Store Connect** — Apple's web portal for managing your app listing, screenshots, pricing, and submitting builds for review.

**TestFlight** — Apple's beta testing platform (part of App Store Connect). Lets you install pre-release builds on your iPhone before going public.

## Auth & Identity
**Magic link** — The web login method. User enters their email, receives an email with a clickable link. Clicking it logs them straight in — no code to enter. Replaced the OTP code flow for web in March 2026. **Does not work on native iOS** — tapping a link in an email app opens Safari, not the Capacitor app, so the session never reaches the app.

**Supabase Auth (OTP)** — Used for iOS cloud-save login (the optional AUTO SAVE SQUAD flow). Users enter their email and receive an 8-digit code to enter in-app. Correct approach for native iOS because it keeps the user inside the app throughout. Not used for web login.

**LandingPage.tsx** — Web-only login/entry screen. Shows kit backgrounds, handles magic link flow, auto-redirects to Stripe after login. Used by `AuthGate` (web path only).

**LoginScreen.tsx** — iOS-only cloud-save login screen. Simple dark screen using the app's kit colours. Shows email input → 8-digit OTP code flow. Only appears when user taps AUTO SAVE SQUAD — never shown on app startup.

**Supabase email templates** — In Supabase → Authentication → Email Templates. Two key templates:
- **Magic Link**: used for existing users logging in — must use `{{ .ConfirmationURL }}` not `{{ .Token }}`
- **Confirm signup**: used for brand new users — also must use `{{ .ConfirmationURL }}`

**PKCE vs Implicit flow** — Two ways Supabase can handle magic link auth. PKCE (default) uses a code verifier stored in `sessionStorage` — this gets lost when a magic link opens in a new tab from an email client. Implicit flow uses a hash fragment in the URL, which works cross-tab. We use `flowType: 'implicit'` in `supabaseClient.ts`.

**Session persistence (cookies)** — Supabase stores sessions in `localStorage` by default, which Safari clears when the browser quits. We work around this by saving the access token and refresh token to 1-year cookies (`lg_at`, `lg_rt`). On page load, if localStorage is empty, we restore the session from cookies using `supabase.auth.setSession()`.

**www vs non-www domain issue** — Cookies and localStorage are per-origin. Cookies set on `lazygaffer.com` are invisible on `www.lazygaffer.com`. Fixed by: (1) setting cookies with `domain=.lazygaffer.com`, and (2) server redirecting `www.lazygaffer.com` → `lazygaffer.com` (301).

## Gaffer Page — Share Teams
**Share overlay** — When SHARE TEAMS is clicked on desktop/web, a full-screen wash overlay appears (uses the active kit's background colour) with three destination buttons: EMAIL, WHATSAPP, CLIPBOARD. Tapping outside the buttons dismisses it. iOS is unaffected — this feature is desktop-only, gated by `Capacitor.isNativePlatform()`.

**Share destinations** — EMAIL opens the user's mail client with teams pre-filled. WHATSAPP opens `wa.me` with teams as the message. CLIPBOARD copies the teams text silently and briefly flashes the SHARE TEAMS button to confirm. All shared text is forced to uppercase.

## Gaffer Page — Team Names
**Random team names** — After GENERATE TEAMS is pressed, two names are picked at random from an 18-name pool (UNITED, CITY, ROVERS etc.). A blinking `|` cursor appears after each name to indicate it's editable.

**Inline team name editing** — On the results screen, tapping a team name lets you rename it on the fly. Saves to state only (resets next time teams are generated). The blinking cursor disappears once persistent custom names are set via Settings.

**Persistent custom team names (Settings → TEAM NAMES)** — Users can pre-set two fixed team names (e.g. BIBS / SKINS) that are saved to `localStorage` and used every time teams are generated. Leave either field blank to revert to random. A CLEAR button resets both. When custom names are active, the blinking cursor on the results screen is hidden.

## Local Development
**localhost** — Your own computer acting as a private web server. Run `npx vite` in the TEAMPICKER directory to start it. Only you can see it — nothing is live or public. Use this to test changes before pushing to Railway.

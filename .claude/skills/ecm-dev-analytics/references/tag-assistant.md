# Tag Assistant "Could not connect" on ecm.dev

Work down this list; each step is cheap and rules out one cause.

## 1. Is the debug container loading at all?

In the ecm.dev tab that Tag Assistant opened, DevTools Network, filter `gtm.js`.

- Expected: `https://www.googletagmanager.com/gtm.js?id=GTM-M7DKTZKC&gtm_debug=...`
- If it loads from `/gtm/js` instead, the deploy predates the direct-load fix in
  `app/layout.tsx` (September 2026). The proxy relays the request from
  Netlify's servers and Google refuses debug requests from there.

## 2. Is the CSP blocking it?

Console: any "Content Security Policy" errors. The September 2026 fix added to
`middleware.ts`: `www.googletagmanager.com` and `tagmanager.google.com` in
script-src (fallback for browsers without `'strict-dynamic'`),
`tagmanager.google.com` in style-src, `data:` in font-src,
`tagassistant.google.com` in connect-src. `frame-ancestors` already allows
`tagassistant.google.com`.

## 3. Is the window link severed? (suspected, unconfirmed)

`next.config.mjs` sends `Cross-Origin-Opener-Policy: same-origin`, which cuts
the `window.opener` link Tag Assistant can use. Check in the console:
`window.opener` returning `null` means severed.

In September 2026 Tag Assistant connected after fixes 1 and 2 alone, with COOP
unchanged, so this was not the cause then. Only if 1 and 2 are clean and the
check shows `null`: relax COOP to `unsafe-none` in `middleware.ts` only when
the request has `gtm_debug` or a `__TAG_ASSISTANT` cookie, and remove the
static header from `next.config.mjs`. This is a security-header change: see
"Security-sensitive code" in SKILL.md.

## 4. Not causes

- Consent: analytics is granted by default, so the banner never blocks Preview.
- "No debuggable Google tags" wording from Tag Assistant is generic; it appears
  for every failure above.

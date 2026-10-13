# euro-visa-route
A static, mobile-first page that suggests a Europe visa route for UK residents whose passport needs a Schengen visa: 32 passports, all 29 Schengen states, and Albania, Montenegro, Serbia, North Macedonia, Türkiye, Georgia, Bosnia, Ireland and Cyprus. It does a deterministic lookup from `data/rules.json`.

**Live site:** https://sherlockpanesar.github.io/euro-visa-route/
**Deep link:** `?p=IN&s=ILR&d=FR,GR&from=2026-12-10&to=2026-12-20` (`p` is the passport code, `d` is the main destination plus one optional extra).

## Rules file
- `schengen` / `non_schengen` hold the destination defaults: fees, waits, refusal rates (Indian applicants only), `apply_url` / `entry_url` with status and checked date.
- `nationalities[CODE]` holds notes (airport transit visa, Russia/Belarus restrictions, Ethiopia) plus `overrides[DEST]`, which replace destination defaults (e.g. Türkiye→Cyprus, own-passport visa-free).
- `verified:false` shows "needs verification". Passports that don't need a Schengen visa (UAE, Ukraine, Serbia, Colombia, Brazil…) are excluded on purpose.

## Waitlist
The "Get my pack checked (£39)" form posts via **FormSubmit.co** (alias endpoint, so no address appears in the code). Each submission arrives as an email in the site owner's Gmail with the subject "euro-visa-route waitlist". It collects the email address plus a hidden route summary, and uses a honeypot (`_honey`) with `_captcha=false`. See `privacy.html`.

General information, not immigration or legal advice. Not affiliated with any government or visa centre. No outcome promises.

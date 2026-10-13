# euro-visa-route
A static, mobile-first page that suggests a Europe visa route for UK residents with Thai or Indian passports. It does a deterministic lookup from `data/rules.json`; every rule has a source link and a checked date. You can edit the rules by hand.

**Live site:** https://sherlockpanesar.github.io/euro-visa-route/
**Deep link:** `?p=IN&s=ILR&d=FR,GR&from=2026-12-10&to=2026-12-20` (`d` lists destinations; the first one is treated as the main destination).

> ⚠️ **Emails are NOT collected yet.** The "Get my pack checked (£39)" button only saves the email to the visitor's own browser (localStorage). TODO: connect a form service such as Formspree and update the privacy notice before promoting the site.

This is general information, not immigration or legal advice. It is not affiliated with any government or visa centre, and it cannot promise any outcome.

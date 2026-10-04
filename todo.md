# مُعلّم — Production Audit Tracker

## Completed and verified
- [x] Audited source routes, tRPC authorization, roles, bookings, schema, OAuth, exports, metadata and configured integration status.
- [x] Fixed lazy-route initialization crash; verified homepage, teacher directory and parent signup render in preview.
- [x] Added DB-backed JSON health endpoint, route manifest, robots/sitemap, favicon and private-route noindex header.
- [x] Added same-origin OAuth redirect validation, 30-day new sessions and SameSite=Lax cookies.
- [x] Added atomic last-super-admin protection; fixed reviewed dashboard dead links; added parent onboarding entry.
- [x] Improved booking validation/timezone and response privacy; hardened printable PDF and spreadsheet CSV exports.
- [x] Added tests for auth redirects/session TTL/PDF escaping, booking overlap boundaries and CSV formula safety.
- [x] Moved pnpm override settings into supported workspace config; frozen-lockfile install passes.
- [x] Added `docs/PRODUCTION-AUDIT.md` and `docs/INTEGRATION-STATUS.md`.
- [x] `pnpm check` passed; `pnpm test` passed (50 tests/13 files); `pnpm build` passed; `git diff --check` passed.
- [x] Local production and WebDev preview route smoke tests passed with DB health `ok`; preview screenshots and browser console checked.

## Open release and commercial blockers
- [ ] Published custom domain is stale: health, manifest, robots and sitemap paths return SPA HTML. No public release was performed.
- [ ] Payments/idempotency, wallet ledger, refunds and payouts are **NOT IMPLEMENTED**; require provider/business choice and sandbox credentials.
- [ ] Zoom/Meet, WhatsApp, SMS/email production providers are **NOT CONFIGURED / NOT IMPLEMENTED**.
- [ ] Full lesson lifecycle, no-show/refund policy, quizzes/homework/grades/progress/notifications/support are not implemented.
- [ ] Granular admin roles and country/curriculum catalogs require business decisions.
- [ ] Booking overlap is unit-tested, but a true concurrent database race test was not run against an isolated test DB.
- [ ] Production OAuth and role-specific journeys require post-release verification.

## Before commercial launch
1. Explicitly authorize release to the public custom domain and publish via the supported WebDev UI.
2. Retest published `/`, `/api/health`, `/manus-routes.json`, `/robots.txt`, `/sitemap.xml` and the main user flows.
3. Complete the chosen finance provider, ledger/refund/payout implementation, and sandbox tests before enabling payments.

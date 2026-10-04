# مُعلّم — Production Readiness Audit

**Date:** 2026-10-04 · **Repository:** `engrababibrahim-sudo/nukhba-edtech-phase4`, `main` · **Production URL checked:** https://moallemkt-bqminrab.manus.space

## Production Audit Result

**The audited source passes typecheck, tests, build and local/preview smoke checks. The published custom domain fails deployment verification and must not be treated as running this audited release.** This remains an early marketplace prototype, **not a commercial EdTech service ready to collect money**. No payment, wallet/ledger, payout, refund, live-class, messaging, support-ticket or full learning-management system is implemented.

The preview briefly showed a blank screen after a route-splitting change. Browser-console evidence identified `Cannot access 'lazy' before initialization` in `App.tsx`; the `NotFound` lazy component was moved below its import. The preview was re-captured afterward and rendered the Arabic homepage, teacher directory and parent signup page without a new console error.

### Critical

| Issue | Root cause and impact | Status and fix | Evidence |
|---|---|---|---|
| Payments, refunds, wallet ledger and payouts do not exist | Finance schema, signed/idempotent provider webhooks, reconciliation, immutable teacher ledger and payout lifecycle are absent. Charging users would be unsafe and unsupported. | **OPEN — commercial-launch blocker.** Not invented. Requires provider/business decisions, credentials, and a finance implementation. Paymob/Fawry are **NOT LIVE**. | Schema/router/dependency/config review; no payment or money movement attempted. |

### High

| Issue | Root cause and impact | Status and fix | Evidence |
|---|---|---|---|
| Published site returns HTML for operational endpoints | Custom-domain `/api/health`, `/manus-routes.json`, `/robots.txt`, `/sitemap.xml` each returned `200 text/html`: SPA fallback masked broken endpoints. Monitoring and crawlers cannot use these paths. | **SOURCE FIXED; PRODUCTION DEPLOYMENT STILL FAILS.** Added JSON health (real `SELECT 1`, 503 on DB failure), valid route manifest, robots, sitemap; private routes send `X-Robots-Tag: noindex, nofollow`. The public build was not published. | Local production server and WebDev preview return expected JSON/XML/text. Fresh public-host requests still returned HTML. |
| Last super-admin could be lost under concurrent updates | A separate count-before-write allows a race while demoting/suspending a privileged account. | **FIXED IN SOURCE.** Database transaction locks the target and counts/locks super-admin records before demotion or deactivation. Resolver returns controlled `PRECONDITION_FAILED`; configured owner is promoted at sign-in. | Admin-role tests pass. Actual concurrent DB race test not executed; the invariant is code-reviewed, not concurrency-tested. |
| Long-lived/cross-site session cookie | Previous new sessions lasted 365 days with `SameSite=None`. | **FIXED FOR NEW SESSIONS IN SOURCE.** 30-day token/cookie max age, `SameSite=Lax`, `Secure`/`HttpOnly` session cookie, short-lived OAuth state. Old tokens remain valid until their existing expiration unless revoked; deployment is stale. | Cookie logout assertion, safe-return tests and session-duration test pass. |
| Export flows: broken PDF popup and spreadsheet formula risk | `noopener` can return `null` to a popup that the PDF flow must write to; untrusted CSV cells could begin with spreadsheet formulas. | **FIXED IN SOURCE.** Open popup from user gesture, immediately clear `opener`; HTML-escape report values; neutralize formula-leading CSV text. | New HTML escaping/CSV export tests pass. Authenticated manual print/browser export not run. |
| Dashboard dead ends and inert notification control | Some visible controls had no destination/system behind them. | **FIXED ON REVIEWED SURFACES.** Replaced role-dashboard navigation with real links, removed inert bell, removed placeholder admin links from visible nav, and labeled unavailable reports/payment/live classes honestly. | Typecheck, tests/build; authenticated role-by-role browser walkthrough not run. |
| Lazy-route initialization caused a blank preview | The `NotFound` lazy component was initialized before the `React.lazy` import in source order. | **FIXED IN SOURCE/PREVIEW.** Moved the lazy declaration below imports. | Captured rendered homepage/search/parent signup after fix; no new browser-console error. |

### Medium

| Issue | Status | Evidence / business choice |
|---|---|---|
| Country education catalogs are static UI options | **OPEN.** Egypt stages/subjects/grades are embedded in components, not admin-editable DB configuration. | Reviewed UI/schema/router. Which countries/curricula to support is a product decision. |
| Admin scopes are too broad for safe delegated operations | **PARTIALLY FIXED.** Super-admin-only role management and last-super-admin guard improved. Finance Admin/Support Agent/Content Manager permission matrix remains absent. | Procedure/RBAC tests cover current boundaries. Define granular roles before inviting staff beyond trusted admins. |
| Student/parent/teacher learning lifecycle is incomplete | **OPEN — scope blocker for full EdTech claims.** Profiles, discovery, favorites, teacher availability/booking request and linked-child profile exist; homework, quizzes/exams, grades, progress, recordings, messaging, notifications, support, paid classrooms and reviews are missing. | Source review and tests for implemented profile/parent procedures. No absent module is claimed to pass. |
| SEO/social route metadata is partly client-rendered | **PARTIALLY FIXED.** Added title/description/canonical/OpenGraph defaults, private noindex, favicon, robots and sitemap. No SSR/unique social-card HTML per teacher. | Local/preview route files and private response header checked. No external crawler test. |
| Booking concurrency lacks a real DB race test | **PARTIALLY VERIFIED.** Transactions lock the eligible teacher and active availability rows; interval checks reject overlap and permit adjacent lessons. No range-exclusion constraint or isolated simultaneous-request DB harness. | Unit tests cover overlap/adjacent windows. No booking row or concurrent request was written against configured production data. |
| Demo sample on public home | **MITIGATED.** A card is marked “Demo / بطاقة توضيحية”; directory results use approved DB profiles only. Replace it with approved real teacher data or remove before marketing. | UI source/screenshot and marketplace projection tests. |

### Low

| Issue | Status | Evidence |
|---|---|---|
| Platform-injected base runtime adds HTML weight | **OPEN.** Vite injects a Manus runtime (~369 kB raw / ~105 kB gzip); platform behavior/opt-out was not established. Page routes are code-split; main JS is ~497 kB raw / ~146 kB gzip and no longer exceeds the chunk warning. | Production asset sizes measured. |
| Legacy pnpm metadata generated a configuration warning | **FIXED.** Moved patch/override declarations into `pnpm-workspace.yaml` and regenerated lockfile metadata. | `pnpm install --frozen-lockfile --ignore-scripts` passed without that warning. Existing dependency deprecations/peer warning were not upgraded as part of this functional audit. |

## Tests

| Check | Result |
|---|---|
| `pnpm check` | **PASS** |
| `pnpm test` | **PASS — 50 tests, 13 files** |
| `pnpm build` | **PASS** — route chunks split; no >500 kB warning |
| `pnpm install --frozen-lockfile --ignore-scripts` | **PASS** |
| `git diff --check` | **PASS** |
| Local production server `/` | **PASS — 200 HTML** |
| Local/preview `/api/health` | **PASS — 200 JSON, database `ok`** |
| Local/preview `/manus-routes.json` | **PASS — valid JSON, 20 app routes** |
| Local/preview robots, sitemap, favicon | **PASS — correct content types** |
| Private route indexing header | **PASS locally — `X-Robots-Tag: noindex, nofollow`** |

## Requested capability status

| Capability | Result |
|---|---|
| Security tests (implemented surfaces) | **PASS — 50 total tests; not a penetration test** |
| Parent isolation | **PASS for covered API cases**; linked child only; tests deny unlinked child access |
| Admin RBAC | **PASS for covered procedures; granular staff scopes incomplete** |
| Booking concurrency | **NOT FULLY TESTED**; pure interval tests and locking code, no concurrent database race harness |
| Payment integration | **NOT CONFIGURED / NOT IMPLEMENTED** |
| Payment idempotency | **NOT IMPLEMENTED / NOT TESTED** |
| Wallet ledger | **NOT IMPLEMENTED** |
| Payout lifecycle | **NOT IMPLEMENTED** |
| Refund | **NOT IMPLEMENTED** |
| Video (Zoom / Google Meet) | **NOT CONFIGURED / NOT IMPLEMENTED** |
| WhatsApp | **NOT CONFIGURED / NOT IMPLEMENTED** |
| SMS / production email provider | **NOT CONFIGURED** |
| Manus OAuth | **Configured in preview; production callback and four-role journeys not verified** |
| Production deployment | **FAIL — stale custom-domain copy** |
| Production URL | https://moallemkt-bqminrab.manus.space (reachable, but operational paths are incorrect) |

## Integration status and secrets

No provider credentials for Paymob, Fawry, WhatsApp, Zoom/Meet or SMS were found in the inspected environment; no credentials were printed, copied or committed. The provider-by-provider status and setup cautions are in [Integration Status](INTEGRATION-STATUS.md). Do not claim any provider is **TEST** or **LIVE** until its sandbox/production flow has actually passed.

## Remaining commercial-launch blockers only

1. Release the audited build to the actual custom-domain deployment, then retest `/`, `/api/health`, `/manus-routes.json`, `/robots.txt` and `/sitemap.xml`. I did **not** publish to the broad public domain: no release tool was available, and a public release needs explicit approval.
2. Decide/implement payments, verified webhooks, idempotency, reconciliation, immutable wallet ledger, commissions, refunds and payouts with a licensed provider; test only against a provider sandbox first.
3. Define full booking outcomes (cancellation, reschedule, no-show, refund), then verify simultaneous bookings with an isolated database concurrency test.
4. Define country/curriculum catalog and delegated-admin permissions; either build the missing EdTech functions or narrow commercial claims to the current tutor-marketplace slice.
5. Test production OAuth, real role-specific journeys, monitoring and backup/recovery on the released domain.

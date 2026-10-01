# المُعلّم Website — Build Tracker

## Completed
- [x] Arabic-first RTL storefront branded **مُعلّم**, Egypt-first copy, responsive public navigation, and hosted original tutor artwork.
- [x] Landing-page search for subject, stage, country, lesson format, budget, and availability; filters carry through to teacher discovery.
- [x] Teacher directory with country-aware filtering/currencies, profile routes, supported sort choices, and accurate verified/review/demo labels.
- [x] Existing booking, teacher registration, auth, student, parent, teacher, and admin routes retained. Demonstration tutors cannot produce real bookings.
- [x] Learning-preferences onboarding retained with server persistence and visibly labeled demo recommendations.
- [x] Public teacher API exposes country/profile fields while excluding contact and moderation data.
- [x] TiDB-compatible JSON persistence and reviewed Drizzle migration; hosted preview migration completed with expected tables present.
- [x] Egypt-first wording/palette extended to role dashboards; public home stays visible for signed-in admins; link text contrast corrected.
- [x] Final WebDev checkpoint saved as `9f5765af`.

## Verification
- [x] `pnpm check` passed.
- [x] `pnpm test`: **43 passed** across 10 files.
- [x] `pnpm build` completed; Vite emitted only a non-blocking advisory that the main JS bundle exceeds 500 kB.
- [x] Desktop screenshots verified the home page and URL-filtered teacher results.
- [x] Mobile screenshot verified the Arabic homepage and hero without horizontal overflow.
- [x] `git diff --check` passed.
- [x] Commit and push the verified changes to the selected GitHub repository.

## Launch follow-ups
- [ ] Replace the explicitly marked demo tutors, dashboard metrics, and example rows with real approved marketplace records.
- [ ] Connect/test payment, payout, support, and notification providers; do not collect payment information in this preview.
- [ ] Add business-approved Terms of Service and Privacy Policy content before commercial launch.
- [ ] Reviews/matching scores are not supported by the current live public API; those claims are omitted from the public UI.
- [ ] Configure OAuth for the production domain and test each role.
- [ ] Populate approved teachers, schedules/time zones, country/currency details, and notifications before launch.
- [ ] This is a development preview, not a separately published production deployment.

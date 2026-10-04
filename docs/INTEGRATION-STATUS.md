# مُعلّم Integration Status

**Last checked:** 2026-10-04. These statuses describe the audited source and configured environment, not a promise that a provider account or credentials will be obtained.

| Integration | Status | Evidence / next step |
|---|---|---|
| Paymob | **NOT LIVE — not implemented** | No checkout intent, signature-verified webhook, reconciliation, or payment tests. Select provider/account and implement idempotent payment/refund flows before charging. |
| Fawry | **NOT LIVE — not implemented** | No provider adapter or credentials detected. Requires a business/provider choice before implementation. |
| Wallet / teacher ledger | **NOT IMPLEMENTED** | No immutable accounting ledger or reconciliation. Do not calculate payable balance from client-visible booking records. |
| Refunds / teacher payouts | **NOT IMPLEMENTED** | No refund authorization, payout request/approval, processing adapter, or audit lifecycle. |
| Zoom | **NOT LIVE — not implemented** | No Zoom SDK/API integration or provider credentials detected. |
| Google Meet | **NOT LIVE — not implemented** | No Workspace API integration or OAuth scope/credentials detected. |
| WhatsApp Business | **NOT LIVE — not implemented** | No official provider integration or message templates/consent workflow detected. |
| SMS | **NOT LIVE — not implemented** | No delivery provider credentials or webhook/event worker detected. |
| Email notifications | **NOT CONFIGURED** | No provider-backed production delivery and bounce/consent flow verified. |
| Manus OAuth | **Configured for the preview; production not verified** | OAuth is present in code and preview runtime. Production domain callback, role-by-role signup/login, cookie and logout flows still require a post-release test. |
| Marketplace DB | **Connected to the preview DB** | `/api/health` on the isolated local production server and WebDev preview returned `database: ok`. The custom-domain deployment is stale and returned HTML for its health path. |

## Before enabling a provider

1. Obtain the required legal/business/provider approval and test account.
2. Store secrets only in the platform's secret manager; do not commit them, put them in frontend variables, or place them in audit logs.
3. Add webhook signature verification, idempotency keys, replay protection, audit records, retry/backoff and reconciliation.
4. Add deterministic tests plus isolated provider sandbox tests; do not test charges against production funds.
5. Update this table only after a successful sandbox or production end-to-end test, with status **TEST** or **LIVE** as appropriate.

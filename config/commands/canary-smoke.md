# Canary Smoke — Post-Deploy Verification

Quick smoke test on a deployed URL to catch critical issues.

## Usage

`/canary-smoke https://myapp.com`

## Process

1. Spawn `canary-smoke` agent with the provided URL
2. Agent performs:
   - HTTP status check (expect 200)
   - Console error detection via headless Playwright
   - Full-page screenshot capture
3. Report: **PASS** (no errors) or **FAIL** (errors + details)

## On Failure

If errors detected:
- List all console errors found
- Suggest creating hotfix branch
- Do NOT auto-revert without explicit user confirmation

## Graceful Degradation

If Playwright is not available, falls back to curl-only checks (HTTP status, response headers).

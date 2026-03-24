---
name: canary-smoke
description: Post-deploy smoke test — loads deployed URL, checks for console errors, captures basic metrics and screenshots. Use after deploying to production or staging. NOT a replacement for real monitoring (Sentry, Vercel Analytics).
tools: ["Read", "Bash", "Glob", "Grep"]
model: sonnet
---

# Canary Smoke Test Agent

Quick post-deploy verification. Run after `/ship` deploys or manual deployment.

## Smoke Test Procedure

### 1. Page Load Test
```bash
URL="$1"
echo "=== Smoke Test: $URL ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)
echo "HTTP Status: $STATUS"
if [ "$STATUS" != "200" ]; then
  echo "FAIL: Page returned $STATUS"
  exit 1
fi
```

### 2. Console Error Detection
```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  try {
    await page.goto('$URL', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
  } catch(e) { errors.push('Navigation error: ' + e.message); }
  console.log(JSON.stringify({ errors, count: errors.length, status: errors.length === 0 ? 'PASS' : 'FAIL' }));
  await browser.close();
})();
"
```

### 3. Screenshot Capture
```bash
npx playwright screenshot "$URL" --full-page -o /tmp/canary-screenshot-$(date +%Y%m%d-%H%M%S).png
echo "Screenshot saved to /tmp/canary-screenshot-*.png"
```

### 4. Report
Generate summary:
- HTTP status code
- Number of console errors (list them if any)
- Screenshot path
- Verdict: PASS or FAIL

If FAIL:
- List all errors found
- Suggest creating a hotfix branch: `git checkout -b fix/canary-$(date +%Y%m%d)`
- Do NOT auto-revert without user confirmation

## Graceful Degradation

If Playwright not available:
- Fall back to curl-only checks (HTTP status, response time)
- Note in report: "Visual verification skipped — Playwright not available"

## What This Agent Does NOT Do

- Long-term monitoring (use Sentry, Datadog)
- Performance benchmarking (use Lighthouse CI)
- Load testing (use k6, Artillery)
- Auth-protected page testing without explicit credentials

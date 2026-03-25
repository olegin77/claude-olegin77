# Security Architecture Reference
> Read this when working on auth, API security, input validation, smart contracts.
> Deep NestJS security patterns: `~/.claude/security.md`

## Threat Modeling (Before Every Feature)
```
1. Who are the actors? (user / admin / attacker)
2. What data flows? (input -> processing -> output)
3. What is the blast radius if this breaks?
4. What is the worst case abuse?
```

## Input Validation (MANDATORY)
```typescript
import { z } from 'zod';
const schema = z.object({
  email:         z.string().email().max(255),
  amount:        z.number().positive().max(1_000_000),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  uuid:          z.string().uuid(),
});
```

## Auth Rules
```
JWT: short expiry + refresh token rotation + Redis blacklist for logout
Cookies: httpOnly + Secure + SameSite=Strict
Rate limit ALL auth endpoints (@Throttle: 5 req/min for auth, 100 req/min for API)
Log failed attempts: IP + user-agent
RBAC: check at data layer, not just UI
Password hashing (priority):
  1. Argon2id: import * as argon2 from 'argon2'; argon2.hash(pw, { type: argon2.argon2id })
  2. bcryptjs (legacy): import * as bcrypt from 'bcryptjs' (NOT default import)
Ownership: return 404 for other user's resources (NOT 403)
```

## API Security Checklist
```
[ ] Rate limiting on all endpoints
[ ] CORS: no wildcard * in production
[ ] HTTPS + HSTS header
[ ] CSP headers configured
[ ] Auth on all private routes
[ ] Input validation everywhere
[ ] Parameterized queries (never string concat SQL)
[ ] Whitelist for dynamic sort fields
[ ] Output encoding (no XSS)
[ ] CSRF on state-changing routes
[ ] nginx: location ~ /\. { deny all; }
[ ] Audit log for sensitive operations
[ ] Secrets via ConfigService (never process.env directly)
[ ] File upload: magic bytes validation
[ ] Ownership check: 404 for other user's resources
```

## Smart Contract Security (Solana/TAKARA)
```
Validate all account ownership + explicit signer constraints
Checked arithmetic (no integer overflow)
Reentrancy guards on vault operations
Time-lock + multisig for admin/treasury ops
Pre-deploy: anchor lint -> peer review -> devnet adversarial test -> PDA collision check
```

## AI Integration
```
Model routing: Haiku (fast/cheap) -> Sonnet (coding) -> Opus (reasoning)
Stream for user-facing responses > 200 tokens
Cache identical prompts (Redis, 1hr TTL)
Fallback to simpler model on timeout/error
NEVER concatenate raw user input into prompts
Validate LLM output before using in business logic
```

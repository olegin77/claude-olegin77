# Caching Strategy — Always Last

> Read this file when cache/ISR/CDN keywords detected.

## Rule: Caching is the LAST step (enforced by v7-code-enforcer.sh)

NEVER enable during active development. The hook blocks these patterns until visual verification passes.

## Blocked Patterns

| Pattern | Framework | Hook blocks |
|---------|-----------|-------------|
| `revalidate` | Next.js ISR | Yes (exit 2) |
| `stale-while-revalidate` | HTTP headers | Yes |
| `Cache-Control`, `s-maxage` | HTTP headers | Yes |
| `@CacheInterceptor`, `@CacheTTL` | NestJS | Yes |
| `cache.put()`, `cacheFirst` | Service Worker | Yes |
| CDN cache rules | Cloudflare/Vercel | Yes |

## When to Enable

1. Visual verification passed (screenshot matches design)
2. Functional tests passed (E2E green)
3. As the FINAL step before PR/deploy (in `/ship` pipeline)
4. With comment: `// Caching enabled post-verification`

## Per-Framework Patterns

### Next.js ISR (enable last)
```typescript
// Only add AFTER visual + functional verification
export const revalidate = 3600; // 1 hour
// or
export const dynamic = 'force-static';
```

### NestJS (enable last)
```typescript
// Only add AFTER endpoint testing complete
@UseInterceptors(CacheInterceptor)
@CacheTTL(300)
```

### CDN (enable last)
- Vercel: configure in vercel.json AFTER deploy verification
- Cloudflare: Page Rules or Cache Rules AFTER canary passes

## Debug Commands

```bash
# Next.js — check ISR status
curl -I https://site.com/page | grep -i cache

# Cloudflare — purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE/purge_cache" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"purge_everything":true}'

# Browser — force reload
# Ctrl+Shift+R or DevTools > Network > Disable cache

# Vercel — redeploy to clear edge cache
vercel --force
```

## Why Caching Last?

Problem experienced: Claude enables ISR/CDN during development, user doesn't see changes,
reports "nothing changed on prod." This is NOT browser cache — it's server-side caching
serving stale content. Fix: never enable caching until visual verification confirms
the correct version is being served.

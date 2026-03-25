# Deployment Reference
> Read this when deploying, working with Docker, CI/CD, or server operations.

## Standard Deploy Flow
```bash
# 1. Rsync -- NEVER include .env, node_modules, .git, .next
rsync -az --delete \
  --exclude='.env' --exclude='.env.*' \
  --exclude='node_modules' --exclude='.git' --exclude='.next' \
  /local/path/ user@server:/remote/path/

# 2. Build on server
ssh user@server "cd /path && docker compose build --no-cache"

# 3. Restart + verify
ssh user@server "cd /path && docker compose up -d && docker compose logs --tail=50"
```

## Critical Deploy Rules
```
NEVER rsync .env (server has different DB ports and secrets)
NEVER git push --force on main
Docker media files: must be on server BEFORE docker build (COPY bakes into image)
Next.js: delete .next before rebuild on server (stale page cache)
Django migrations: run ONLY inside Docker (django-prometheus not local)
JWT_SECRET: MUST be same across ALL microservices (critical for TEZCO)
nginx sites-enabled: may NOT be symlink -- copy directly after edits
Docker network names: auto-generated (tezco_default NOT tezco-net)
Docker env with !: silently stripped -- use _ instead
Container communication: use container names, not localhost
```

## CI/CD Pipeline Standard
```yaml
stages:
  - lint-and-typecheck
  - unit-tests
  - integration-tests
  - build
  - e2e-tests           # Playwright on staging
  - security-scan       # npm audit + security-auditor
  - deploy-staging
  - smoke-tests
  - deploy-production   # Manual approval required
```

## Emergency Protocols
```
Production down      -> Check logs -> rollback -> fix -> postmortem
Security breach      -> Isolate -> rotate ALL credentials -> log -> notify
Data loss risk       -> STOP all writes -> backup -> assess
Smart contract bug   -> Pause if pausable -> assess exploit window -> patch
Docker won't start   -> Check .env for ! in values; check network name collision
```

## Version Rollback
```bash
git tag -l --sort=-version:refname          # List versions
git show vX.X.X --stat                      # What was in version
git revert HEAD~N                           # Rollback code (preserves history)
pnpm typeorm migration:revert -d src/database/data-source.ts  # Rollback migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME        # Prisma rollback
```

## Tooling Quick Reference
```bash
# Package managers
pnpm install --frozen-lockfile          # NestJS projects
pip install X --break-system-packages   # Python -- ALWAYS this flag

# Prisma
npx prisma migrate dev | studio | generate

# Docker
docker compose up -d --build
docker compose logs --tail=100 -f
docker stats

# Git tags
git tag -a vX.X.X -m "description"
git push origin vX.X.X

# NestJS testing
pnpm test                               # unit
pnpm test:integration                   # with real DB
pnpm seed                               # seed test data

# Monitoring
pm2 logs | pm2 status                    # NAVR

# Solana
anchor build && anchor test
```

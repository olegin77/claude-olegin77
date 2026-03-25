# Critical Pitfalls (cross-project)
> Read this before making changes that touch shell scripts, TypeScript, Prisma, or Docker.

## Shell & Scripting
```
! in passwords: bash history expansion eats it -> use Python subprocess instead of curl
$ in bcrypt hashes ($2b$12$...): bash variable expansion eats them -> use Python
Docker .env with !: silently stripped -> use _ instead
```

## TypeScript / JavaScript
```
TypeORM decimal columns: ALWAYS Number() convert (returns string, not number!)
bcryptjs import: import * as bcrypt from 'bcryptjs' (NOT default import)
Next.js Image + user uploads: always unoptimized prop for /uploads/ paths
SWR/React Query with cookies: always { credentials: 'include' }
Pinia after hard reload: call authStore.loadUser() in router guard (async)
```

## Prisma / Database
```
Prisma SSH tunnel: npx prisma db push fails over SSH -> apply via psql directly
Prisma v7: prisma generate REQUIRED before build; output path in prisma.config.ts
Django app labels: use label NOT module name in migration dependencies
UUID validation: always before DB query (return clean 404, not 500 crash)
```

## Deployment / Docker
```
Next.js: ALWAYS delete .next before server rebuild
Docker standalone: bcryptjs must be in standalone/node_modules
nginx: after editing sites-available, COPY to sites-enabled (not just symlink)
Docker network: auto-named (tezco_default NOT tezco-net)
Container comms: use container name not localhost
Scanner bots: constantly probe for phpunit/.git/nodestatus -> monitor nginx logs
```

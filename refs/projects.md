# Projects Portfolio Reference
> Read this file when working on a specific project or need project context.

## Tech Stack Quick Reference

| Project | Backend | Frontend | DB | Server | Mobile |
|---------|---------|----------|----|--------|--------|
| P2P | Django 5 + DRF + Celery | Vue 3 + PrimeVue 4 | PostgreSQL 16 + Redis + ClickHouse | 165.22.199.231 | RN+Expo (buyer/seller) |
| TEZCO | NestJS (9 microservices) | Next.js 14 + React Native | PostgreSQL + Redis + Kafka | 46.101.119.165 | RN+Expo (existing) |
| Nectra | Next.js 16 API routes | Next.js 16 | SQLite (Prisma 6) | 46.101.232.6 | — |
| EPYC.uz | FastAPI + SQLAlchemy 2 | Next.js 14 | PostgreSQL 16 + Redis | 165.22.73.203 | — (web-first) |
| NAVR.uz | Next.js 15 API routes | Next.js 15 | PostgreSQL 16 (Prisma v7) | 46.8.176.25 | RN+Expo (customer) |
| FinTrack | NestJS 10 | Next.js 14 | PostgreSQL 16 + Redis | local dev | — |
| WeddingUz | Deno Edge + Supabase | React 18 + Vite | Supabase (PostgreSQL) | 162.243.168.239 | RN+Expo (event booking) |

## Mobile Stack (all mobile projects)

- **Framework:** React Native 0.76+ with Expo SDK 52+
- **Navigation:** Expo Router v4 (file-based)
- **State:** Zustand (client) + React Query (server)
- **Build:** EAS Build + EAS Update (OTA hotfixes)
- **Patterns:** See `~/.claude/refs/mobile-patterns.md`

## Key Rules Per Project

**P2P** — App label: system_settings (NOT settings) in migrations. BalanceService for ALL money ops. Frontend builds and Django migrations: only inside Docker. DRF PAGE_SIZE=10 globally.

**TEZCO** — JWT_SECRET MUST be identical across all 9 services. Container prefix: tezco- (http://tezco-financial:3003). TypeORM decimal -> always Number() convert (returns string!). Admin routes: /admin/ prefix.

**Nectra** — import * as bcrypt from 'bcryptjs' (NOT default import). DATABASE_URL must be absolute path for SQLite. Dark/light toggle via html.light class.

**EPYC** — Hero media files NOT in git -- upload to server BEFORE docker build (COPY bakes into image). VirtFusion + MinIO + PowerDNS. oklch() color tokens. Click.uz + Payme.

**NAVR** — Never rsync .env. Prisma v7: prisma generate before build. EESBO events only after Fund approval. Ticket QR: &ticket_id=${code} (& prefix required). Match tickets by eesboTicketId, NOT row/seat.

**WeddingUz** — ! in Docker Compose env vars silently stripped -- use _ instead. Canvas2D particles (Three.js removed). GoTrue: GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated.

**TAKARA/Solana** — Treasury PDAs: time-lock on withdrawals. APY uses on-chain clock only. Token minting requires multisig. All admin instructions emit events for indexing.

## Design Systems

| Project | Theme | Accent | Key Pattern |
|---------|-------|--------|-------------|
| P2P | Light glassmorphism | Gradient CTAs | rgba(255,255,255,0.85) + blur(8px) |
| TEZCO | Dark fintech | Orange #FF6B2B / Blue #0099CC | Stripe-inspired |
| Nectra | Dark/Light toggle | Teal #00D4AA | Purple #0a0520, CSS var theming |
| EPYC | VOID VIOLET | oklch accent | Bento grid, no AI-cliche icons |
| NAVR | Clean functional | Brand primary | Region-first UX |
| WeddingUz | Warm Dusk | Gold | Chocolate #2a1f1e -> cream #faf8f5, Playfair Display |

## Server Inventory

| Project | IP | User | Path |
|---------|-----|------|------|
| P2P | 165.22.199.231 | root | /opt/p2p/ |
| TEZCO | 46.101.119.165 | root | /root/tezco/ |
| Nectra | 46.101.232.6 | root | /opt/nectra/ |
| EPYC | 165.22.73.203 | root (key: ~/.ssh/epycuz_deploy) | /opt/epycuz/ |
| NAVR | 46.8.176.25 | test1 (key auth, sudo) | /home/navr/navr-app/ |
| WeddingUz | 162.243.168.239 | root | /opt/weddinguz/ |

## External Integrations

| Integration | Project | Protocol |
|-------------|---------|---------|
| Lockton BO-Gate | TEZCO | JSON-RPC 2.0 + Basic Auth |
| HUMO Middleware | TEZCO | REST + Bearer token |
| Uzcard SV-GATE | TEZCO | JSON-RPC 2.0 + Basic Auth |
| Click.uz | EPYC | Merchant API + webhook |
| Payme | EPYC | JSON-RPC + webhook |
| Rail.io | Nectra | REST + OAuth2 (56 endpoints) |
| EESBO | NAVR | REST + Bearer (auto-refresh) |
| TRON TRC20 | P2P | Blockchain (wallet keys) |
| Binance | P2P | REST public (exchange rate, no auth) |
| Google Gemini | WeddingUz | AI API |
| Supabase | WeddingUz | BaaS (JWT + anon/service keys) |
| Playmobile | TEZCO | SMS API |
| Didox.uz | TEZCO | Fiscal API (E-IMZO cert) |

## i18n Patterns

| Project | Languages | Approach |
|---------|-----------|---------|
| NAVR | ru, uz, uz-cyr | Single translations.ts + useI18n() hook + localStorage |
| WeddingUz | ru, en, uz, kk, ky, tg | react-i18next + JSON per locale |
| P2P | ru only | verbose_name in Russian |

```
UZS currency: store as integer (tiyin = 1/100 som)
Phone format: +998 XX XXX-XX-XX
Date format: DD.MM.YYYY (Russian standard)
date-fns locale: locale === 'ru' ? ru : uz
Persist locale: localStorage
```

## Business Advisory (olegin77 team)

| Question Type | Experts |
|---------------|---------|
| Financial model | Michael Chen (CFO) + Sarah Rodriguez |
| Tokenomics | Carlos Mendes (Crypto) + Dr. Elena Volkov (Quant) |
| Strategy | Dr. James Patterson + Lisa Anderson |
| Legal/compliance | Dr. Patricia Morgan + Thomas Mueller |
| Marketing | Jennifer Lopez (CMO) + Daniel Park (Growth) |
| VC / fundraising | Mark Davidson + Rachel Thompson |

Output standard: verified calculations + Excel-ready tables + actionable next steps

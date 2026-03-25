# Backend & API Reference
> Read this when designing APIs, database schemas, or backend services.

## Stack Defaults
```
REST API:   NestJS or FastAPI + Zod/Pydantic + JWT
Database:   PostgreSQL 16 (primary) + Redis 7 (cache/sessions/queues)
ORM:        Prisma (TypeScript) | TypeORM (NestJS) | SQLAlchemy 2 async (Python)
Queue:      BullMQ (Node) | Celery + Redis (Python)
Storage:    MinIO (self-hosted S3-compatible)
```

## API Response Format
```typescript
type ApiError    = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { data: T; meta?: { page?: number; total?: number } };

// Always:
// /api/v1/... versioning
// Idempotency keys for ALL financial operations
// SELECT FOR UPDATE + version field for balance ops (optimistic locking)
// Atomic transactions for multi-table writes
// Every money operation logged to audit table
```

## Database Rules
```
Index all foreign keys
Soft delete: deleted_at nullable timestamp
created_at + updated_at on every table
Row-level security for multi-tenant data
NEVER SELECT * in production
NEVER migrate without backup plan
TypeORM DECIMAL -> ALWAYS Number() convert (returns string!)
UUID: validate BEFORE DB query (404 not 500)
Django: custom app label in AppConfig -> use label in migration deps
```

## Playwright E2E Testing
```typescript
// Page Object Model for complex flows
class DashboardPage {
  constructor(private page: Page) {}
  async navigate() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }
}

// Prefer semantic selectors
await page.getByRole('button', { name: 'Submit' }).click();

// Await network in parallel with click
await Promise.all([
  page.waitForResponse('**/api/**'),
  page.getByRole('button', { name: 'Save' }).click()
]);

// NEVER arbitrary waits -- always waitForSelector/Response

// React auth: use fetch via page.evaluate for login
await page.evaluate(async () => {
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
    credentials: 'include'
  });
});
```

## Debug Commands
```bash
npx playwright test --headed --slowmo=500
npx playwright show-trace trace.zip
npx playwright test auth.spec.ts --debug
npx playwright codegen http://localhost:3000
```

# NestJS Production Patterns
> Read this when working on NestJS projects (TEZCO, FinTrack, or any NestJS codebase).
> Also read: `~/.claude/security.md` (security details) and `~/.claude/testing.md` (test patterns)

## Stack
```
Runtime:     Node.js 21+ | Framework: NestJS 10.x | Language: TypeScript 5.x
ORM:         TypeORM 0.3.x | DB: PostgreSQL 16 | Cache: Redis (ioredis)
Storage:     MinIO (S3-compatible) | Auth: Passport + JWT
Validation:  class-validator + Zod | Docs: Swagger (OpenAPI)
Logging:     Winston + Loki | Metrics: Prometheus + Grafana
Pkg manager: pnpm
```

## Project Structure
```
src/
├── main.ts                         # Bootstrap: CORS, compression, Swagger, ValidationPipe, versioning
├── app.module.ts                   # Root: TypeORM, Config, ResponseInterceptor, HttpLogging
├── common/
│   ├── constants/common.constant.ts # APP_CONFIG_NAME, CACHE_TTL_DEFAULT, PAGINATION_DEFAULT...
│   ├── helpers.ts
│   └── response.ts                  # ResponseInterceptor, BaseDTO, ResponseMessage
├── config/
│   ├── index.ts                     # [appConfig, databaseConfig, cronConfig, ...]
│   ├── app/app.config.ts
│   └── database/database.config.ts
├── database/
│   ├── core.entity.ts               # DO NOT MODIFY -- CoreEntity (created_at, updated_at, deleted_at)
│   ├── data-source.ts
│   └── seeders/
├── interceptors/
│   ├── transform.interceptor.ts
│   └── httpLogging.interceptor.ts
└── modules/
    ├── auth/         # JWT: signUp, signIn
    ├── user/         # User profile
    ├── redis/        # setWithExpiry, get, delete
    ├── minio/        # File storage
    ├── metrics/      # Prometheus
    └── logger/       # Winston + Loki
```

## Entity Pattern
```typescript
@Entity()
export class [Name] extends CoreEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index("idx_[name]_id", { unique: true })
  id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "enum", enum: [Name]Status, default: [Name]Status.ACTIVE })
  status: [Name]Status;

  @Index("idx_[name]_user_id")  // Index on FK -- mandatory
  @Column({ name: "user_id", nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
```

## Service Pattern
```typescript
@Injectable()
export class [Name]Service {
  constructor(
    @InjectRepository([Name]) private readonly repository: Repository<[Name]>,
    private readonly logger: LoggerService,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: [Name]QueryDTO, userId: string) {
    const { page = 1, limit = 20 } = query;
    const safeLimit = Math.min(limit, 100);

    const cacheKey = `[name]s:list:${userId}:p${page}:l${safeLimit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const qb = this.repository.createQueryBuilder('[name]')
      .select(['[name].id', '[name].title', '[name].status', '[name].createdAt'])
      .where('[name].userId = :userId', { userId })
      .andWhere('[name].deletedAt IS NULL')
      .orderBy('[name].createdAt', 'DESC')
      .skip((page - 1) * safeLimit).take(safeLimit);

    const [data, total] = await qb.getManyAndCount();
    const result = { data, pagination: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) } };
    await this.redis.setWithExpiry(cacheKey, JSON.stringify(result), CACHE_TTL_LIST);
    return result;
  }

  async update(id: string, dto: Update[Name]RequestDTO, userId: string) {
    const entity = await this.findOne(id);
    if (entity.userId !== userId) throw new ForbiddenException('Access denied');
    // ... update + cache invalidation + logging
  }
}
```

## Controller Pattern
```typescript
@Controller({ path: '[name]s', version: '1' })
@ApiTags('[Name]s')
export class [Name]Controller {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('[Name] created')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(@Body() dto: Create[Name]RequestDTO, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
```

## DTO Pattern
```typescript
export class [Name]QueryDTO {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
}

export class MobilePaginationDTO {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number = 20;
  @IsOptional() @IsString() cursor?: string;
}
```

## Env Variable Pattern
```typescript
// 1. .env.example -- add variable
// 2. src/config/[domain]/[domain].config.ts
export const paymentConfig = registerAs('payment', () => ({
  apiKey: process.env.PAYMENT_API_KEY,
}));
// 3. src/config/index.ts -- add to array
// 4. In service: this.configService.get<string>('payment.apiKey')
// NEVER: process.env.X directly in service/controller
```

## TypeORM Migrations
```bash
pnpm typeorm migration:generate src/database/migrations/[Name] -d src/database/data-source.ts
pnpm typeorm migration:run -d src/database/data-source.ts
pnpm typeorm migration:revert -d src/database/data-source.ts
pnpm typeorm migration:show -d src/database/data-source.ts
```

## Production Rules

MANDATORY for every endpoint:
- Index on WHERE / ORDER BY fields
- Pagination -- no find() without take limit
- @Throttle on mutating endpoints
- Redis cache on frequently read data
- select only needed fields -- no SELECT *
- LoggerService for all mutations
- ParseUUIDPipe on all :id params
- Versioning: @Controller({ path: '...', version: '1' })

FORBIDDEN in production:
- `await this.repository.find()` without where/take
- `console.log(user.password)` -- credential leak
- `.find({ relations: ['orders', 'items'] })` without select
- `throw new ForbiddenException()` for other user's resources -- use 404
- `.where(\`entity.name = '${name}'\`)` -- SQL injection, only :param syntax

## New Module Checklist

Code:
- [ ] entities/[name].entity.ts -- CoreEntity, uuid PK, @Index on FK
- [ ] dto/request.dto.ts -- Create, Update, Query (limit <= 100)
- [ ] dto/response.dto.ts -- extends BaseDTO
- [ ] [name].service.ts -- CRUD + Redis cache + LoggerService + ownership check
- [ ] [name].controller.ts -- version: '1', @ResponseMessage, @Throttle, ParseUUIDPipe
- [ ] [name].module.ts -- TypeOrmModule, LoggerModule
- [ ] Registered in app.module.ts

Security:
- [ ] Ownership check in every method
- [ ] 404 instead of 403 for other user's resources
- [ ] Parameterized queries (:param syntax)
- [ ] Whitelist for dynamic sort fields
- [ ] @Throttle on create/update/delete
- [ ] Magic bytes validation for file uploads

Testing:
- [ ] 3 unit smoke tests: create / notFound / forbidden
- [ ] 4 security tests: SQL injection / userId spoof / ownership / no-JWT
- [ ] requests/[name].http created/updated
- [ ] Migration tested (up + down)
- [ ] Swagger verified

Docs:
- [ ] CLAUDE.md -- module map updated
- [ ] docs/audit.md, report.md, changelog.md updated
- [ ] decisions/ -- ADR if non-standard decision
- [ ] Git tag if release

## ADR Template (decisions/NNN-title.md)
```markdown
# NNN -- [Title]
**Date:** YYYY-MM-DD | **Status:** Accepted / Rejected

## Decision
## Why
## Alternatives rejected
## Consequences
```

# Vector Memory — Semantic Pattern Store

Local MCP server for storing and retrieving development patterns via TF-IDF cosine similarity.

## When to Use

### STORE patterns after:
- Solving a non-trivial bug (category: `error-fix`)
- Implementing a reusable architecture (category: `architecture`)
- Finding a working configuration (category: `config`)
- Discovering a performance optimization (category: `performance`)
- Establishing a security pattern (category: `security`)
- Creating a reusable code pattern (category: `pattern`)
- Finding a solution to a recurring problem (category: `solution`)

### SEARCH patterns before:
- Starting work on a feature in a project (search by project + domain)
- Debugging an error you've seen before
- Setting up a new service/module similar to existing ones
- Making architecture decisions

## MCP Tools

### `memory_store`
```
title: "Short descriptive title"
content: "Full solution/pattern/code"
category: solution | pattern | error-fix | architecture | config | performance | security | general
tags: ["nestjs", "auth", "jwt"]
project: "tezco"  (optional)
```

### `memory_search`
```
query: "jwt authentication nestjs guard"
limit: 5
category: "solution"  (optional filter)
project: "tezco"  (optional filter)
min_score: 0.1
```

### `memory_list`
```
category: "error-fix"  (optional)
project: "p2p"  (optional)
limit: 20
sort: recent | popular | oldest
```

### `memory_delete`
```
id: 42
```

## Categories Guide

| Category | When | Example |
|----------|------|---------|
| `solution` | Specific problem + working fix | "NestJS JWT refresh token rotation" |
| `pattern` | Reusable code/architecture pattern | "Repository pattern with TypeORM" |
| `error-fix` | Bug diagnosis + resolution | "TypeORM decimal returns string" |
| `architecture` | System design decisions | "Microservice gateway routing" |
| `config` | Environment/tool configuration | "Docker multi-stage for NestJS" |
| `performance` | Optimization techniques | "Redis pipeline batching" |
| `security` | Security patterns/fixes | "CSRF double-submit cookie" |
| `general` | Everything else | Miscellaneous useful info |

## Database

- Location: `~/.claude/vector-memory/db/patterns.db`
- Engine: SQLite with WAL mode
- Search: TF-IDF cosine similarity (zero API cost, <5ms)
- No external dependencies for search

#!/usr/bin/env node
// design-approved

/**
 * Quick smoke test for vector memory TF-IDF engine
 */

import Database from "better-sqlite3";

// Use in-memory DB for tests
const db = new Database(":memory:");

db.exec(`
  CREATE TABLE patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL DEFAULT 'general',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    project TEXT,
    tokens TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    access_count INTEGER NOT NULL DEFAULT 0
  );
`);

// ─── TF-IDF (copied from server.js for standalone test) ──────────

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "through",
  "and", "or", "but", "not", "this", "that", "it", "its",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function computeTf(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  const len = tokens.length || 1;
  for (const key in tf) {
    tf[key] /= len;
  }
  return tf;
}

function computeIdf(documents) {
  const idf = {};
  const n = documents.length;
  for (const doc of documents) {
    const seen = new Set(Object.keys(doc));
    for (const term of seen) {
      idf[term] = (idf[term] || 0) + 1;
    }
  }
  for (const term in idf) {
    idf[term] = Math.log((n + 1) / (idf[term] + 1)) + 1;
  }
  return idf;
}

function cosineSimilarity(vecA, vecB, idf) {
  let dot = 0, magA = 0, magB = 0;
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  for (const term of allTerms) {
    const w = idf[term] || 1;
    const a = (vecA[term] || 0) * w;
    const b = (vecB[term] || 0) * w;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Test Data ────────────────────────────────────────────────────

const patterns = [
  {
    title: "NestJS JWT auth guard with refresh tokens",
    content: "Implement JWT auth guard using @nestjs/passport with access + refresh token rotation. Store refresh tokens hashed in DB. Use ConfigService for JWT_SECRET.",
    category: "solution",
    tags: ["nestjs", "auth", "jwt"],
    project: "tezco",
  },
  {
    title: "TypeORM decimal precision fix",
    content: "TypeORM returns decimal columns as strings. Always wrap with Number() when reading financial data. Use @Column({ type: 'decimal', precision: 18, scale: 8 }).",
    category: "error-fix",
    tags: ["typeorm", "decimal", "financial"],
    project: "p2p",
  },
  {
    title: "Next.js ISR with on-demand updates",
    content: "Use revalidateTag for on-demand ISR. Set time-based intervals for product pages. Create api endpoint with secret token for webhook triggers.",
    category: "pattern",
    tags: ["nextjs", "isr", "frontend"],
    project: "navr",
  },
  {
    title: "Docker multi-stage build for NestJS",
    content: "Use multi-stage build: builder stage with npm ci, production stage with node:alpine. Copy only dist/ and node_modules. Set NODE_ENV=production.",
    category: "config",
    tags: ["docker", "nestjs", "deployment"],
    project: "tezco",
  },
  {
    title: "React Native deep linking with Expo Router",
    content: "Configure app.json scheme and expo-linking. Use useURL() hook for incoming links. Handle universal links via apple-app-site-association.",
    category: "pattern",
    tags: ["react-native", "expo", "deep-linking"],
    project: "navr",
  },
];

// Insert patterns
const stmt = db.prepare(`INSERT INTO patterns (category, title, content, tags, project, tokens) VALUES (?, ?, ?, ?, ?, ?)`);

for (const p of patterns) {
  const fullText = `${p.title} ${p.content} ${p.tags.join(" ")}`;
  const tokens = tokenize(fullText);
  const tf = computeTf(tokens);
  stmt.run(p.category, p.title, p.content, JSON.stringify(p.tags), p.project, JSON.stringify(tf));
}

// ─── Test Search ──────────────────────────────────────────────────

function search(query, expectedTitle) {
  const queryTf = computeTf(tokenize(query));
  const rows = db.prepare("SELECT * FROM patterns").all();
  const allDocs = rows.map((r) => JSON.parse(r.tokens));
  allDocs.push(queryTf);
  const idf = computeIdf(allDocs);

  const scored = rows
    .map((row) => ({
      title: row.title,
      score: cosineSimilarity(queryTf, JSON.parse(row.tokens), idf),
    }))
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const pass = top.title === expectedTitle;
  console.log(`${pass ? "PASS" : "FAIL"} | Query: "${query}"`);
  console.log(`  Top: "${top.title}" (${top.score.toFixed(3)})`);
  if (!pass) {
    console.log(`  Expected: "${expectedTitle}"`);
  }
  console.log();
  return pass;
}

console.log("=== Vector Memory TF-IDF Tests ===\n");

let passed = 0;
let total = 0;

total++;
if (search("jwt authentication nestjs", "NestJS JWT auth guard with refresh tokens")) passed++;

total++;
if (search("decimal precision typeorm money", "TypeORM decimal precision fix")) passed++;

total++;
if (search("nextjs isr frontend pages", "Next.js ISR with on-demand updates")) passed++;

total++;
if (search("docker deployment production", "Docker multi-stage build for NestJS")) passed++;

total++;
if (search("expo deep linking mobile", "React Native deep linking with Expo Router")) passed++;

console.log(`\n=== Results: ${passed}/${total} passed ===`);
process.exit(passed === total ? 0 : 1);

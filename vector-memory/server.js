#!/usr/bin/env node

/**
 * Vector Memory MCP Server
 *
 * Local semantic search over development patterns using TF-IDF cosine similarity.
 * Zero external API dependencies — all computation runs locally.
 *
 * Tools: memory_store, memory_search, memory_list, memory_delete
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, "db", "patterns.db");

// ─── Database Setup ───────────────────────────────────────────────

function initDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS patterns (
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

    CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
    CREATE INDEX IF NOT EXISTS idx_patterns_project ON patterns(project);
    CREATE INDEX IF NOT EXISTS idx_patterns_created ON patterns(created_at);
  `);

  return db;
}

// ─── TF-IDF Engine ────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "that", "this",
  "it", "its", "i", "me", "my", "we", "our", "you", "your", "he", "him",
  "his", "she", "her", "they", "them", "their", "what", "which", "who",
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
  let dot = 0;
  let magA = 0;
  let magB = 0;

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

// ─── MCP Server ───────────────────────────────────────────────────

const db = initDb();
const server = new McpServer({
  name: "vector-memory",
  version: "1.0.0",
});

// Tool: memory_store
server.tool(
  "memory_store",
  "Store a development pattern, solution, or lesson learned for future semantic retrieval",
  {
    title: z.string().describe("Short descriptive title"),
    content: z.string().describe("Full content — solution, pattern, code snippet, lesson"),
    category: z
      .enum(["solution", "pattern", "error-fix", "architecture", "config", "performance", "security", "general"])
      .default("general")
      .describe("Category of the pattern"),
    tags: z.array(z.string()).default([]).describe("Tags for filtering (e.g. ['nestjs', 'auth', 'jwt'])"),
    project: z.string().optional().describe("Project name (e.g. 'tezco', 'navr', 'p2p')"),
  },
  async ({ title, content, category, tags, project }) => {
    const fullText = `${title} ${content} ${tags.join(" ")}`;
    const tokens = tokenize(fullText);
    const tf = computeTf(tokens);

    const stmt = db.prepare(`
      INSERT INTO patterns (category, title, content, tags, project, tokens)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      category,
      title,
      content,
      JSON.stringify(tags),
      project || null,
      JSON.stringify(tf)
    );

    return {
      content: [
        {
          type: "text",
          text: `Stored pattern #${result.lastInsertRowid}: "${title}" [${category}]${project ? ` (${project})` : ""}`,
        },
      ],
    };
  }
);

// Tool: memory_search
server.tool(
  "memory_search",
  "Semantic search over stored patterns using TF-IDF cosine similarity",
  {
    query: z.string().describe("Natural language search query"),
    limit: z.number().default(5).describe("Max results to return"),
    category: z
      .enum(["solution", "pattern", "error-fix", "architecture", "config", "performance", "security", "general"])
      .optional()
      .describe("Filter by category"),
    project: z.string().optional().describe("Filter by project name"),
    min_score: z.number().default(0.1).describe("Minimum similarity score (0-1)"),
  },
  async ({ query, limit, category, project, min_score }) => {
    let sql = "SELECT * FROM patterns WHERE 1=1";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (project) {
      sql += " AND project = ?";
      params.push(project);
    }

    const rows = db.prepare(sql).all(...params);

    if (rows.length === 0) {
      return {
        content: [{ type: "text", text: "No patterns found. Memory is empty for these filters." }],
      };
    }

    // Compute query TF
    const queryTokens = tokenize(query);
    const queryTf = computeTf(queryTokens);

    // Compute IDF across all docs + query
    const allDocs = rows.map((r) => JSON.parse(r.tokens));
    allDocs.push(queryTf);
    const idf = computeIdf(allDocs);

    // Score each pattern
    const scored = rows
      .map((row) => {
        const docTf = JSON.parse(row.tokens);
        const score = cosineSimilarity(queryTf, docTf, idf);
        return { ...row, score };
      })
      .filter((r) => r.score >= min_score)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (scored.length === 0) {
      return {
        content: [{ type: "text", text: `No relevant patterns found for: "${query}" (min_score: ${min_score})` }],
      };
    }

    // Bump access counts
    const updateStmt = db.prepare("UPDATE patterns SET access_count = access_count + 1, updated_at = datetime('now') WHERE id = ?");
    for (const row of scored) {
      updateStmt.run(row.id);
    }

    const results = scored
      .map(
        (r, i) =>
          `${i + 1}. [${r.score.toFixed(3)}] #${r.id} "${r.title}" [${r.category}]${r.project ? ` (${r.project})` : ""}\n   Tags: ${r.tags}\n   ${r.content.substring(0, 300)}${r.content.length > 300 ? "..." : ""}`
      )
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${scored.length} patterns for "${query}":\n\n${results}`,
        },
      ],
    };
  }
);

// Tool: memory_list
server.tool(
  "memory_list",
  "List stored patterns with optional filtering",
  {
    category: z
      .enum(["solution", "pattern", "error-fix", "architecture", "config", "performance", "security", "general"])
      .optional()
      .describe("Filter by category"),
    project: z.string().optional().describe("Filter by project name"),
    limit: z.number().default(20).describe("Max results"),
    sort: z.enum(["recent", "popular", "oldest"]).default("recent").describe("Sort order"),
  },
  async ({ category, project, limit, sort }) => {
    let sql = "SELECT id, category, title, tags, project, access_count, created_at FROM patterns WHERE 1=1";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (project) {
      sql += " AND project = ?";
      params.push(project);
    }

    const orderMap = {
      recent: "created_at DESC",
      popular: "access_count DESC",
      oldest: "created_at ASC",
    };
    sql += ` ORDER BY ${orderMap[sort]} LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(sql).all(...params);

    if (rows.length === 0) {
      return {
        content: [{ type: "text", text: "No patterns stored yet." }],
      };
    }

    const total = db.prepare("SELECT COUNT(*) as count FROM patterns").get();

    const list = rows
      .map(
        (r) =>
          `#${r.id} [${r.category}] "${r.title}"${r.project ? ` (${r.project})` : ""} — ${r.access_count} hits — ${r.created_at}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Patterns (${rows.length}/${total.count} total):\n\n${list}`,
        },
      ],
    };
  }
);

// Tool: memory_delete
server.tool(
  "memory_delete",
  "Delete a pattern by ID",
  {
    id: z.number().describe("Pattern ID to delete"),
  },
  async ({ id }) => {
    const row = db.prepare("SELECT title FROM patterns WHERE id = ?").get(id);
    if (!row) {
      return {
        content: [{ type: "text", text: `Pattern #${id} not found.` }],
      };
    }

    db.prepare("DELETE FROM patterns WHERE id = ?").run(id);
    return {
      content: [{ type: "text", text: `Deleted pattern #${id}: "${row.title}"` }],
      };
  }
);

// ─── Start Server ─────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Vector Memory server error:", err);
  process.exit(1);
});

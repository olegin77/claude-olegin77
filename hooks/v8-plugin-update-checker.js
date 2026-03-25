#!/usr/bin/env node
// v8-plugin-update-checker: Check all marketplace plugins for updates on session start
// Compares installed versions with GitHub latest releases
// Outputs update suggestions to stderr (visible as hook context)

const https = require('https');
const fs = require('fs');
const path = require('path');

const HOME = require('os').homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const CACHE_FILE = path.join(CLAUDE_DIR, 'cache', 'plugin-update-check.json');
const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours between checks

// Plugin registry: marketplace-id → { repo, installedVersionDir, pluginName }
const PLUGINS = {
  'ui-ux-pro-max-skill': {
    repo: 'nextlevelbuilder/ui-ux-pro-max-skill',
    plugin: 'ui-ux-pro-max',
    tagPrefix: 'v'
  },
  'compound-engineering-plugin': {
    repo: 'EveryInc/compound-engineering-plugin',
    plugin: 'compound-engineering',
    tagPrefix: 'compound-engineering-v'
  },
  'safety-net-dev': {
    repo: 'kenryu42/claude-code-safety-net',
    plugin: 'safety-net',
    tagPrefix: 'v'
  },
  'claude-hud': {
    repo: 'jarrodwatts/claude-hud',
    plugin: 'claude-hud',
    tagPrefix: 'v'
  },
  'aiguide': {
    repo: 'timescale/pg-aiguide',
    plugin: 'pg',
    tagPrefix: 'v'
  },
  'everything-claude-code': {
    repo: 'affaan-m/everything-claude-code',
    plugin: 'everything-claude-code',
    tagPrefix: 'v'
  }
};

function getInstalledVersion(marketplace, pluginName) {
  const cacheDir = path.join(CLAUDE_DIR, 'plugins', 'cache', marketplace, pluginName);
  if (!fs.existsSync(cacheDir)) return null;
  const versions = fs.readdirSync(cacheDir)
    .filter(d => fs.statSync(path.join(cacheDir, d)).isDirectory())
    .sort();
  return versions.length > 0 ? versions[versions.length - 1] : null;
}

function fetchLatestRelease(repo) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/releases/latest`,
      headers: { 'User-Agent': 'claude-v8-update-checker' },
      timeout: 5000
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.tag_name || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function extractVersion(tag, prefix) {
  if (!tag) return null;
  return tag.startsWith(prefix) ? tag.slice(prefix.length) : tag;
}

function isNewer(remote, local) {
  if (!remote || !local) return false;
  // Simple semver comparison
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if (rv > lv) return true;
    if (rv < lv) return false;
  }
  return false;
}

async function main() {
  // Read stdin (hook protocol)
  let input = '';
  process.stdin.on('data', d => input += d);
  process.stdin.on('end', async () => {
    // Check cache — skip if checked recently
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        if (Date.now() - cache.checked < CHECK_INTERVAL_MS) {
          // Show cached updates if any
          if (cache.updates && cache.updates.length > 0) {
            process.stderr.write(`\n📦 Plugin updates available (cached):\n`);
            cache.updates.forEach(u => {
              process.stderr.write(`   ${u.plugin}: ${u.installed} → ${u.latest}\n`);
            });
            process.stderr.write(`   Run: claude plugins update <plugin>@<marketplace>\n\n`);
          }
          process.stdout.write(input);
          return;
        }
      }
    } catch {}

    const updates = [];

    // Check each plugin in parallel
    const checks = Object.entries(PLUGINS).map(async ([marketplace, cfg]) => {
      const installed = getInstalledVersion(marketplace, cfg.plugin);
      if (!installed) return; // Not installed, skip

      const latestTag = await fetchLatestRelease(cfg.repo);
      const latestVer = extractVersion(latestTag, cfg.tagPrefix);

      if (latestVer && isNewer(latestVer, installed)) {
        updates.push({
          plugin: cfg.plugin,
          marketplace,
          installed,
          latest: latestVer,
          tag: latestTag
        });
      }
    });

    await Promise.all(checks);

    // Save cache
    try {
      const cacheDir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify({
        checked: Date.now(),
        updates
      }, null, 2));
    } catch {}

    // Report updates
    if (updates.length > 0) {
      process.stderr.write(`\n📦 Plugin updates available:\n`);
      updates.forEach(u => {
        process.stderr.write(`   ${u.plugin}: ${u.installed} → ${u.latest}\n`);
      });
      process.stderr.write(`\n   Update all:\n`);
      updates.forEach(u => {
        process.stderr.write(`   claude plugins update ${u.plugin}@${u.marketplace}\n`);
      });
      process.stderr.write(`\n`);
    }

    // Pass through input
    process.stdout.write(input);
  });
}

main();

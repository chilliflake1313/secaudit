const Scan = require("../models/Scan");
const { calculateScore } = require("../utils/scoring");
const { calculateConfidence } = require("../utils/confidence");
const { deduplicate } = require("../utils/dedup");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const os = require("os");
const path = require("path");
const fs = require("fs").promises;
const { withTimeout } = require("../utils/timeout");

function isGithub(target) {
  return /github\.com\/[^/]+\/[^/]+/i.test(target);
}

function normalizeRepo(target) {
  const m = target.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/, "");
  return { owner, repo };
}

async function fetchPackageJson(owner, repo) {
  const urls = [
    `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { timeout: 5000 });
      if (res.ok) return await res.json();
    } catch {}
  }
  return null;
}

async function checkDependencies(pkg) {
  const issues = [];
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  for (const [name, version] of Object.entries(deps)) {
    if (/^(?:\^|~)?0\./.test(version)) {
      issues.push({
        title: `Risky version: ${name}`,
        severity: "low",
        description: `Using pre-1.0 version (${version})`,
        fix: "Upgrade to a stable version"
      });
    }
  }

  return issues;
}

async function checkWebsite(target) {
  const issues = [];

  try {
    const res = await fetch(target, { redirect: "follow", timeout: 7000 });

    const url = res.url || target;
    const h = res.headers;

    if (!url.startsWith("https://")) {
      issues.push({
        title: "No HTTPS",
        severity: "high",
        description: "Final URL is not HTTPS",
        fix: "Enable HTTPS"
      });
    }

    if (!h.get("strict-transport-security")) {
      issues.push({
        title: "Missing HSTS",
        severity: "medium",
        description: "No HSTS header",
        fix: "Add Strict-Transport-Security"
      });
    }

    if (!h.get("content-security-policy")) {
      issues.push({
        title: "Missing CSP",
        severity: "medium",
        description: "No Content Security Policy",
        fix: "Add CSP header"
      });
    }

    if (!h.get("x-frame-options")) {
      issues.push({
        title: "Missing X-Frame-Options",
        severity: "low",
        description: "Clickjacking protection missing",
        fix: "Add X-Frame-Options"
      });
    }
  } catch {
    issues.push({
      title: "Site unreachable",
      severity: "medium",
      description: "Failed to fetch site",
      fix: "Check availability"
    });
  }

  return issues;
}

function mapSeverity(s) {
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "moderate") return "medium";
  return "low";
}

async function runNpmAudit(target) {
  const repo = normalizeRepo(target);
  if (!repo) return [];

  const tmpDir = path.join(os.tmpdir(), `secaudit-${Date.now()}`);

  try {
    await execAsync(`git clone --depth=1 https://github.com/${repo.owner}/${repo.repo}.git "${tmpDir}"`);

    const installCmd = `cd "${tmpDir}" && npm install --ignore-scripts --no-audit --no-fund`;
    await execAsync(installCmd, { timeout: 120000 });

    const { stdout } = await execAsync(`cd "${tmpDir}" && npm audit --json`, { timeout: 120000 });

    const data = JSON.parse(stdout || '{}');
    const issues = [];

    if (data.vulnerabilities) {
      for (const [name, vuln] of Object.entries(data.vulnerabilities)) {
        issues.push({
          title: `Vulnerable package: ${name}`,
          severity: mapSeverity(vuln.severity || vuln.severity),
          description: vuln.title || "Known vulnerability",
          fix: "Run npm audit fix"
        });
      }
    }

    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}

    return issues;
  } catch (err) {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
    return [
      {
        title: "Audit failed",
        severity: "low",
        description: "Could not run npm audit",
        fix: "Check repository setup"
      }
    ];
  }
}

// Parallel multi-tool engine
const tools = [
  {
    name: "deps_basic",
    run: async (target) => {
      if (!isGithub(target)) return [];

      const repo = normalizeRepo(target);
      if (!repo) return [];

      const pkg = await fetchPackageJson(repo.owner, repo.repo);

      if (!pkg) {
        return [
          {
            title: "No package.json",
            severity: "low",
            description: "Dependency analysis not possible",
            fix: "Ensure repo has package.json"
          }
        ];
      }

      return checkDependencies(pkg);
    }
  },
  {
    name: "npm_audit",
    run: async (target) => {
      if (!isGithub(target)) return [];
      return runNpmAudit(target);
    }
  },
  {
    name: "http_headers",
    run: async (target) => {
      if (isGithub(target)) return [];
      return checkWebsite(target);
    }
  }
];

async function runScan(scanId) {
  const scan = await Scan.findById(scanId);
  if (!scan) return;

  scan.status = "running";
  await scan.save();

  try {
    const toolResults = [];

    const results = await Promise.allSettled(
      tools.map(async (tool) => {
        try {
          const data = await withTimeout(tool.run(scan.target), 20000);

          return {
            name: tool.name,
            status: "done",
            issues: data
          };
        } catch (err) {
          return {
            name: tool.name,
            status: "failed",
            issues: []
          };
        }
      })
    );

    let issuesRaw = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        toolResults.push({
          name: r.value.name,
          status: r.value.status
        });

        issuesRaw.push(...r.value.issues);
      }
    }

    const issues = deduplicate(issuesRaw);

    const score = calculateScore(issues);

    const confidence = calculateConfidence(toolResults);

    const coverage = Math.round(
      (toolResults.filter((t) => t.status === "done").length /
        toolResults.length) *
        100
    );

    scan.status = "completed";
    scan.issues = issues;
    scan.score = score;
    scan.confidence = confidence;
    scan.coverage_percent = coverage;
    scan.warnings = [];

    await scan.save();
  } catch (err) {
    scan.status = "failed";
    scan.error = err.message;
    await scan.save();
  }
}

module.exports = { runScan };

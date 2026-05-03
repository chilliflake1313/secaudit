const Scan = require("../models/Scan");
const { calculateScore } = require("../utils/scoring");
const { retry } = require("../utils/retry");

async function runScan(scanId) {
  const scan = await Scan.findById(scanId);
  if (!scan) return;

  scan.status = "running";
  await scan.save();

  try {
    const issues = await retry(() => runChecks(scan.target));

    const score = calculateScore(issues);

    scan.status = "completed";
    scan.issues = issues;
    scan.score = score;
    scan.confidence = "medium";
    scan.coverage_percent = 65;
    scan.warnings = [];

    await scan.save();
  } catch (err) {
    scan.status = "failed";
    scan.error = err.message;
    await scan.save();
  }
}

const fetch = require("node-fetch");

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
        severity: "medium",
        description: `Using pre-1.0 version (${version})`,
        fix: "Upgrade to a stable version"
      });
    }
  }

  return issues;
}

async function checkWebsite(target) {
  const issues = [];

  if (!/^https:\/\//i.test(target)) {
    issues.push({
      title: "No HTTPS",
      severity: "high",
      description: "Site is not using HTTPS",
      fix: "Enable HTTPS"
    });
  }

  try {
    const res = await fetch(target, { redirect: "follow", timeout: 7000 });

    const finalUrl = res.url || target;
    const headers = res.headers;

    if (!/^https:\/\//i.test(finalUrl)) {
      issues.push({
        title: "No HTTPS (after redirects)",
        severity: "high",
        description: "Final URL is not HTTPS",
        fix: "Force HTTPS redirects"
      });
    }

    if (!headers.get("strict-transport-security")) {
      issues.push({
        title: "Missing HSTS",
        severity: "medium",
        description: "Strict-Transport-Security header not set",
        fix: "Add HSTS header"
      });
    }

    if (!headers.get("content-security-policy")) {
      issues.push({
        title: "Missing CSP",
        severity: "medium",
        description: "Content-Security-Policy header not set",
        fix: "Add CSP header"
      });
    }
  } catch {
    issues.push({
      title: "Site unreachable",
      severity: "medium",
      description: "Could not fetch site",
      fix: "Check availability"
    });
  }

  return issues;
}

async function runChecks(target) {
  let issues = [];

  if (isGithub(target)) {
    const repo = normalizeRepo(target);

    if (!repo) {
      return [
        {
          title: "Invalid repo format",
          severity: "low",
          description: "Could not parse repository URL",
          fix: "Use github.com/owner/repo format"
        }
      ];
    }

    const pkg = await fetchPackageJson(repo.owner, repo.repo);

    if (!pkg) {
      issues.push({
        title: "No package.json",
        severity: "low",
        description: "Dependency analysis not possible",
        fix: "Ensure project has package.json"
      });
    } else {
      issues.push(...(await checkDependencies(pkg)));
    }
  } else {
    issues.push(...(await checkWebsite(target)));
  }

  return issues;
}

module.exports = { runScan };

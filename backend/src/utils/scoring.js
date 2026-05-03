function severityWeight(severity) {
  if (severity === "critical") return 40;
  if (severity === "high") return 20;
  if (severity === "medium") return 10;
  return 5;
}

function calculateScore(issues = []) {
  if (!issues.length) return 100;

  let penalty = 0;

  for (const issue of issues) {
    penalty += severityWeight(issue.severity);
  }

  const score = 100 - penalty;

  return Math.max(0, score);
}

module.exports = { calculateScore };

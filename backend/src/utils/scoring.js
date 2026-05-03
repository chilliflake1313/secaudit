function calculateScore(issues = []) {
  if (!issues.length) return 100;

  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const issue of issues) {
    if (issue.severity === "critical") critical++;
    else if (issue.severity === "high") high++;
    else if (issue.severity === "medium") medium++;
    else low++;
  }

  // Capped penalties per severity level (prevent linear collapse)
  const penalty =
    Math.min(critical * 40, 60) +
    Math.min(high * 20, 50) +
    Math.min(medium * 10, 30) +
    Math.min(low * 5, 20);

  const score = 100 - penalty;

  return Math.max(0, score);
}

module.exports = { calculateScore };

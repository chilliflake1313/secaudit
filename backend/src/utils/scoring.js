function calculateScore(issues = []) {
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === "critical") score -= 40;
    else if (issue.severity === "high") score -= 20;
    else if (issue.severity === "medium") score -= 10;
    else score -= 5;
  }

  if (score < 0) score = 0;

  return score;
}

module.exports = { calculateScore };

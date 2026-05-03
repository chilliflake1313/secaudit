function fingerprint(issue) {
  return [
    issue.title,
    issue.severity,
    issue.description
  ]
    .join("|")
    .toLowerCase();
}

function deduplicate(issues = []) {
  const seen = new Set();
  const result = [];

  for (const issue of issues) {
    const key = fingerprint(issue);

    if (!seen.has(key)) {
      seen.add(key);
      result.push(issue);
    }
  }

  return result;
}

module.exports = { deduplicate };

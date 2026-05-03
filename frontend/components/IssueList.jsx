function getStyle(severity) {
  if (severity === "critical") return "border-red-400 bg-red-50";
  if (severity === "high") return "border-orange-400 bg-orange-50";
  if (severity === "medium") return "border-yellow-400 bg-yellow-50";
  return "border-gray-200";
}

export default function IssueList({ issues = [] }) {
  if (!issues.length) {
    return (
      <div className="border p-5 rounded bg-green-50 border-green-300">
        No issues found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {issues.map((issue, i) => (
        <div key={i} className={`border p-5 rounded ${getStyle(issue.severity)}`}>
          <div className="font-semibold">{issue.title}</div>

          {issue.description && (
            <div className="text-sm text-gray-600 mt-1">
              {issue.description}
            </div>
          )}

          {issue.fix && (
            <div className="text-xs mt-2 bg-white border px-2 py-1 inline-block">
              Fix: {issue.fix}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

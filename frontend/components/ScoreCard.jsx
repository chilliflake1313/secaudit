function getColor(confidence) {
  if (confidence === "high") return "text-green-600";
  if (confidence === "medium") return "text-yellow-600";
  return "text-red-600";
}

function countIssues(issues = []) {
  const map = { critical: 0, high: 0, medium: 0, low: 0 };

  issues.forEach((i) => {
    map[i.severity] = (map[i.severity] || 0) + 1;
  });

  return map;
}

export default function ScoreCard({ score, confidence, coveragePercent, issues }) {
  const c = countIssues(issues);

  return (
    <div className="border-b pb-6 flex justify-between">
      <div>
        <div className="text-5xl font-bold">
          {score}<span className="text-gray-400 text-2xl">/100</span>
        </div>

        <div className={`mt-2 font-semibold ${getColor(confidence)}`}>
          {confidence} confidence
        </div>

        <div className="text-sm text-gray-500">
          Coverage: {coveragePercent}%
        </div>

        <div className="flex gap-4 mt-3 text-sm font-medium">
          <span>Critical: {c.critical}</span>
          <span>High: {c.high}</span>
          <span>Medium: {c.medium}</span>
          <span>Low: {c.low}</span>
        </div>
      </div>
    </div>
  );
}

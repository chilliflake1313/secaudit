function calculateConfidence(toolResults = []) {
  if (!toolResults.length) return "low";

  const valid = toolResults.filter(
    (r) => r && ["done", "failed"].includes(r.status)
  );

  if (!valid.length) return "low";

  const success =
    valid.filter((r) => r.status === "done").length / valid.length;

  if (success >= 0.8) return "high";
  if (success >= 0.5) return "medium";
  return "low";
}

module.exports = { calculateConfidence };

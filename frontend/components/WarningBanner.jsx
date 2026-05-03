export default function WarningBanner({ warnings = [] }) {
  const visibleWarnings = warnings.filter(Boolean);

  if (!visibleWarnings.length) return null;

  return (
    <div className="mb-6 border border-orange-300 bg-orange-50 text-orange-800 px-5 py-3 rounded">
      <strong>Warning:</strong> {visibleWarnings.join(" • ")}
    </div>
  );
}

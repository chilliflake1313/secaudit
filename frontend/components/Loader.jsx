export default function Loader({ label = "Running scan" }) {
  const steps = ["Fetching repo", "Checking dependencies", "Running security checks"];

  return (
    <div className="flex flex-col items-center justify-center mt-24 gap-6">
      <div className="text-sm font-medium">{label}</div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

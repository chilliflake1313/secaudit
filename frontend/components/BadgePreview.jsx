"use client";

import { useEffect, useState } from "react";

export default function BadgePreview({ scanId, score, confidence }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const url = `${origin}/scan/${scanId}`;
  const badge = `${origin}/api/badge/${scanId}`;

  const markdown = `[![Security Score](${badge})](${url})`;

  return (
    <div className="border p-5 rounded mt-6">
      <div className="font-semibold mb-2">Badge</div>

      <div className="text-lg font-bold">
        {score}/100 {confidence !== "high" ? `(${confidence})` : ""}
      </div>

      <textarea
        readOnly
        value={markdown}
        className="mt-3 w-full border p-2 text-xs"
      />
    </div>
  );
}

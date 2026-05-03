"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getScan } from "../../../lib/api";

import Loader from "../../../components/Loader";
import ScoreCard from "../../../components/ScoreCard";
import IssueList from "../../../components/IssueList";
import WarningBanner from "../../../components/WarningBanner";
import BadgePreview from "../../../components/BadgePreview";

export default function ScanPage() {
  const { id } = useParams();

  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let interval;

    async function poll() {
      try {
        const data = await getScan(id);
        setScan(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        setError(err.message || "Failed to load scan");
        clearInterval(interval);
      }
    }

    poll();
    interval = setInterval(poll, 2000);

    return () => clearInterval(interval);
  }, [id]);

  if (error && !scan) {
    return (
      <main className="p-10">
        <div className="rounded border border-red-300 bg-red-50 p-6">
          <div className="font-semibold">Error</div>
          <div className="mt-2 text-sm">{error}</div>
        </div>
      </main>
    );
  }

  if (!scan || (scan.status !== "completed" && scan.status !== "failed")) {
    return (
      <main className="p-10">
        <Loader label={scan?.status || "Starting scan"} />
      </main>
    );
  }

  if (scan.status === "failed") {
    return (
      <main className="p-10">
        <div className="rounded border border-red-300 bg-red-50 p-6">
          <div className="font-semibold">Scan Failed</div>
          <div className="mt-2 text-sm">{scan.error || "Scan could not complete"}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <WarningBanner warnings={scan.warnings || []} />

      <ScoreCard
        score={scan.score}
        confidence={scan.confidence}
        coveragePercent={scan.coverage_percent}
        issues={scan.issues}
      />

      <div className="mt-6">
        <IssueList issues={scan.issues} />
      </div>

      <BadgePreview
        scanId={id}
        score={scan.score}
        confidence={scan.confidence}
      />
    </main>
  );
}

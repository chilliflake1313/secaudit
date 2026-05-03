"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createScan } from "../lib/api";

export default function Home() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;

    setLoading(true);

    try {
      const res = await createScan(value);
      router.push(`/scan/${res.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border px-4 py-2"
          placeholder="Enter URL"
        />
        <button className="bg-black text-white px-4">
          {loading ? "..." : "Scan"}
        </button>
      </form>
    </main>
  );
}

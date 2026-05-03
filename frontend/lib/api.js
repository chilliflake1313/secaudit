const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE) {
  throw new Error("API URL missing");
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function createScan(target) {
  return request("/api/scans", {
    method: "POST",
    body: JSON.stringify({ target })
  });
}

export async function getScan(id) {
  return request(`/api/scans/${id}`);
}

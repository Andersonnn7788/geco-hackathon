export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchSpaces() {
  const res = await fetch(`${API_BASE_URL}/spaces`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch spaces");
  }
  return res.json();
}
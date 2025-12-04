// frontend/src/lib/api.ts

// Base URL for backend API.
// In Docker Compose we pass NEXT_PUBLIC_API_BASE_URL=http://backend:8000
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

export async function fetchSpaces() {
  try {
    console.log("Calling backend at:", `${API_BASE_URL}/spaces`);

    const res = await fetch(`${API_BASE_URL}/spaces`, { cache: "no-store" });

    if (!res.ok) {
      console.error(
        "Backend returned non-OK status:",
        res.status,
        res.statusText
      );
      return []; // don't crash the page, just show empty list
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return []; // avoid Next.js 500 by not throwing
  }
}
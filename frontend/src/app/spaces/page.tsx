"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchSpaces, Space } from "@/lib/api";
import { SpaceCard } from "@/components/SpaceCard";
import { PageLoader } from "@/components/LoadingSpinner";

const spaceTypes = [
  { value: "", label: "All Types" },
  { value: "hot_desk", label: "Hot Desk" },
  { value: "private_office", label: "Private Office" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "event_space", label: "Event Space" },
  { value: "phone_booth", label: "Phone Booth" },
];

const locations = [
  { value: "", label: "All Locations" },
  { value: "KL Eco City", label: "KL Eco City" },
  { value: "Bangsar South", label: "Bangsar South" },
];

function SpacesContent() {
  const searchParams = useSearchParams();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    const loadSpaces = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSpaces({
          type: type || undefined,
          location: location || undefined,
        });
        setSpaces(data);
      } catch (error) {
        console.error("Failed to load spaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpaces();
  }, [type, location]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Available Spaces</h1>
        <p className="text-[var(--muted)]">
          Find and book the perfect workspace for your needs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input w-auto min-w-[160px]"
        >
          {spaceTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input w-auto min-w-[160px]"
        >
          {locations.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <PageLoader />
      ) : spaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)]">No spaces found matching your criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SpacesPage() {
  return (
    <main className="py-8">
      <div className="container">
        <Suspense fallback={<PageLoader />}>
          <SpacesContent />
        </Suspense>
      </div>
    </main>
  );
}

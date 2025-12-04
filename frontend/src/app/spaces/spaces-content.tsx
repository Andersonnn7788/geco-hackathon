"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchSpaces, Space } from "@/lib/api";
import { SpaceCard } from "@/components/SpaceCard";
import { PageLoader } from "@/components/LoadingSpinner";
import { MapPin, Building2, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const spaceTypes = [
  { value: "", label: "All Types", emoji: "🏢" },
  { value: "hot_desk", label: "Hot Desk", emoji: "💻" },
  { value: "private_office", label: "Private Office", emoji: "🚪" },
  { value: "meeting_room", label: "Meeting Room", emoji: "🤝" },
  { value: "event_space", label: "Event Space", emoji: "🎉" },
  { value: "phone_booth", label: "Phone Booth", emoji: "📞" },
];

const locations = [
  { value: "", label: "All Locations" },
  { value: "KL Eco City", label: "KL Eco City" },
  { value: "Bangsar South", label: "Bangsar South" },
];

export function SpacesContent() {
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

  const clearFilters = () => {
    setType("");
    setLocation("");
  };

  const hasActiveFilters = type || location;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-slate-900">
          Discover Your <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Workspace</span>
        </h1>
        <p className="text-lg text-slate-600">
          Find and book the perfect space for your needs
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8 space-y-4">
        {/* Type Filters */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 block">Space Type</label>
          <div className="flex flex-wrap gap-2">
            {spaceTypes.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2",
                  type === opt.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <span className="text-base">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location & Clear Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 cursor-pointer hover:border-slate-300 transition-all"
            >
              {locations.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-slate-600"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500">Active filters:</span>
            {type && (
              <Badge variant="blue" className="pl-2 pr-1 py-1">
                {spaceTypes.find(t => t.value === type)?.label}
                <button
                  onClick={() => setType("")}
                  className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {location && (
              <Badge variant="green" className="pl-2 pr-1 py-1">
                {location}
                <button
                  onClick={() => setLocation("")}
                  className="ml-1.5 hover:bg-emerald-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <PageLoader />
      ) : spaces.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900">No spaces found</h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your filters to find available spaces
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{spaces.length}</span> {spaces.length === 1 ? "space" : "spaces"}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


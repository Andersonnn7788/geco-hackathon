"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSpace, updateSpace, Space, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";

const spaceTypes = [
  { value: "hot_desk", label: "Hot Desk" },
  { value: "private_office", label: "Private Office" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "event_space", label: "Event Space" },
  { value: "phone_booth", label: "Phone Booth" },
];

const availableAmenities = [
  "wifi",
  "air_conditioning",
  "whiteboard",
  "tv_screen",
  "video_conferencing",
  "projector",
  "phone_booth",
  "standing_desk",
  "locker",
  "printing",
  "catering",
  "sound_system",
];

export default function EditSpacePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const spaceId = Number(params.id);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const loadSpace = async () => {
      if (!isAdmin) return;
      
      try {
        const data = await getSpace(spaceId);
        setSpace(data);
      } catch (error) {
        console.error("Failed to load space:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadSpace();
    }
  }, [isAdmin, spaceId]);

  if (authLoading || !isAuthenticated || !isAdmin || isLoading) {
    return <PageLoader />;
  }

  if (!space) {
    return (
      <main className="py-8">
        <div className="container text-center">
          <p className="text-[var(--muted)]">Space not found</p>
        </div>
      </main>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSpace((prev) =>
      prev
        ? {
            ...prev,
            [name]: name.includes("price") || name === "capacity" ? Number(value) : value,
          }
        : prev
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSpace((prev) =>
      prev
        ? {
            ...prev,
            amenities: prev.amenities.includes(amenity)
              ? prev.amenities.filter((a) => a !== amenity)
              : [...prev.amenities, amenity],
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space) return;

    setError("");
    setIsSubmitting(true);

    try {
      await updateSpace(spaceId, {
        name: space.name,
        type: space.type,
        description: space.description,
        capacity: space.capacity,
        price_per_hour: space.price_per_hour,
        price_per_day: space.price_per_day,
        price_per_month: space.price_per_month,
        location: space.location,
        floor: space.floor,
        amenities: space.amenities,
        image_url: space.image_url,
        is_active: space.is_active,
      });
      router.push("/admin/spaces");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update space");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="py-8">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Admin
            </Link>
            <span className="text-[var(--muted)]">/</span>
            <Link href="/admin/spaces" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Spaces
            </Link>
            <span className="text-[var(--muted)]">/</span>
            <span>Edit</span>
          </div>
          <h1 className="text-2xl font-semibold">Edit Space</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="card space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                name="name"
                value={space.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  name="type"
                  value={space.type}
                  onChange={handleChange}
                  className="input"
                >
                  {spaceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={space.capacity}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                name="description"
                value={space.description || ""}
                onChange={handleChange}
                className="input min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={space.is_active}
                onChange={(e) =>
                  setSpace((prev) => (prev ? { ...prev, is_active: e.target.checked } : prev))
                }
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Active (visible to users)
              </label>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold">Location</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <select
                  name="location"
                  value={space.location}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="KL Eco City">KL Eco City</option>
                  <option value="Bangsar South">Bangsar South</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Floor</label>
                <input
                  type="text"
                  name="floor"
                  value={space.floor || ""}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold">Pricing (RM)</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Per Hour</label>
                <input
                  type="number"
                  name="price_per_hour"
                  value={space.price_per_hour}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Per Day</label>
                <input
                  type="number"
                  name="price_per_day"
                  value={space.price_per_day || ""}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Per Month</label>
                <input
                  type="number"
                  name="price_per_month"
                  value={space.price_per_month || ""}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    space.amenities.includes(amenity)
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-white border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  {amenity.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Save Changes"}
            </button>
            <Link href="/admin/spaces" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}



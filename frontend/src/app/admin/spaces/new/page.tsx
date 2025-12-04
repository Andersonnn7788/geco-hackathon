"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSpace, ApiError } from "@/lib/api";
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

export default function NewSpacePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "hot_desk",
    description: "",
    capacity: 1,
    price_per_hour: 0,
    price_per_day: 0,
    price_per_month: 0,
    location: "KL Eco City",
    floor: "",
    amenities: [] as string[],
    image_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <PageLoader />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") || name === "capacity" ? Number(value) : value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createSpace({
        ...formData,
        price_per_day: formData.price_per_day || null,
        price_per_month: formData.price_per_month || null,
        floor: formData.floor || null,
        image_url: formData.image_url || null,
        description: formData.description || null,
      });
      router.push("/admin/spaces");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create space");
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
            <span>New</span>
          </div>
          <h1 className="text-2xl font-semibold">Add New Space</h1>
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
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Private Office A1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  name="type"
                  value={formData.type}
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
                  value={formData.capacity}
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
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Describe the space..."
              />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold">Location</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <select
                  name="location"
                  value={formData.location}
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
                  value={formData.floor}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Level 15"
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
                  value={formData.price_per_hour}
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
                  value={formData.price_per_day}
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
                  value={formData.price_per_month}
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
                    formData.amenities.includes(amenity)
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
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Create Space"}
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


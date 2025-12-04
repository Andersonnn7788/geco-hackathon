"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpace, getSpaceAvailability, createBooking, Space, SpaceAvailability, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";

const typeLabels: Record<string, string> = {
  hot_desk: "Hot Desk",
  private_office: "Private Office",
  meeting_room: "Meeting Room",
  event_space: "Event Space",
  phone_booth: "Phone Booth",
};

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [availability, setAvailability] = useState<SpaceAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const spaceId = Number(params.id);

  useEffect(() => {
    const loadSpace = async () => {
      try {
        const data = await getSpace(spaceId);
        setSpace(data);
      } catch (error) {
        console.error("Failed to load space:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpace();
  }, [spaceId]);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const data = await getSpaceAvailability(spaceId, selectedDate);
        setAvailability(data);
        setSelectedSlots([]);
      } catch (error) {
        console.error("Failed to load availability:", error);
      }
    };

    if (selectedDate) {
      loadAvailability();
    }
  }, [spaceId, selectedDate]);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    );
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (selectedSlots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

    setError("");
    setSuccess("");
    setIsBooking(true);

    try {
      // Get start and end times from selected slots
      const sortedSlots = [...selectedSlots].sort();
      const startTime = `${selectedDate}T${sortedSlots[0]}:00`;
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      const endHour = parseInt(lastSlot.split(":")[0]) + 1;
      const endTime = `${selectedDate}T${endHour.toString().padStart(2, "0")}:00:00`;

      await createBooking({
        space_id: spaceId,
        start_time: startTime,
        end_time: endTime,
      });

      setSuccess("Booking confirmed! Redirecting to your bookings...");
      setSelectedSlots([]);
      
      // Refresh availability
      const data = await getSpaceAvailability(spaceId, selectedDate);
      setAvailability(data);

      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create booking");
      }
    } finally {
      setIsBooking(false);
    }
  };

  const calculateTotal = () => {
    if (!space || selectedSlots.length === 0) return 0;
    return selectedSlots.length * space.price_per_hour;
  };

  if (isLoading) {
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

  return (
    <main className="py-8">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Space Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="badge badge-green">
                {typeLabels[space.type] || space.type}
              </span>
            </div>

            <h1 className="text-3xl font-semibold mb-2">{space.name}</h1>
            <p className="text-[var(--muted)] mb-6">{space.location} {space.floor && `- ${space.floor}`}</p>

            {space.description && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">About this space</h2>
                <p className="text-[var(--muted)]">{space.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card">
                <div className="text-sm text-[var(--muted)] mb-1">Capacity</div>
                <div className="font-semibold">{space.capacity} {space.capacity === 1 ? "person" : "people"}</div>
              </div>
              <div className="card">
                <div className="text-sm text-[var(--muted)] mb-1">Price</div>
                <div className="font-semibold text-[var(--accent)]">RM{space.price_per_hour}/hour</div>
              </div>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {space.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1.5 bg-[var(--background)] rounded-lg text-sm"
                    >
                      {amenity.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {space.price_per_day && (
              <div className="card mb-6">
                <h3 className="font-semibold mb-2">Other Pricing</h3>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[var(--muted)]">Per Day: </span>
                    <span className="font-medium">RM{space.price_per_day}</span>
                  </div>
                  {space.price_per_month && (
                    <div>
                      <span className="text-[var(--muted)]">Per Month: </span>
                      <span className="font-medium">RM{space.price_per_month}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="font-semibold mb-4">Book this space</h2>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200 mb-4">
                  {success}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                {availability ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availability.available_slots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => slot.available && toggleSlot(slot.start)}
                        disabled={!slot.available}
                        className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                          selectedSlots.includes(slot.start)
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : slot.available
                            ? "bg-white border-[var(--border)] hover:border-[var(--primary)]"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              {selectedSlots.length > 0 && (
                <div className="border-t border-[var(--border)] pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--muted)]">Duration</span>
                    <span>{selectedSlots.length} hour(s)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[var(--accent)]">RM{calculateTotal()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={isBooking || selectedSlots.length === 0}
                className="btn btn-accent w-full"
              >
                {isBooking ? (
                  <LoadingSpinner size="sm" />
                ) : isAuthenticated ? (
                  "Confirm Booking"
                ) : (
                  "Sign in to Book"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


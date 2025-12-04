"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpace, getSpaceAvailability, createBooking, Space, SpaceAvailability, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";
import { MapPin, Users, Clock, Wifi, Coffee, Monitor, Calendar, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  hot_desk: "Hot Desk",
  private_office: "Private Office",
  meeting_room: "Meeting Room",
  event_space: "Event Space",
  phone_booth: "Phone Booth",
};

const typeBadges: Record<string, "blue" | "green" | "orange" | "purple"> = {
  hot_desk: "blue",
  private_office: "green",
  meeting_room: "orange",
  event_space: "purple",
  phone_booth: "blue",
};

const typeImages: Record<string, string> = {
  hot_desk: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&q=80",
  private_office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=600&fit=crop&q=80",
  meeting_room: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&h=600&fit=crop&q=80",
  event_space: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&q=80",
  phone_booth: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=600&fit=crop&q=80",
};

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  high_speed_wifi: Wifi,
  coffee: Coffee,
  whiteboard: Monitor,
  projector: Monitor,
  video_conferencing: Monitor,
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
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Space not found</h1>
          <p className="text-slate-600 mb-6">
            The space you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/spaces">Browse All Spaces</Link>
          </Button>
        </div>
      </main>
    );
  }

  const badgeVariant = typeBadges[space.type] || "blue";
  const imageUrl = space.image_url || typeImages[space.type] || typeImages.hot_desk;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] bg-slate-900">
        <img
          src={imageUrl}
          alt={space.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-0 right-0">
          <div className="container mx-auto px-4 max-w-7xl">
            <Button asChild variant="secondary" size="sm">
              <Link href="/spaces">
                <ArrowLeft className="w-4 h-4" />
                Back to Spaces
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative -mt-24 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Space Info */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-xl">
              {/* Header */}
              <div className="mb-6">
                <Badge variant={badgeVariant} className="mb-4">
                  {typeLabels[space.type] || space.type}
                </Badge>
                <h1 className="text-4xl font-bold mb-2 text-slate-900">{space.name}</h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{space.location}</span>
                  {space.floor && <span className="text-slate-400">• {space.floor}</span>}
                </div>
              </div>

              {/* Description */}
              {space.description && (
                <div className="mb-8">
                  <h2 className="font-semibold text-lg mb-3 text-slate-900">About this space</h2>
                  <p className="text-slate-600 leading-relaxed">
                    {space.description}
                  </p>
                </div>
              )}

              {/* Key Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-blue-50 border-blue-100">
                  <Users className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-sm text-slate-600">Capacity</div>
                  <div className="font-semibold text-slate-900">{space.capacity} {space.capacity === 1 ? "person" : "people"}</div>
                </Card>
                <Card className="p-4 bg-emerald-50 border-emerald-100">
                  <Clock className="w-5 h-5 text-emerald-600 mb-2" />
                  <div className="text-sm text-slate-600">Hourly Rate</div>
                  <div className="font-semibold text-emerald-600">RM{space.price_per_hour}</div>
                </Card>
                {space.price_per_day && (
                  <Card className="p-4 bg-orange-50 border-orange-100">
                    <Calendar className="w-5 h-5 text-orange-600 mb-2" />
                    <div className="text-sm text-slate-600">Daily Rate</div>
                    <div className="font-semibold text-slate-900">RM{space.price_per_day}</div>
                  </Card>
                )}
                {space.price_per_month && (
                  <Card className="p-4 bg-purple-50 border-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-sm text-slate-600">Monthly</div>
                    <div className="font-semibold text-slate-900">RM{space.price_per_month}</div>
                  </Card>
                )}
              </div>

              {/* Amenities */}
              {space.amenities && space.amenities.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4 text-slate-900">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {space.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
                      return (
                        <div
                          key={amenity}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm capitalize text-slate-700">{amenity.replace(/_/g, " ")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 shadow-xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Book this space</CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {success}
                  </div>
                )}

                {/* Date Picker */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-700">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>

                {/* Time Slots */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3 text-slate-700">Available Time Slots</label>
                  {availability ? (
                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
                      {availability.available_slots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => slot.available && toggleSlot(slot.start)}
                          disabled={!slot.available}
                          className={cn(
                            "px-2 py-2.5 text-xs font-medium rounded-lg border-2 transition-all",
                            selectedSlots.includes(slot.start)
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : slot.available
                              ? "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                              : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                          )}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {/* Summary */}
                {selectedSlots.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-medium text-slate-900">{selectedSlots.length} hour(s)</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Rate</span>
                      <span className="font-medium text-slate-900">RM{space.price_per_hour}/hour</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold mt-3 pt-3 border-t border-slate-200">
                      <span className="text-slate-900">Total</span>
                      <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">RM{calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={isBooking || selectedSlots.length === 0}
                  className="w-full py-6"
                  size="lg"
                >
                  {isBooking ? (
                    <LoadingSpinner size="sm" />
                  ) : isAuthenticated ? (
                    "Confirm Booking"
                  ) : (
                    "Sign in to Book"
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    You need to sign in to make a booking
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

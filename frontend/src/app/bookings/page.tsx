"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyBookings, cancelBooking, Booking, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";
import { Calendar, Clock, MapPin, X, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, "blue" | "orange" | "secondary" | "destructive"> = {
  confirmed: "blue",
  pending: "orange",
  cancelled: "secondary",
  completed: "blue",
};

const typeImages: Record<string, string> = {
  hot_desk: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop&q=80",
  private_office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=150&fit=crop&q=80",
  meeting_room: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=200&h=150&fit=crop&q=80",
  event_space: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=150&fit=crop&q=80",
  phone_booth: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=150&fit=crop&q=80",
};

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming">("upcoming");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const data = await getMyBookings({
          upcoming_only: filter === "upcoming",
        });
        setBookings(data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated, filter]);

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-MY", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-900">
              My <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Bookings</span>
            </h1>
            <p className="text-slate-600">
              View and manage your workspace reservations
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/spaces">
              <Plus className="w-4 h-4" />
              Book a Space
            </Link>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setFilter("upcoming")}
            variant={filter === "upcoming" ? "default" : "outline"}
          >
            Upcoming
          </Button>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
          >
            All Bookings
          </Button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">
              {filter === "upcoming" ? "No upcoming bookings" : "No bookings found"}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === "upcoming"
                ? "You don't have any upcoming reservations"
                : "You haven't made any bookings yet"}
            </p>
            <Button asChild>
              <Link href="/spaces">Browse Spaces</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const start = formatDateTime(booking.start_time);
              const end = formatDateTime(booking.end_time);
              const isPast = new Date(booking.end_time) < new Date();
              const canCancel = booking.status === "confirmed" && !isPast;
              const spaceType = booking.space?.type || "hot_desk";
              const imageUrl = booking.space?.image_url || typeImages[spaceType] || typeImages.hot_desk;

              return (
                <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Image */}
                    <div className="relative w-full md:w-40 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={booking.space?.name || "Space"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant={statusConfig[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            {isPast && booking.status !== "cancelled" && (
                              <Badge variant="secondary">Past</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {booking.space?.name || `Space #${booking.space_id}`}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="w-4 h-4" />
                            {booking.space?.location}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                            RM{booking.total_price}
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{start.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{start.time} - {end.time}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {canCancel && (
                        <Button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          variant="destructive"
                          size="sm"
                        >
                          {cancellingId === booking.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Cancel Booking
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

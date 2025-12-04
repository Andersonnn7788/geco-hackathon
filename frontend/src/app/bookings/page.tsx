"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyBookings, cancelBooking, Booking, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";

const statusColors: Record<string, string> = {
  confirmed: "status-confirmed",
  pending: "status-pending",
  cancelled: "status-cancelled",
  completed: "status-completed",
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
    <main className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">My Bookings</h1>
            <p className="text-[var(--muted)]">View and manage your workspace bookings</p>
          </div>
          <Link href="/spaces" className="btn btn-primary">
            Book a Space
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("upcoming")}
            className={`btn ${filter === "upcoming" ? "btn-primary" : "btn-outline"}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline"}`}
          >
            All Bookings
          </button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)] mb-4">
              {filter === "upcoming"
                ? "No upcoming bookings"
                : "No bookings found"}
            </p>
            <Link href="/spaces" className="btn btn-accent">
              Browse Spaces
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const start = formatDateTime(booking.start_time);
              const end = formatDateTime(booking.end_time);
              const isPast = new Date(booking.end_time) < new Date();
              const canCancel = booking.status === "confirmed" && !isPast;

              return (
                <div key={booking.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                        {isPast && booking.status !== "cancelled" && (
                          <span className="badge badge-gray">Past</span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">
                        {booking.space?.name || `Space #${booking.space_id}`}
                      </h3>
                      
                      <p className="text-sm text-[var(--muted)] mb-2">
                        {booking.space?.location}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-[var(--muted)]">Date: </span>
                          <span className="font-medium">{start.date}</span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Time: </span>
                          <span className="font-medium">
                            {start.time} - {end.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-[var(--accent)] mb-2">
                        RM{booking.total_price}
                      </div>
                      
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="btn btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {cancellingId === booking.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}


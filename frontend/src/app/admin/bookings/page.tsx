"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllBookings, Booking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";

const statusColors: Record<string, string> = {
  confirmed: "status-confirmed",
  pending: "status-pending",
  cancelled: "status-cancelled",
  completed: "status-completed",
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

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
    const loadBookings = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        const data = await getAllBookings({
          status: statusFilter || undefined,
        });
        setBookings(data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadBookings();
    }
  }, [isAdmin, statusFilter]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-MY", {
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

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <PageLoader />;
  }

  return (
    <main className="py-8">
      <div className="container">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--foreground)]">
              Admin
            </Link>
            <span className="text-[var(--muted)]">/</span>
            <span>Bookings</span>
          </div>
          <h1 className="text-2xl font-semibold">All Bookings</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">No bookings found</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Space</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const start = formatDateTime(booking.start_time);
                  const end = formatDateTime(booking.end_time);

                  return (
                    <tr key={booking.id}>
                      <td className="font-mono text-sm">#{booking.id}</td>
                      <td>
                        <div className="font-medium">
                          {booking.space?.name || `Space #${booking.space_id}`}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {booking.space?.location}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">
                          {booking.user?.full_name || `User #${booking.user_id}`}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {booking.user?.email}
                        </div>
                      </td>
                      <td>{start.date}</td>
                      <td>
                        {start.time} - {end.time}
                      </td>
                      <td className="font-medium">RM{booking.total_price}</td>
                      <td>
                        <span className={`badge ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}



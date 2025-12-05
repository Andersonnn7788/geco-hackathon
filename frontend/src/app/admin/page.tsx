"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const loadStats = async () => {
      if (!isAdmin) return;
      
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <PageLoader />;
  }

  return (
    <main className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-[var(--muted)]">Manage spaces, bookings, and users</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <PageLoader />
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-sm text-[var(--muted)] mb-1">Total Spaces</div>
              <div className="text-2xl font-semibold">{stats.total_spaces}</div>
            </div>
            <div className="card">
              <div className="text-sm text-[var(--muted)] mb-1">Total Users</div>
              <div className="text-2xl font-semibold">{stats.total_users}</div>
            </div>
            <div className="card">
              <div className="text-sm text-[var(--muted)] mb-1">Bookings Today</div>
              <div className="text-2xl font-semibold">{stats.bookings_today}</div>
            </div>
            <div className="card">
              <div className="text-sm text-[var(--muted)] mb-1">Revenue (Month)</div>
              <div className="text-2xl font-semibold text-[var(--accent)]">
                RM{stats.revenue_this_month.toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/spaces" className="card card-hover">
            <h3 className="font-semibold mb-1">Manage Spaces</h3>
            <p className="text-sm text-[var(--muted)]">
              Add, edit, or remove coworking spaces
            </p>
          </Link>
          <Link href="/admin/bookings" className="card card-hover">
            <h3 className="font-semibold mb-1">View Bookings</h3>
            <p className="text-sm text-[var(--muted)]">
              See all bookings and manage reservations
            </p>
          </Link>
          <Link href="/admin/users" className="card card-hover">
            <h3 className="font-semibold mb-1">Manage Users</h3>
            <p className="text-sm text-[var(--muted)]">
              View user accounts and update roles
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}



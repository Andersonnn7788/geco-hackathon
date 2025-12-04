"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <nav className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Infinity8
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/spaces"
              className={`text-sm ${
                isActive("/spaces") ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Spaces
            </Link>
            {isAuthenticated && (
              <Link
                href="/bookings"
                className={`text-sm ${
                  isActive("/bookings") ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm ${
                  pathname.startsWith("/admin") ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-[var(--muted)] hidden sm:block">
                {user?.full_name}
              </span>
              <button onClick={logout} className="btn btn-outline text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}


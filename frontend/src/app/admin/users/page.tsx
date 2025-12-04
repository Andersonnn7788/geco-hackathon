"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllUsers, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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
    const loadUsers = async () => {
      if (!isAdmin) return;
      
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <span>Users</span>
          </div>
          <h1 className="text-2xl font-semibold">All Users</h1>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">No users found</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-mono text-sm">#{user.id}</td>
                    <td className="font-medium">{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === "admin" ? "badge-blue" : "badge-gray"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? "badge-green" : "badge-red"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}


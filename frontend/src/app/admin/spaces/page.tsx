"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchSpaces, deleteSpace, Space, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader, LoadingSpinner } from "@/components/LoadingSpinner";

const typeLabels: Record<string, string> = {
  hot_desk: "Hot Desk",
  private_office: "Private Office",
  meeting_room: "Meeting Room",
  event_space: "Event Space",
  phone_booth: "Phone Booth",
};

export default function AdminSpacesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    const loadSpaces = async () => {
      if (!isAdmin) return;
      
      try {
        const data = await fetchSpaces();
        setSpaces(data);
      } catch (error) {
        console.error("Failed to load spaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadSpaces();
    }
  }, [isAdmin]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this space?")) return;

    setDeletingId(id);
    try {
      await deleteSpace(id);
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <PageLoader />;
  }

  return (
    <main className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                Admin
              </Link>
              <span className="text-[var(--muted)]">/</span>
              <span>Spaces</span>
            </div>
            <h1 className="text-2xl font-semibold">Manage Spaces</h1>
          </div>
          <Link href="/admin/spaces/new" className="btn btn-primary">
            Add Space
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : spaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)] mb-4">No spaces found</p>
            <Link href="/admin/spaces/new" className="btn btn-accent">
              Add Your First Space
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Price/Hour</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {spaces.map((space) => (
                  <tr key={space.id}>
                    <td className="font-medium">{space.name}</td>
                    <td>{typeLabels[space.type] || space.type}</td>
                    <td>{space.location}</td>
                    <td>{space.capacity}</td>
                    <td>RM{space.price_per_hour}</td>
                    <td>
                      <span className={`badge ${space.is_active ? "badge-green" : "badge-gray"}`}>
                        {space.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/spaces/${space.id}/edit`}
                          className="btn btn-outline text-sm py-1 px-3"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(space.id)}
                          disabled={deletingId === space.id}
                          className="btn btn-outline text-sm py-1 px-3 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {deletingId === space.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </td>
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



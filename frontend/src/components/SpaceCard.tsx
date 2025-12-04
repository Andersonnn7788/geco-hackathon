import Link from "next/link";
import { Space } from "@/lib/api";

interface SpaceCardProps {
  space: Space;
}

const typeLabels: Record<string, string> = {
  hot_desk: "Hot Desk",
  private_office: "Private Office",
  meeting_room: "Meeting Room",
  event_space: "Event Space",
  phone_booth: "Phone Booth",
};

const typeColors: Record<string, string> = {
  hot_desk: "badge-blue",
  private_office: "badge-green",
  meeting_room: "badge-yellow",
  event_space: "badge-red",
  phone_booth: "badge-gray",
};

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <div className="card card-hover cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${typeColors[space.type] || "badge-gray"}`}>
            {typeLabels[space.type] || space.type}
          </span>
          <span className="text-sm text-[var(--muted)]">{space.location}</span>
        </div>

        <h3 className="text-lg font-semibold mb-2">{space.name}</h3>

        {space.description && (
          <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
            {space.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
          <div className="text-sm">
            <span className="text-[var(--muted)]">Capacity: </span>
            <span className="font-medium">{space.capacity} {space.capacity === 1 ? "person" : "people"}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-[var(--accent)]">
              RM{space.price_per_hour}
            </div>
            <div className="text-xs text-[var(--muted)]">per hour</div>
          </div>
        </div>

        {space.amenities && space.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {space.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="text-xs px-2 py-0.5 bg-[var(--background)] rounded text-[var(--muted)]"
              >
                {amenity.replace(/_/g, " ")}
              </span>
            ))}
            {space.amenities.length > 4 && (
              <span className="text-xs px-2 py-0.5 text-[var(--muted)]">
                +{space.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}


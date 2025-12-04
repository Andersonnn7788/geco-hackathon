import Link from "next/link";
import { Space } from "@/lib/api";
import { Users, MapPin, Building2, Monitor, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const typeBadges: Record<string, "blue" | "green" | "orange" | "purple"> = {
  hot_desk: "blue",
  private_office: "green",
  meeting_room: "orange",
  event_space: "purple",
  phone_booth: "blue",
};

const typeIcons: Record<string, typeof Monitor> = {
  hot_desk: Monitor,
  private_office: Building2,
  meeting_room: Users,
  event_space: Users,
  phone_booth: Phone,
};

// Placeholder images for different space types
const typeImages: Record<string, string> = {
  hot_desk: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&q=80",
  private_office: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop&q=80",
  meeting_room: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&h=400&fit=crop&q=80",
  event_space: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80",
  phone_booth: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop&q=80",
};

export function SpaceCard({ space }: SpaceCardProps) {
  const Icon = typeIcons[space.type] || Building2;
  const badgeVariant = typeBadges[space.type] || "blue";
  const imageUrl = space.image_url || typeImages[space.type] || typeImages.hot_desk;

  return (
    <Link href={`/spaces/${space.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={space.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant={badgeVariant} className="shadow-lg">
              <Icon className="w-3.5 h-3.5 mr-1" />
              {typeLabels[space.type] || space.type}
            </Badge>
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="text-lg font-bold text-slate-900">RM{space.price_per_hour}</div>
              <div className="text-xs text-slate-500">per hour</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
            {space.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{space.location}</span>
          </div>

          {space.description && (
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {space.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>{space.capacity} {space.capacity === 1 ? "person" : "people"}</span>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div className="text-xs text-slate-500">
                {space.amenities.length} amenities
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

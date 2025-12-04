import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="border-b border-[var(--border)]">
        <div className="container py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Your workspace,
              <br />
              <span className="text-[var(--accent)]">your way</span>
            </h1>
            <p className="text-lg text-[var(--muted)] mb-8">
              Flexible coworking spaces across Malaysia. Book a hot desk for a day,
              a private office for your team, or a meeting room for your next big pitch.
            </p>
            <div className="flex gap-4">
              <Link href="/spaces" className="btn btn-primary">
                Browse Spaces
              </Link>
              <Link href="/register" className="btn btn-outline">
                Join Infinity8
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-8">Why Infinity8</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="font-semibold mb-2">Flexible Booking</h3>
              <p className="text-sm text-[var(--muted)]">
                Book by the hour, day, or month. No long-term commitments required.
                Cancel anytime with full flexibility.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Prime Locations</h3>
              <p className="text-sm text-[var(--muted)]">
                Strategic locations in KL Eco City and Bangsar South.
                Easy access to public transport and amenities.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">All-Inclusive</h3>
              <p className="text-sm text-[var(--muted)]">
                High-speed WiFi, printing, meeting rooms, and pantry access
                included in all memberships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Space Types */}
      <section className="py-16 bg-white border-y border-[var(--border)]">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-8">Space Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/spaces?type=hot_desk" className="card card-hover">
              <h3 className="font-semibold mb-1">Hot Desk</h3>
              <p className="text-sm text-[var(--muted)] mb-3">
                Flexible seating in our open workspace
              </p>
              <p className="text-[var(--accent)] font-medium">From RM15/hour</p>
            </Link>
            <Link href="/spaces?type=private_office" className="card card-hover">
              <h3 className="font-semibold mb-1">Private Office</h3>
              <p className="text-sm text-[var(--muted)] mb-3">
                Dedicated space for your team
              </p>
              <p className="text-[var(--accent)] font-medium">From RM50/hour</p>
            </Link>
            <Link href="/spaces?type=meeting_room" className="card card-hover">
              <h3 className="font-semibold mb-1">Meeting Room</h3>
              <p className="text-sm text-[var(--muted)] mb-3">
                Professional spaces for meetings
              </p>
              <p className="text-[var(--accent)] font-medium">From RM60/hour</p>
            </Link>
            <Link href="/spaces?type=event_space" className="card card-hover">
              <h3 className="font-semibold mb-1">Event Space</h3>
              <p className="text-sm text-[var(--muted)] mb-3">
                Host workshops and events
              </p>
              <p className="text-[var(--accent)] font-medium">From RM300/hour</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-[var(--muted)] mb-6">
            Join hundreds of professionals working at Infinity8
          </p>
          <Link href="/register" className="btn btn-accent">
            Create Your Account
          </Link>
        </div>
      </section>
    </main>
  );
}

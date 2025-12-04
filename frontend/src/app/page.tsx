import Link from "next/link";
import { ArrowRight, MapPin, Users, Building2, Clock, Wifi, Coffee, Shield, CheckCircle2, Star, Zap, Calendar, DollarSign, Smartphone, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-700">
                  Now open in Bangsar South
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900">
              Your workspace,
              <br />
                <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  reimagined
                </span>
            </h1>

              <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Premium coworking spaces in the heart of Kuala Lumpur. 
                Where innovation meets community. Book by the hour, day, or month.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button asChild size="lg" className="text-base">
                  <Link href="/spaces">
                    Explore Spaces
                    <ArrowRight className="w-5 h-5" />
              </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/register">
                    Start Free Tour
              </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No commitment</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant booking</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Premium amenities</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-12 border-t border-slate-200">
                {[
                  { value: "500+", label: "Active Members" },
                  { value: "2", label: "Prime Locations" },
                  { value: "50+", label: "Workspaces" },
                  { value: "98%", label: "Satisfaction Rate" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80"
                  alt="Modern coworking space"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating Card */}
                <div className="absolute top-6 right-6">
                  <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Instant Booking</p>
                        <p className="text-sm font-semibold">Book in seconds</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Bottom Card */}
                <div className="absolute bottom-6 left-6 right-6">
                  <Card className="p-4 bg-white/95 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">KL Eco City</p>
                          <p className="text-sm text-slate-500">20+ spaces available</p>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-emerald-400"
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="blue" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Book Your Space in <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">3 Easy Steps</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From browsing to booking, we've made it incredibly simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Building2,
                title: "Browse Spaces",
                desc: "Explore our curated selection of hot desks, private offices, meeting rooms, and event spaces across KL.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02",
                icon: Calendar,
                title: "Select Time",
                desc: "Choose your preferred date and time slots. Book for an hour, a day, or longer - complete flexibility.",
                color: "from-emerald-500 to-teal-500"
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "Instant Confirm",
                desc: "Receive instant confirmation and access details. Walk in and start working immediately.",
                color: "from-orange-500 to-amber-500"
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-shadow relative overflow-hidden">
                  <div className={`absolute top-0 right-0 text-8xl font-bold text-slate-50`}>
                    {item.step}
                  </div>
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Space Types Section - Enhanced */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="blue" className="mb-4">Our Spaces</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Find Your Perfect <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Space</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you need a quiet corner or a full event venue, we have the right space for every need
              </p>
            </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                type: "hot_desk",
                name: "Hot Desk",
                desc: "Flexible seating in our vibrant open workspace area",
                price: "15",
                features: ["WiFi 1Gbps", "Power outlets", "Printing access", "Coffee & Tea"],
                capacity: "1 person",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=500&fit=crop&q=80",
                color: "bg-blue-500",
              },
              {
                type: "private_office",
                name: "Private Office",
                desc: "Dedicated lockable office space for your team",
                price: "50",
                features: ["Private room", "4-8 people", "Whiteboard", "Meeting table"],
                capacity: "Up to 8 people",
                image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=500&fit=crop&q=80",
                color: "bg-emerald-500",
              },
              {
                type: "meeting_room",
                name: "Meeting Room",
                desc: "Professional meeting spaces with AV equipment",
                price: "60",
                features: ["TV screen", "Video conf", "Whiteboard", "Air conditioned"],
                capacity: "6-12 people",
                image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&h=500&fit=crop&q=80",
                color: "bg-orange-500",
              },
              {
                type: "event_space",
                name: "Event Space",
                desc: "Large venue perfect for workshops and seminars",
                price: "300",
                features: ["100+ capacity", "Stage setup", "Sound system", "Catering ready"],
                capacity: "Up to 100 people",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop&q=80",
                color: "bg-purple-500",
              },
            ].map((space) => (
              <Link key={space.type} href={`/spaces?type=${space.type}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all h-full">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={space.image}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <div className={`w-12 h-12 rounded-xl ${space.color} flex items-center justify-center shadow-lg`}>
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <Badge className="absolute top-4 right-4 bg-white text-slate-900">
                      <Users className="w-3 h-3 mr-1" />
                      {space.capacity}
                    </Badge>

                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <h3 className="text-xl font-bold mb-1">{space.name}</h3>
                      <p className="text-sm text-white/90 mb-3">{space.desc}</p>
                      
                      <div className="space-y-1 mb-4">
                        {space.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-white/80">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <div>
                          <span className="text-2xl font-bold">RM{space.price}</span>
                          <span className="text-white/70 text-sm ml-1">/hr</span>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/spaces">
                View All Spaces
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="green" className="mb-4">Premium Amenities</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              State-of-the-art facilities and amenities designed to maximize your productivity
              </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Wifi, 
                title: "High-Speed WiFi", 
                desc: "Lightning-fast 1Gbps fiber internet for seamless video calls and large file transfers. Backup connection ensures you're always online."
              },
              { 
                icon: Coffee, 
                title: "Complimentary Refreshments", 
                desc: "Unlimited premium coffee, tea, and filtered water. Fully stocked pantry with snacks and a modern kitchen for meal prep."
              },
              { 
                icon: Clock, 
                title: "Flexible Hours", 
                desc: "Book by the hour, day, or month with no long-term commitments. 24/7 access available for dedicated offices."
              },
              { 
                icon: Shield, 
                title: "24/7 Security", 
                desc: "Secure keycard access, CCTV monitoring, and on-site security personnel. Your safety is our top priority."
              },
              { 
                icon: MapPin, 
                title: "Prime Locations", 
                desc: "Strategic locations in KL Eco City and Bangsar South with direct MRT access and ample parking facilities."
              },
              { 
                icon: Users, 
                title: "Vibrant Community", 
                desc: "Join a diverse community of 500+ entrepreneurs, freelancers, and professionals. Regular networking events and workshops."
              },
              { 
                icon: Smartphone, 
                title: "Mobile App", 
                desc: "Book and manage your spaces on the go. Get instant access codes and track your bookings from your phone."
              },
              { 
                icon: DollarSign, 
                title: "Transparent Pricing", 
                desc: "No hidden fees or surprise charges. What you see is what you pay. Cancel anytime with full flexibility."
              },
              { 
                icon: Star, 
                title: "Dedicated Support", 
                desc: "On-site community managers and 24/7 customer support. We're here to help whenever you need us."
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-blue-600" />
            </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="purple" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Loved by <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hear what our members have to say about their Infinity8 experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Founder, TechStart Malaysia",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                quote: "Infinity8 has been instrumental in growing our startup. The flexible spaces and vibrant community have helped us scale from 2 to 15 people seamlessly.",
                rating: 5
              },
              {
                name: "Marcus Wong",
                role: "Freelance Designer",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                quote: "The hot desks are perfect for my freelance work. Great WiFi, comfortable chairs, and the coffee is actually good! Best coworking space in KL.",
                rating: 5
              },
              {
                name: "Priya Sharma",
                role: "Marketing Director",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                quote: "We use the meeting rooms regularly for client presentations. The professional setup and easy booking system save us so much time and hassle.",
                rating: 5
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-blue-100 mb-4" />
                <p className="text-slate-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Workday?
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-8">
              Join Malaysia's fastest-growing community of innovators and creators. Book your first space today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-50 text-base px-8">
                <Link href="/register">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 text-base px-8">
                <Link href="/spaces">
                  View All Spaces
          </Link>
              </Button>
            </div>
            <p className="text-white/80 text-sm">
              No credit card required • Cancel anytime • Instant confirmation
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">∞</span>
              </div>
              <span className="text-xl font-bold text-slate-900">
                Infinity<span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">8</span>
              </span>
            </div>
            <p className="text-sm text-slate-600">
              © 2024 Infinity8. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

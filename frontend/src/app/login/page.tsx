"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Mail, Lock, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Wait a moment for user data to sync
      setTimeout(() => {
        if (user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/spaces");
        }
      }, 500);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl">∞</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Infinity<span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">8</span>
          </span>
        </Link>

        <Card className="p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-slate-900">Welcome back</h1>
            <p className="text-slate-600">
              Sign in to continue to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6"
              size="lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Demo credentials info */}
          <Card className="mt-6 p-4 bg-blue-50 border-blue-100">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <span className="text-sm font-medium text-blue-900">Supabase Auth</span>
            </div>
            <p className="text-xs text-blue-700">
              Authentication is now powered by Supabase. Create a new account or sign in with your existing credentials.
            </p>
          </Card>
        </Card>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Check if email confirmation is required
      setSuccess("Account created! Please check your email to verify your account.");
      
      // Redirect to spaces after a short delay
      setTimeout(() => {
        router.push("/spaces");
      }, 2000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
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
            <h1 className="text-2xl font-bold mb-2 text-slate-900">Create your account</h1>
            <p className="text-slate-600">
              Start booking workspaces in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-100">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-emerald-600"
              size="lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-slate-700">Terms of Service</a> and{" "}
            <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>
          </p>
        </Card>
      </div>
    </main>
  );
}

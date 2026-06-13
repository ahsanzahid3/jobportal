"use client";

import { useState, Suspense } from "react";
import { useTheme } from "@/lib/theme-context";
import { Briefcase, Eye, EyeOff, Sun, Moon, Mail, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const confirmationFailed = searchParams.get("error") === "confirmation_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(
    confirmationFailed ? "Email confirmation link expired or invalid. Please sign in or request a new confirmation email." : ""
  );

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setIsLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    // Determine redirect target
    if (redirectTo) {
      window.location.href = redirectTo;
      return;
    }

    // Fetch role from profiles table
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      const rawRole = profile?.role || data.user?.user_metadata?.role || "employee";
      // Normalize legacy "candidate" role to "employee"
      const role = rawRole === "candidate" ? "employee" : rawRole;
      window.location.href = `/dashboard/${role}`;
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen hero-3d flex flex-col">
      {/* Background */}
      <div className="hero-mesh-overlay" />
      <div className="hero-grid-overlay" />
      <div className="hero-orb-3d hero-orb-3d-1" />
      <div className="hero-orb-3d hero-orb-3d-2" />
      <div className="hero-orb-3d hero-orb-3d-3" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center">
              <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
            </a>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a href="/signup" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Create account
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/50 p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your DulyHired account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Your password" required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary accent-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button type="button" onClick={async () => {
                  if (!email) { setError("Enter your email address first."); return; }
                  setIsLoading(true);
                  setError("");
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                  });
                  setIsLoading(false);
                  if (resetError) { setError(resetError.message); return; }
                  setResetSent(true);
                }} className="text-sm text-primary dark:text-primary-light hover:underline">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                Sign In
              </button>
            </form>

            {resetSent && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400">
                Password reset link sent! Check your email inbox.
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-primary dark:text-primary-light font-medium hover:underline">
                Create one free
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}


"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/i18n/context";
import {
  Briefcase,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Mail,
  Lock,
  User,
  Building2,
  Check,
  Search,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Role = "employee" | "recruiter";

export default function SignUpPage() {
  const { t } = useI18n();
  const { isDark, toggle: toggleTheme } = useTheme();
  const supabase = createClient();

  // Step 1: role selection; Step 2: form
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("employee");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !agreed) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setIsLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // After the user clicks the confirmation link, Supabase (PKCE flow)
        // delivers a ?code= param here. The route.ts handler exchanges it for
        // a real session and redirects to the correct dashboard.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name,
          role,
          company_name: role === "recruiter" ? companyName : undefined,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    // Upsert profile row (also created by DB trigger, this is belt-and-suspenders)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        role,
        full_name: name,
        email,
      }, { onConflict: "id" });

    }

    if (data.session) {
      // Email confirmation disabled — immediately logged in
      // recruiter_profiles upsert is safe here because we have a session
      if (role === "recruiter") {
        await supabase.from("recruiter_profiles").upsert({
          id: data.user!.id,
          company_name: companyName || null,
        }, { onConflict: "id" });
      }
      window.location.href = `/dashboard/${role}`;
    } else {
      // Email confirmation required — no session yet, skip recruiter_profiles upsert
      // It will be created on first dashboard load via sign-in
      setSuccess(true);
      setIsLoading(false);
    }
  };

  const employeeBenefits = [
    "Access 3,800+ real job listings worldwide",
    "Save jobs and create personalised alerts",
    "Track your applications in one place",
    "Connect your LinkedIn profile",
    "Get matched to relevant opportunities",
  ];

  const recruiterBenefits = [
    "Post jobs and reach qualified candidates",
    "Browse a talent pool of active job seekers",
    "Built-in CRM to track your pipeline",
    "Manage multiple companies and roles",
    "Connect LinkedIn for verified sourcing",
  ];

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
              <a href="/sign-in" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">

        {/* ── Step 1: Role Selection ── */}
        {step === 1 && (
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Join DulyHired</h1>
            <p className="text-white/60 mb-10">Choose how you want to use DulyHired</p>
            <div className="grid md:grid-cols-2 gap-5">
              {/* Employee card */}
              <button
                onClick={() => handleRoleSelect("employee")}
                className="group relative text-left p-7 rounded-2xl border border-white/15 bg-white/08 backdrop-blur-xl hover:bg-white/12 hover:border-white/30 transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/30 border border-primary/50 flex items-center justify-center mb-4">
                  <Search size={26} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">I&apos;m looking for work</h2>
                <p className="text-sm text-white/60 mb-5">Find your next opportunity</p>
                <ul className="space-y-2 mb-6">
                  {["Save & track jobs", "Personalised alerts", "1-click apply"].map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={13} className="text-emerald-400 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
                  Get started <ArrowRight size={14} />
                </span>
              </button>

              {/* Recruiter card */}
              <button
                onClick={() => handleRoleSelect("recruiter")}
                className="group relative text-left p-7 rounded-2xl border border-white/15 hover:bg-white/12 hover:border-white/30 transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div className="w-14 h-14 rounded-xl bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center mb-4">
                  <Building2 size={26} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">I&apos;m hiring</h2>
                <p className="text-sm text-white/60 mb-5">Find and manage great talent</p>
                <ul className="space-y-2 mb-6">
                  {["Post jobs instantly", "CRM pipeline", "Talent pool access"].map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={13} className="text-emerald-400 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
                  Get started <ArrowRight size={14} />
                </span>
              </button>
            </div>
            <p className="text-sm text-white/40 mt-8">
              Already have an account?{" "}
              <a href="/sign-in" className="text-white/70 hover:text-white underline">Sign in</a>
            </p>
          </div>
        )}

        {/* ── Step 2: Sign-up form ── */}
        {step === 2 && !success && (
          <div className="w-full max-w-4xl">
            <div className="grid md:grid-cols-5 gap-8 items-start">
              {/* Left — Benefits */}
              <div className="md:col-span-2 md:pt-4 hidden md:block">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6 transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-5">
                  {role === "employee" ? <Search size={26} className="text-white" /> : <Building2 size={26} className="text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {role === "employee" ? "Find your next role" : "Hire great talent"}
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  {role === "employee" ? "Create your free job seeker account" : "Create your free recruiter account"}
                </p>
                <ul className="space-y-3">
                  {(role === "employee" ? employeeBenefits : recruiterBenefits).map(b => (
                    <li key={b} className="flex items-start gap-3 text-sm text-white/75">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Form */}
              <div className="md:col-span-3">
                {/* Mobile back button */}
                <button onClick={() => setStep(1)} className="flex md:hidden items-center gap-1.5 text-sm text-white/50 hover:text-white mb-4 transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/50 p-8">
                  <div className="mb-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                      role === "employee" ? "bg-primary/10 text-primary" : "bg-indigo-500/10 text-indigo-600"
                    }`}>
                      {role === "employee" ? <Search size={11} /> : <Building2 size={11} />}
                      {role === "employee" ? "Job Seeker" : "Recruiter"} Account
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Free forever. No credit card required.</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {role === "recruiter" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                            placeholder="Acme Inc." required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="John Doe" required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
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
                          placeholder="Min. 8 characters" required minLength={8}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary accent-primary mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        I agree to the{" "}
                        <button type="button" className="text-primary dark:text-primary-light hover:underline">Terms of Service</button>
                        {" "}and{" "}
                        <button type="button" className="text-primary dark:text-primary-light hover:underline">Privacy Policy</button>
                      </span>
                    </label>

                    <button type="submit" disabled={isLoading || !agreed}
                      className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                      {isLoading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                      Create Account
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                    Already have an account?{" "}
                    <a href="/sign-in" className="text-primary dark:text-primary-light font-medium hover:underline">Sign in</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Success: confirm email ── */}
        {success && (
          <div className="w-full max-w-md text-center">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/50 p-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and access your dashboard.
              </p>
              <a href="/sign-in" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm">
                Back to Sign In
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 text-white/40 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs">
          <p>© 2025 DulyHired. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


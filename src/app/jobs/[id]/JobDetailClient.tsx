"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  ExternalLink,
  Heart,
  Bookmark,
  Share2,
  Check,
  Building2,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  User,
  Search,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// ─── Types ────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string | null;
  companyLogo: string;
  location: string;
  country: string;
  region: string;
  collar: string;
  workplace: string;
  seniority: string;
  commitment: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  industry: string;
  type: string;
  posted: string;
  urgent: boolean;
  featured: boolean;
  skills: string[];
  staffingAgency: boolean;
  description: string;
  external_url?: string | null;
}

// ─── Props ────────────────────────────────────────────────────────
interface Props {
  job: Job;
}

// ─── Main Component ──────────────────────────────────────────────
export default function JobDetailClient({ job }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Track job view on mount
  useEffect(() => {
    try {
      (window as any).__trackJobView?.(String(job.id));
      // Also try direct beacon for reliability
      const vid = sessionStorage.getItem("cv_visitor");
      if (vid) {
        navigator.sendBeacon("/api/track", JSON.stringify({
          event_type: "job_view",
          visitor_id: vid,
          path: window.location.pathname,
          job_id: String(job.id),
        }));
      }
    } catch { /* non-blocking */ }
  }, [job.id]);

  // ── Save/unsave job ──────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!user) {
      router.push(`/sign-in?redirect=/jobs/${job.id}`);
      return;
    }
    try {
      const supabase = createClient();
      if (isSaved) {
        await supabase.from("saved_jobs").delete().eq("job_id", String(job.id));
        setIsSaved(false);
      } else {
        await supabase.from("saved_jobs").insert({
          job_id: String(job.id),
          job_title: job.title,
          job_company: job.company,
          job_location: job.location,
          job_salary: job.salary,
          external_url: job.external_url,
        });
        setIsSaved(true);
      }
    } catch { /* non-blocking */ }
  }, [user, isSaved, job, router]);

  // ── Track click on external link ──────────────────────────────
  const trackClick = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.from("job_clicks").insert({
        job_id: String(job.id),
        user_id: user?.id ?? null,
      });
    } catch { /* non-blocking */ }
  }, [job.id, user?.id]);

  // ── Header ────────────────────────────────────────────────────
  function Header() {
    return (
      <header className="sticky top-0 z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo + Back */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                  <Briefcase size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100 hidden sm:inline">
                  DulyHired
                </span>
              </Link>
              <div className="h-5 w-px bg-gray-200 dark:bg-dark-border hidden sm:block" />
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">{t("job.back_to_results")}</span>
                <span className="sm:hidden">{t("job.back")}</span>
              </Link>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 transition-colors"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {authLoading ? (
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-dark-hover animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 hidden sm:inline max-w-[120px] truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  {showMobileMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg py-1 z-50">
                      <Link
                        href={`/dashboard/${profile?.role || "employee"}`}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <User size={14} />
                        Dashboard
                      </Link>
                      <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Search size={14} />
                        Browse Jobs
                      </Link>
                      <hr className="border-gray-100 dark:border-dark-border my-1" />
                      <button
                        onClick={() => { setShowMobileMenu(false); signOut(); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-hover"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    {t("nav.sign_in")}
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs bg-primary text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t("nav.sign_up")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ── Job Content ───────────────────────────────────────────────
  function JobContent() {
    // Extract bullet points from description
    const bullets = useMemo(() => {
      const desc = job.description || "";
      return desc
        .split(/\n/)
        .filter((l) => {
          const tr = l.trim();
          return (
            (tr.startsWith("-") || tr.startsWith("•") || tr.startsWith("*") || /^\d+[.)]/.test(tr)) &&
            tr.replace(/^[-•*\d.)\s]+/, "").length > 15
          );
        })
        .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
        .slice(0, 8);
    }, [job.description]);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary dark:hover:text-primary-light transition-colors">
            {t("nav.home")}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
            {job.title}
          </span>
        </nav>

        {/* Header Section */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shrink-0">
              {job.companyLogo}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {job.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1.5">
                {job.company || t("job.confidential")}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {job.location}
                </span>
                {job.salary !== "Competitive" && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={15} />
                    {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase size={15} />
                  {job.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} />
                  {job.posted}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {job.external_url ? (
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackClick}
                className="flex-1 sm:flex-none bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors text-sm text-center"
              >
                Apply Job
              </a>
            ) : (
              <button className="flex-1 sm:flex-none bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors text-sm">
                Apply Job
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 border font-medium py-3 px-6 rounded-lg transition-colors text-sm ${
                isSaved
                  ? "border-primary/40 text-primary dark:text-primary-light bg-primary/5"
                  : "border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
              }`}
            >
              <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : t("job.save")}
            </button>
            <button className="p-3 rounded-lg border border-gray-300 dark:border-dark-border text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
              <Share2 size={16} />
            </button>
          </div>

          {/* Badges */}
          {(job.urgent || job.featured) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {job.urgent && (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                  {t("badge.urgent")}
                </span>
              )}
              {job.featured && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                  {t("badge.featured")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 sm:p-8 mt-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t("job.description")}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
            {job.description.slice(0, 350)}
            {job.external_url && (
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackClick}
                className="text-primary dark:text-primary-light font-medium hover:underline ml-1 inline"
              >
                ... Read More
              </a>
            )}
          </div>
        </div>

        {/* Responsibilities (extracted from description) */}
        {bullets.length >= 3 && (
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 sm:p-8 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t("job.responsibilities")}
            </h2>
            <ul className="space-y-2.5">
              {bullets.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={15} className="text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 sm:p-8 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t("job.skills")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 px-3.5 py-1.5 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {[
            { label: t("drawer.industry"), value: job.industry },
            { label: t("drawer.job_type"), value: job.type },
            { label: t("drawer.seniority"), value: job.seniority.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
            { label: t("drawer.workplace"), value: job.workplace.charAt(0).toUpperCase() + job.workplace.slice(1) },
            { label: t("drawer.location"), value: job.location },
            { label: t("drawer.region"), value: job.region || job.country },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Footer ────────────────────────────────────────────────────
  function Footer() {
    return (
      <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Briefcase size={13} className="text-white" />
              </div>
              <span className="text-white dark:text-gray-100 font-bold text-xs">{t("site.title")}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="hover:text-white dark:hover:text-gray-300 transition-colors">{t("footer.browse_jobs")}</Link>
              <Link href="/about" className="hover:text-white dark:hover:text-gray-300 transition-colors">{t("footer.about")}</Link>
              <Link href="/privacy" className="hover:text-white dark:hover:text-gray-300 transition-colors">{t("footer.privacy")}</Link>
              <span>© 2025 {t("site.title")}</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <JobContent />
      <Footer />

      {/* Click outside menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
      )}
    </div>
  );
}

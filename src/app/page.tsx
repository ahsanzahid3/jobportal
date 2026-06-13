"use client";

import { useState, useMemo, useCallback, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  ChevronDown,
  ChevronLeft,
  Bell,
  Filter,
  X,
  Clock,
  DollarSign,
  Bookmark,
  Save,
  Trash2,
  Globe,
  Building2,
  Calendar,
  RotateCcw,
  ChevronUp,
  Moon,
  Sun,
  Heart,
  ExternalLink,
  Share2,
  Check,
  Star,
  ChevronRight,
  Send,
  Eye,
  Award,
  Lock,
  UserPlus,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────

const countries = [
  { name: "Algeria", region: "Africa" },
  { name: "Australia", region: "Oceania" },
  { name: "Austria", region: "Europe" },
  { name: "Bangladesh", region: "Asia" },
  { name: "Belgium", region: "Europe" },
  { name: "Brazil", region: "South America" },
  { name: "Canada", region: "North America" },
  { name: "Czechia", region: "Europe" },
  { name: "Denmark", region: "Europe" },
  { name: "Egypt", region: "Africa" },
  { name: "Ethiopia", region: "Africa" },
  { name: "Finland", region: "Europe" },
  { name: "France", region: "Europe" },
  { name: "Germany", region: "Europe" },
  { name: "Ghana", region: "Africa" },
  { name: "Hong Kong", region: "Asia" },
  { name: "India", region: "Asia" },
  { name: "Indonesia", region: "ASEAN" },
  { name: "Ireland", region: "Europe" },
  { name: "Italy", region: "Europe" },
  { name: "Kenya", region: "Africa" },
  { name: "Malaysia", region: "ASEAN" },
  { name: "Mexico", region: "North America" },
  { name: "Morocco", region: "Africa" },
  { name: "Netherlands", region: "Europe" },
  { name: "New Zealand", region: "Oceania" },
  { name: "Nigeria", region: "Africa" },
  { name: "Norway", region: "Europe" },
  { name: "Pakistan", region: "Asia" },
  { name: "Philippines", region: "ASEAN" },
  { name: "Poland", region: "Europe" },
  { name: "Portugal", region: "Europe" },
  { name: "Qatar", region: "Middle East" },
  { name: "Russia", region: "Europe" },
  { name: "Rwanda", region: "Africa" },
  { name: "Saudi Arabia", region: "Middle East" },
  { name: "Senegal", region: "Africa" },
  { name: "Singapore", region: "ASEAN" },
  { name: "South Africa", region: "Africa" },
  { name: "Spain", region: "Europe" },
  { name: "Sweden", region: "Europe" },
  { name: "Tanzania", region: "Africa" },
  { name: "Uganda", region: "Africa" },
  { name: "United Arab Emirates", region: "Middle East" },
  { name: "United Kingdom", region: "Europe" },
  { name: "United States", region: "North America" },
];

const regions = ["All Regions", "Africa", "Asia", "ASEAN", "Europe", "Middle East", "North America", "Oceania", "South America"];

const workplaceOptions = [
  { value: "all", label: "All Environments" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
  { value: "field", label: "Field" },
];

const seniorityOptions = [
  { value: "all", label: "All Levels" },
  { value: "no-experience", label: "No Prior Experience" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

const commitmentOptions = [
  { value: "all", label: "All Types" },
  { value: "fulltime", label: "Full Time" },
  { value: "parttime", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

const datePostedOptions = [
  { value: "all", label: "Any time" },
  { value: "1", label: "Past 24 hours" },
  { value: "3", label: "Past 3 days" },
  { value: "7", label: "Past week" },
  { value: "14", label: "Past 2 weeks" },
  { value: "30", label: "Past month" },
];

const industries = [
  "All Industries",
  "Software & Technology",
  "AI & Machine Learning",
  "Fintech & Finance",
  "Healthcare & Medical",
  "Cybersecurity",
  "Construction & Trades",
  "Manufacturing",
  "Logistics & Transportation",
  "Marketing & Advertising",
  "Sales & Business Development",
  "Education & Training",
  "Hospitality & Tourism",
  "Energy & Utilities",
  "Agriculture & Farming",
  "Telecommunications",
  "Real Estate & Property",
  "Media & Entertainment",
  "Human Resources",
  "Design & Creative",
  "Nonprofit & NGO",
];

// ─── Fallback Jobs (used when API is unreachable) ──────────────
const fallbackJobs: Job[] = [
  { id: "1", title: "Senior Frontend Engineer", company: "TechCorp", companyLogo: "TC", location: "Lagos, Nigeria", country: "Nigeria", region: "Africa", collar: "white", workplace: "remote", seniority: "senior", commitment: "fulltime", salary: "$80K - $120K", salaryMin: 80000, salaryMax: 120000, industry: "Software & Technology", type: "Full-time", posted: "2 days ago", urgent: true, featured: true, skills: ["React", "TypeScript", "Next.js", "Tailwind"], staffingAgency: false, description: "We're looking for a Senior Frontend Engineer to lead our web application development team at TechCorp." },
  { id: "2", title: "Marketing Manager", company: "BrandBoost", companyLogo: "BB", location: "Nairobi, Kenya", country: "Kenya", region: "Africa", collar: "white", workplace: "hybrid", seniority: "senior", commitment: "fulltime", salary: "$50K - $70K", salaryMin: 50000, salaryMax: 70000, industry: "Marketing & Advertising", type: "Full-time", posted: "1 week ago", urgent: false, featured: false, skills: ["Marketing Strategy", "Digital Media", "Analytics", "Team Leadership"], staffingAgency: false, description: "BrandBoost is seeking a Marketing Manager to develop marketing strategies across digital channels in East African markets." },
  { id: "3", title: "Night Shift Supervisor", company: "LogiPro", companyLogo: "LP", location: "Mumbai, India", country: "India", region: "Asia", collar: "blue", workplace: "onsite", seniority: "mid", commitment: "fulltime", salary: "$18K - $25K", salaryMin: 18000, salaryMax: 25000, industry: "Logistics & Transportation", type: "Full-time", posted: "Just now", urgent: true, featured: true, skills: ["Logistics", "Team Management", "Inventory", "Scheduling"], staffingAgency: false, description: "LogiPro is looking for a Night Shift Supervisor to oversee our Mumbai distribution center." },
  { id: "4", title: "Data Scientist", company: "DataWise Analytics", companyLogo: "DW", location: "Austin, TX", country: "United States", region: "North America", collar: "white", workplace: "hybrid", seniority: "mid", commitment: "fulltime", salary: "$110K - $150K", salaryMin: 110000, salaryMax: 150000, industry: "Data & Analytics", type: "Full-time", posted: "3 days ago", urgent: false, featured: false, skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics"], staffingAgency: false, description: "DataWise is hiring a mid-level Data Scientist to build predictive models that power our business intelligence platform." },
  { id: "5", title: "Electrician", company: "PowerGrid Solutions", companyLogo: "PG", location: "Lagos, Nigeria", country: "Nigeria", region: "Africa", collar: "blue", workplace: "field", seniority: "mid", commitment: "fulltime", salary: "$20K - $30K", salaryMin: 20000, salaryMax: 30000, industry: "Energy & Utilities", type: "Full-time", posted: "5 days ago", urgent: true, featured: false, skills: ["Electrical Systems", "Troubleshooting", "Blueprints", "Safety Protocols"], staffingAgency: false, description: "PowerGrid Solutions is expanding its field operations team in Lagos." },
];

// ─── Types ──────────────────────────────────────────────────────

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
  external_url?: string;
}

interface FilterState {
  search: string;
  region: string;
  country: string;
  collar: string;
  workplace: string;
  seniority: string;
  commitment: string;
  industry: string;
  datePosted: string;
  salaryMin: number;
  salaryMax: number;
  excludeStaffing: boolean;
  sort: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  region: "All Regions",
  country: "All Countries",
  collar: "all",
  workplace: "all",
  seniority: "all",
  commitment: "all",
  industry: "All Industries",
  datePosted: "all",
  salaryMin: 0,
  salaryMax: 300000,
  excludeStaffing: false,
  sort: "relevant",
};

// ─── URL ↔ FilterState helpers ──────────────────────────────────
function filtersToUrl(f: FilterState): string {
  const p = new URLSearchParams();
  if (f.search) p.set("q", f.search);
  if (f.region !== "All Regions") p.set("region", f.region);
  if (f.country !== "All Countries") p.set("country", f.country);
  if (f.collar !== "all") p.set("collar", f.collar);
  if (f.workplace !== "all") p.set("wp", f.workplace);
  if (f.seniority !== "all") p.set("sen", f.seniority);
  if (f.commitment !== "all") p.set("com", f.commitment);
  if (f.industry !== "All Industries") p.set("ind", f.industry);
  if (f.datePosted !== "all") p.set("dp", f.datePosted);
  if (f.salaryMin > 0) p.set("smin", String(f.salaryMin));
  if (f.salaryMax < 300000) p.set("smax", String(f.salaryMax));
  if (f.excludeStaffing) p.set("nostaff", "1");
  if (f.sort !== "relevant") p.set("sort", f.sort);
  return p.toString();
}

function urlToFilters(sp: URLSearchParams): FilterState {
  return {
    search: sp.get("q") || "",
    region: sp.get("region") || "All Regions",
    country: sp.get("country") || "All Countries",
    collar: sp.get("collar") || "all",
    workplace: sp.get("wp") || "all",
    seniority: sp.get("sen") || "all",
    commitment: sp.get("com") || "all",
    industry: sp.get("ind") || "All Industries",
    datePosted: sp.get("dp") || "all",
    salaryMin: sp.get("smin") ? parseInt(sp.get("smin")!) : 0,
    salaryMax: sp.get("smax") ? parseInt(sp.get("smax")!) : 300000,
    excludeStaffing: sp.get("nostaff") === "1",
    sort: sp.get("sort") || "relevant",
  };
}

// ─── Helpers ────────────────────────────────────────────────────
function daysSince(posted: string): number {
  if (posted === "Today" || posted === "Just now") return 0;
  const match = posted.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/);
  if (!match) return 999;
  const n = parseInt(match[1]);
  const unit = match[2];
  if (unit.startsWith("day")) return n;
  if (unit.startsWith("week")) return n * 7;
  if (unit.startsWith("month")) return n * 30;
  if (unit.startsWith("year")) return n * 365;
  return 999;
}

// ─── Indeed-style Job Card ──────────────────────────────────────
function JobCard({
  job,
  onClick,
  onSave,
  isSaved,
}: {
  job: Job;
  onClick: () => void;
  onSave?: (job: Job) => void;
  isSaved?: boolean;
}) {
  const { t } = useI18n();
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: cy * -7, y: cx * 7, active: true });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0, active: false });

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`job-card job-card-tilt relative bg-white dark:bg-dark-card rounded-lg border cursor-pointer border-gray-200 dark:border-dark-border`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.active ? "transform 0.08s ease" : "transform 0.45s ease",
      }}
    >
      <div className="job-card-shine" />
      <div className="p-4 relative z-10">
        {/* Title row — full width with bookmark at the end */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-black dark:text-gray-100 leading-tight line-clamp-1 flex-1 min-w-0">
            {job.title}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); onSave?.(job); }}
            className={`shrink-0 mt-0.5 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
              isSaved ? "text-primary dark:text-primary-light" : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
            }`}
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Company | Location | Salary */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-[13px] text-gray-600 dark:text-gray-400">
          {job.company ? (
            <span className="font-medium text-gray-700 dark:text-gray-300">{job.company}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">{t("job.confidential")}</span>
          )}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="shrink-0" />
            {job.location}
          </span>
          {job.salary !== "Competitive" && job.salary !== "Unpaid" && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                <DollarSign size={12} className="shrink-0" />
                {job.salary}
              </span>
            </>
          )}
        </div>

        {/* Metadata row — colored text with dot separators */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-3 text-[12px]">
          <span className="font-medium text-blue-600 dark:text-blue-400">{
            job.commitment === "full-time" || job.commitment === "fulltime" ? t("commitment.fulltime") :
            job.commitment === "part-time" || job.commitment === "parttime" ? t("commitment.parttime") :
            job.commitment === "contract" ? t("commitment.contract") :
            job.commitment === "internship" ? t("commitment.internship") :
            job.commitment === "temporary" ? t("commitment.temporary") :
            job.commitment
          }</span>
          <span className="text-gray-300 dark:text-gray-600 mx-0.5">•</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">{job.workplace === "remote" ? t("workplace.remote") : job.workplace === "hybrid" ? t("workplace.hybrid") : job.workplace === "field" ? t("workplace.field") : t("workplace.onsite")}</span>
          <span className="text-gray-300 dark:text-gray-600 mx-0.5">•</span>
          <span className="font-medium text-purple-600 dark:text-purple-400 capitalize">{job.seniority === "no-experience" ? t("seniority.no_experience") : job.seniority}</span>
          <span className="text-gray-300 dark:text-gray-600 mx-0.5">•</span>
          <span className="text-gray-600 dark:text-gray-300">{job.posted}</span>
        </div>

        {/* Badges row */}
        {(job.urgent || job.featured) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {job.urgent && (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{t("badge.urgent")}</span>
            )}
            {job.featured && (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">{t("badge.featured")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Job Drawer (Indeed-style side panel) ───────────────────────
function JobDrawer({
  job,
  onClose,
  allJobs,
  onSave,
  isSaved,
}: {
  job: Job;
  onClose: () => void;
  allJobs: Job[];
  onSave?: (job: Job) => void;
  isSaved?: boolean;
}) {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  const trackClick = async () => {
    try {
      const supabase = createClient();
      await supabase.from("job_clicks").insert({
        job_id: String(job.id),
        user_id: user?.id ?? null,
      });
    } catch { /* non-blocking */ }
  };

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 150);
  };

  // Similar jobs (same industry or same region, excluding current)
  const similarJobs = useMemo(() => {
    return allJobs
      .filter((j) => j.id !== job.id && (j.industry === job.industry || j.region === job.region))
      .slice(0, 3);
  }, [job, allJobs]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 dark:bg-black/50 z-40 ${exiting ? "drawer-overlay-exit" : "drawer-overlay-enter"}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-dark-surface shadow-2xl z-50 flex flex-col ${
          exiting ? "drawer-exit" : "drawer-enter"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-dark-border shrink-0">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
            {t("job.back_to_results")}
          </button>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
              <Share2 size={16} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Job Header Section */}
          <div className="px-5 py-6 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-start gap-4">
              {job.company ? (
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {job.companyLogo}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-dark-hover flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
                  <Building2 size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {job.title}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  {job.company || t("job.confidential")}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {job.location}
                  </span>
                  {job.salary !== t("job.unpaid") && (
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
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {job.external_url ? (
                <a
                  href={job.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackClick}
                  className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors text-sm text-center"
                >
                  Apply Job
                </a>
              ) : (
                <button
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  {t("job.view_details") || "View Details"}
                </button>
              )}
              <button
                onClick={() => onSave?.(job)}
                className={`flex items-center gap-2 border font-medium py-2.5 px-5 rounded-lg transition-colors text-sm ${
                  isSaved
                    ? "border-primary/40 text-primary dark:text-primary-light bg-primary/5"
                    : "border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                }`}
              >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : t("job.save")}
              </button>
            </div>
          </div>

          {/* Job Details */}
          <div className="px-5 py-5 space-y-5">
            {/* Description */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("job.description")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
              </p>
            </div>

            {/* Responsibilities — only if description has real bullets */}
            {(() => {
              const desc = job.description || "";
              const bullets = desc.split(/\n/).filter(l => {
                const tr = l.trim();
                return (tr.startsWith("-") || tr.startsWith("•") || tr.startsWith("*") || /^\d+[.)]/.test(tr)) &&
                  tr.replace(/^[-•*\d.)\s]+/, "").length > 15;
              }).map(l => l.replace(/^[-•*\d.)\s]+/, "").trim()).slice(0, 6);
              if (bullets.length < 3) return null;
              return (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t("job.responsibilities")}
                  </h3>
                  <ul className="space-y-2">
                    {bullets.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* Required Skills — only if job has them */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t("job.skills")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-dark-card rounded-lg">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.industry")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{job.industry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.job_type")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{job.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.seniority")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">{job.seniority.replace("-", " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.workplace")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 capitalize">{job.workplace}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.location")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{job.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("drawer.region")}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{job.region}</p>
              </div>
            </div>
          </div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="px-5 py-5 border-t border-gray-100 dark:border-dark-border">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("job.similar")}
              </h3>
              <div className="space-y-2">
                {similarJobs.map((sj) => (
                  <button
                    key={sj.id}
                    onClick={() => router.push(`/jobs/${sj.id}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover border border-gray-100 dark:border-dark-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {sj.company ? (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          {sj.companyLogo}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-dark-hover flex items-center justify-center text-gray-400 shrink-0">
                          <Building2 size={14} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{sj.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{sj.company || t("job.confidential")} • {sj.location}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Filter Components ──────────────────────────────────────────

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-dark-border pb-3 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-[10px] bg-primary-light dark:bg-primary/20 text-primary dark:text-white px-1.5 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function FilterRadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
            value === opt.value
              ? "bg-primary-light dark:bg-primary/20 text-primary dark:text-white font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Content ───────────────────────────────────────────────
function HomeContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { t } = useI18n();
  const { user, profile } = useAuth();

  const [filters, setFilters] = useState<FilterState>(() => urlToFilters(sp));
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Employee profile data for personalized sorting
  const [employeeData, setEmployeeData] = useState<{ country: string; headline: string; skills: string[] } | null>(null);

  // Load saved job IDs + employee profile for logged-in employees
  useEffect(() => {
    if (user && profile?.role === "employee") {
      const sup = createClient();
      // Saved jobs
      sup.from("saved_jobs").select("job_id").eq("employee_id", user.id)
        .then(({ data }) => {
          if (data) setSavedJobIds(new Set(data.map(r => r.job_id)));
        });
      // Employee profile for personalized relevance
      (async () => {
        try {
          const { data } = await sup
            .from("employee_profiles")
            .select("location, headline, skills")
            .eq("id", user.id)
            .single();
          if (data) {
            setEmployeeData({
              country: data.location || "",
              headline: data.headline || "",
              skills: data.skills || [],
            });
          }
        } catch { /* no profile yet */ }
      })();
    } else {
      setEmployeeData(null);
    }
  }, [user, profile]);

  const handleSaveJob = useCallback(async (job: Job) => {
    if (!user || profile?.role !== "employee") {
      window.location.href = "/sign-in";
      return;
    }
    const supabase = createClient();
    const jobId = String(job.id);
    if (savedJobIds.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("employee_id", user.id).eq("job_id", jobId);
      setSavedJobIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
    } else {
      await supabase.from("saved_jobs").insert({
        employee_id: user.id,
        job_id: jobId,
        job_title: job.title,
        job_company: job.company,
        job_location: job.location,
        job_salary: job.salary,
        external_url: job.external_url,
      });
      setSavedJobIds(prev => new Set(prev).add(jobId));
    }
  }, [user, profile, savedJobIds]);

  // Fetch real jobs from Supabase via API
  useEffect(() => {
    let cancelled = false;
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs?limit=1000");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (!cancelled && data.jobs?.length > 0) {
          // Map DB columns to our interface
          const mapped = data.jobs.map((j: any, i: number) => {
            const companyName = j.company || null;
            const ct = j.type || "full-time";
            // Compute salary display
            let salaryDisplay = "Competitive";
            const smin = typeof j.salary_min === 'number' ? j.salary_min : null;
            const smax = typeof j.salary_max === 'number' ? j.salary_max : null;
            if (smin !== null && smax !== null && smin > 0 && smax > 0) {
              salaryDisplay = `$${Math.round(smin/1000)}K - $${Math.round(smax/1000)}K`;
            } else if (smin !== null && smin > 0) {
              salaryDisplay = `From $${Math.round(smin/1000)}K`;
            } else if (smax !== null && smax > 0) {
              salaryDisplay = `Up to $${Math.round(smax/1000)}K`;
            }

            let postedDate = t("posted.recently");
            if (j.created_at) {
              try {
                const d = new Date(j.created_at);
                if (!isNaN(d.getTime())) postedDate = timeAgo(d);
              } catch {}
            }

            return {
              id: j.id || j.external_id || `job-${i}`,
              title: j.title || t("position.unknown"),
              company: companyName,
              companyLogo: companyName
                ? companyName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                : "XX",
              location: j.location || "Remote",
              country: j.country || "Unknown",
              region: j.region || "Other",
              collar: j.collar || "white",
              workplace: j.workplace || "onsite",
              seniority: j.seniority || "mid",
              commitment: ct,
              salary: salaryDisplay,
              salaryMin: smin || 0,
              salaryMax: smax || 0,
              industry: j.industry || "General",
              type: ct,
              posted: postedDate,
              urgent: j.is_urgent || false,
              featured: j.is_featured || false,
              skills: Array.isArray(j.skills) ? j.skills : [],
              staffingAgency: false,
              description: j.description || t("description.none"),
              external_url: j.external_url || undefined,
            };
          });
          if (!cancelled) setJobs(mapped);
        } else if (!cancelled) {
          setJobs(fallbackJobs);
        }
      } catch {
        if (!cancelled) setJobs(fallbackJobs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadJobs();
    return () => { cancelled = true; };
  }, []);

  function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t("posted.today");
    if (days === 1) return t("posted.1_day");
    if (days < 7) return t("posted.n_days", { days: String(days) });
    if (days < 14) return t("posted.1_week");
    if (days < 30) return t("posted.n_weeks", { weeks: String(Math.floor(days / 7)) });
    if (days < 365) return t("posted.n_months", { months: String(Math.floor(days / 30)) });
    return t("posted.n_years", { years: String(Math.floor(days / 365)) });
  }

  const [visibleCount, setVisibleCount] = useState(20);
  const JOBS_PER_PAGE = 20;
  const [showSignupGate, setShowSignupGate] = useState(false);

  const pushFilters = useCallback(
    (next: FilterState) => {
      setFilters(next);
      const qs = filtersToUrl(next);
      router.replace(`/${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      pushFilters({ ...filters, [key]: value });
    },
    [filters, pushFilters]
  );

  const removeTag = useCallback(
    (key: keyof FilterState, value?: string) => {
      if (key === "salaryMin" || key === "salaryMax") {
        pushFilters({ ...filters, salaryMin: 0, salaryMax: 300000 });
      } else {
        const next = { ...filters, [key]: DEFAULT_FILTERS[key] };
        pushFilters(next);
      }
    },
    [filters, pushFilters]
  );

  const clearAll = useCallback(() => pushFilters(DEFAULT_FILTERS), [pushFilters]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchText = [
          job.title,
          job.company || '',
          ...job.skills,
          job.location,
        ].join(' ').toLowerCase();
        if (!searchText.includes(q)) return false;
      }
      if (filters.region !== "All Regions" && job.region !== filters.region) return false;
      if (filters.country !== "All Countries" && job.country !== filters.country) return false;
      if (filters.workplace !== "all" && job.workplace !== filters.workplace) return false;
      if (filters.seniority !== "all" && job.seniority !== filters.seniority) return false;
      if (filters.commitment !== "all" && job.commitment !== filters.commitment) return false;
      if (filters.industry !== "All Industries" && job.industry !== filters.industry) return false;
      if (filters.excludeStaffing && job.staffingAgency) return false;
      if (job.salaryMax > 0) {
        if (job.salaryMax < filters.salaryMin) return false;
        if (job.salaryMin > filters.salaryMax) return false;
      }
      if (filters.datePosted !== "all") {
        const days = parseInt(filters.datePosted);
        if (!isNaN(days) && daysSince(job.posted) > days) return false;
      }
      return true;
    });
  }, [filters, jobs]);

  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs];

    switch (filters.sort) {
      case "relevant":
        if (employeeData) {
          // Personalized relevance scoring for logged-in employees
          const { country: empCountry, headline, skills } = employeeData;
          const titleWords = (headline || "")
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(w => w.length > 2);
          const skillSet = new Set((skills || []).map(s => s.toLowerCase()));

          jobs.forEach(job => {
            let score = 0;
            // +50 if job is in employee's country (exact or fuzzy)
            const jobCountry = (job.country || "").toLowerCase();
            const empC = empCountry.toLowerCase();
            if (jobCountry === empC || jobCountry.includes(empC) || empC.includes(jobCountry)) {
              score += 50;
            }
            // +30 if job title matches headline words
            const jobTitle = (job.title || "").toLowerCase();
            for (const word of titleWords) {
              if (jobTitle.includes(word)) {
                score += 30;
                break;
              }
            }
            // +15 per matching skill
            const jobSkills = (job.skills || []).map(s => s.toLowerCase());
            for (const skill of jobSkills) {
              if (skillSet.has(skill)) {
                score += 15;
              }
            }
            // +10 if job is in same region
            if (empCountry && job.region && job.region.toLowerCase().includes(empCountry.toLowerCase().split(",").pop()?.trim() || "")) {
              score += 10;
            }
            // Recency bonus: up to +5 for very recent jobs
            const daysAgo = daysSince(job.posted);
            score += Math.max(0, 5 - daysAgo);

            (job as any)._score = score;
          });

          jobs.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));
        } else {
          // Guest: relevant = newest
          jobs.sort((a, b) => daysSince(a.posted) - daysSince(b.posted));
        }
        break;
      case "newest":
        jobs.sort((a, b) => daysSince(a.posted) - daysSince(b.posted));
        break;
      case "salary-high":
        jobs.sort((a, b) => b.salaryMax - a.salaryMax);
        break;
      case "salary-low":
        jobs.sort((a, b) => a.salaryMin - b.salaryMin);
        break;
    }
    return jobs;
  }, [filteredJobs, filters.sort, employeeData]);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.region !== "All Regions" ? 1 : 0) +
    (filters.country !== "All Countries" ? 1 : 0) +
    (filters.workplace !== "all" ? 1 : 0) +
    (filters.seniority !== "all" ? 1 : 0) +
    (filters.commitment !== "all" ? 1 : 0) +
    (filters.industry !== "All Industries" ? 1 : 0) +
    (filters.datePosted !== "all" ? 1 : 0) +
    (filters.salaryMin > 0 || filters.salaryMax < 300000 ? 1 : 0) +
    (filters.excludeStaffing ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 header-glass border-b border-gray-200/60 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center">
              <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-primary dark:text-primary-light flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 dark:border-primary/30">
                <Search size={14} />
                {t("nav.find_job")}
              </Link>
              <Link href="/companies" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                {t("nav.browse_companies")}
              </Link>
              <Link href="/#job-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center gap-1">
                <Bell size={16} />
                {t("nav.job_alerts")}
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {user && profile ? (
                <Link
                  href={`/dashboard/${profile.role}`}
                  className="flex items-center text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors hidden sm:block">
                    {t("nav.sign_in")}
                  </Link>
                  <Link href="/post-job" className="text-sm font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-4 py-2 rounded-lg hover:bg-primary/15 dark:hover:bg-primary/30 transition-colors hidden lg:block">
                    {t("nav.post_job")}
                  </Link>
                  <Link href="/signup" className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    {t("nav.find_job")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero / Search ── */}
      <section className="hero-3d pb-20 pt-16">
        {/* Animated background layers */}
        <div className="hero-mesh-overlay" aria-hidden="true" />
        <div className="hero-grid-overlay" aria-hidden="true" />
        <div className="hero-orb-3d hero-orb-3d-1" aria-hidden="true" />
        <div className="hero-orb-3d hero-orb-3d-2" aria-hidden="true" />
        <div className="hero-orb-3d hero-orb-3d-3" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Floating stat pills */}
          <div className="flex justify-center gap-3 mb-7 flex-wrap">
            <div className="stat-pill-3d">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {loading ? "—" : jobs.length.toLocaleString()} Live Jobs
            </div>
            <div className="stat-pill-3d stat-pill-3d-2">
              <Globe size={10} />
              24 Countries
            </div>
            <div className="stat-pill-3d stat-pill-3d-3">
              <Briefcase size={10} />
              All Industries
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
              {t("hero.heading")}{" "}
              <span className="gradient-heading-3d">{t("hero.heading_accent")}</span>
            </h1>
            <p className="text-white/50 text-sm">
              {loading ? (
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin inline-block"></span> {t("hero.loading")}</span>
              ) : (
                <>{jobs.length.toLocaleString()}{t("hero.job_count")}</>
              )}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="search-glass-3d rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/08 text-white placeholder-white/35 focus:border-white/30 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <select
                  value={filters.country}
                  onChange={(e) => updateFilter("country", e.target.value)}
                  className="pl-9 pr-7 py-2.5 rounded-xl border border-white/10 text-sm appearance-none cursor-pointer min-w-[150px] text-white/80"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <option className="bg-gray-900">{t("search.all_countries")}</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name} className="bg-gray-900">{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
              <button className="btn-beam bg-primary text-white px-7 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm shadow-lg shadow-blue-900/40">
                {t("search.button")}
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="text-xs bg-white/10 border border-white/20 text-white/70 px-3 py-1.5 rounded-md hover:bg-white/15 transition-colors flex items-center gap-1 md:hidden"
              >
                <Filter size={13} />
                {t("filter.filters")}{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>
              <div className="text-xs text-white/40 md:hidden">
                {loading ? (
                  <span>{t("hero.loading")}</span>
                ) : (
                  <>{sortedJobs.length} {sortedJobs.length === 1 ? t("job.singular") : t("job.plural")} {t("search_results")}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── Sidebar Filters (Desktop, independently scrollable) ── */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain scrollbar-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("filter.filters")}</span>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-primary dark:text-primary-light hover:underline flex items-center gap-1">
                    <RotateCcw size={12} />
                    {t("filter.reset")}
                  </button>
                )}
              </div>

              <div className="mb-2">
                <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">{t("filter.country")}</label>
                <div className="relative">
                  <select
                    value={filters.country}
                    onChange={(e) => updateFilter("country", e.target.value)}
                    className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
                  >
                    <option>{t("search.all_countries")}</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              </div>

              <CollapsibleSection title={t("filter.region")} icon={<Globe size={13} className="text-primary" />} count={filters.region !== "All Regions" ? 1 : undefined}>
                <FilterRadioGroup
                  options={regions.map((r) => ({ value: r, label: r === "All Regions" ? t("all_regions") : r }))}
                  value={filters.region}
                  onChange={(v) => updateFilter("region", v)}
                />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.workplace")} icon={<Building2 size={13} className="text-primary" />} count={filters.workplace !== "all" ? 1 : undefined}>
                <FilterRadioGroup options={workplaceOptions.map(o => ({ ...o, label: o.value === "all" ? t("filter.all_environments") : t("workplace." + o.value) }))} value={filters.workplace} onChange={(v) => updateFilter("workplace", v)} />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.seniority")} icon={<Users size={13} className="text-primary" />} count={filters.seniority !== "all" ? 1 : undefined}>
                <FilterRadioGroup options={seniorityOptions.map(o => ({ ...o, label: o.value === "all" ? t("filter.all_levels") : t("seniority." + o.value) }))} value={filters.seniority} onChange={(v) => updateFilter("seniority", v)} />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.commitment")} icon={<Clock size={13} className="text-primary" />} count={filters.commitment !== "all" ? 1 : undefined}>
                <FilterRadioGroup options={commitmentOptions.map(o => ({ ...o, label: o.value === "all" ? t("filter.all_types") : t("commitment." + o.value) }))} value={filters.commitment} onChange={(v) => updateFilter("commitment", v)} />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.industry")} defaultOpen={false} icon={<Building2 size={13} className="text-primary" />} count={filters.industry !== "All Industries" ? 1 : undefined}>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  <FilterRadioGroup
                    options={industries.map((i) => ({ value: i, label: i === "All Industries" ? t("filter.all_industries") : i }))}
                    value={filters.industry}
                    onChange={(v) => updateFilter("industry", v)}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.date_posted")} icon={<Calendar size={13} className="text-primary" />} count={filters.datePosted !== "all" ? 1 : undefined}>
                <FilterRadioGroup options={datePostedOptions.map(o => ({ ...o, label: o.value === "all" ? t("date_posted.any_time") : o.value === "1" ? t("date_posted.24h") : o.value === "3" ? t("date_posted.3d") : o.value === "7" ? t("date_posted.7d") : o.value === "14" ? t("date_posted.14d") : o.value === "30" ? t("date_posted.30d") : o.label }))} value={filters.datePosted} onChange={(v) => updateFilter("datePosted", v)} />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.salary_range")} defaultOpen={false} icon={<DollarSign size={13} className="text-primary" />} count={(filters.salaryMin > 0 || filters.salaryMax < 300000) ? 1 : undefined}>
                <SalarySlider
                  min={filters.salaryMin}
                  max={filters.salaryMax}
                  onChange={(min, max) => pushFilters({ ...filters, salaryMin: min, salaryMax: max })}
                />
              </CollapsibleSection>

              <CollapsibleSection title={t("filter.more")} defaultOpen={true} icon={<Filter size={13} className="text-primary" />}>
                <label className="flex items-center gap-2 px-1 py-1.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.excludeStaffing}
                    onChange={(e) => updateFilter("excludeStaffing", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-dark-border text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">{t("filter.exclude_staffing")}</span>
                </label>
              </CollapsibleSection>

              <div className="pt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Search size={13} />
                <span>
                  <strong className="text-gray-800 dark:text-gray-200">{loading ? "..." : sortedJobs.length}</strong> {sortedJobs.length === 1 ? t("job.singular") : t("job.plural")}
                </span>
              </div>
            </div>
          </aside>

          {/* ── Job Listings ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span> {t("hero.loading")}</span>
                  ) : (
                    t("job.count", { count: String(sortedJobs.length) })
                  )}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {activeFilterCount > 0 ? t("filter.active_count", { count: String(activeFilterCount) }) : t("filter.showing_all")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">{t("sort.label")}</span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="text-xs border border-gray-200 dark:border-dark-border rounded-md px-2.5 py-1.5 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400"
                >
                  <option value="relevant">{t("sort.relevant")}</option>
                  <option value="newest">{t("sort.newest")}</option>
                  <option value="salary-high">{t("sort.salary_high")}</option>
                  <option value="salary-low">{t("sort.salary_low")}</option>
                </select>
              </div>
            </div>

            {/* Active Filter Tags */}
            <ActiveFilterTags filters={filters} onRemove={removeTag} onClearAll={clearAll} />

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="md:hidden mb-4 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border animate-fade-in space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-xs flex items-center gap-1 dark:text-gray-100">
                    <Filter size={13} />
                    {t("filter.filters")}
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] bg-primary-light dark:bg-primary/20 text-primary dark:text-white px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button onClick={clearAll} className="text-xs text-primary dark:text-primary-light hover:underline">{t("filter.reset")}</button>
                    )}
                    <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">{t("filter.region")}</label>
                    <select value={filters.region} onChange={(e) => updateFilter("region", e.target.value)}
                      className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100">
                      {regions.map((r) => (<option key={r}>{r === "All Regions" ? t("all_regions") : r}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">{t("filter.workplace")}</label>
                    <select value={filters.workplace} onChange={(e) => updateFilter("workplace", e.target.value)}
                      className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100">
                      {workplaceOptions.map((o) => (<option key={o.value} value={o.value}>{o.value === "all" ? t("filter.all_environments") : t("workplace." + o.value)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">{t("filter.seniority")}</label>
                    <select value={filters.seniority} onChange={(e) => updateFilter("seniority", e.target.value)}
                      className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100">
                      {seniorityOptions.map((o) => (<option key={o.value} value={o.value}>{o.value === "all" ? t("filter.all_levels") : t("seniority." + o.value)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">{t("filter.commitment")}</label>
                    <select value={filters.commitment} onChange={(e) => updateFilter("commitment", e.target.value)}
                      className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100">
                      {commitmentOptions.map((o) => (<option key={o.value} value={o.value}>{o.value === "all" ? t("filter.all_types") : t("commitment." + o.value)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">{t("filter.date_posted")}</label>
                    <select value={filters.datePosted} onChange={(e) => updateFilter("datePosted", e.target.value)}
                      className="w-full text-xs border border-gray-200 dark:border-dark-border rounded-md px-2 py-1.5 bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100">
                      {datePostedOptions.map((o) => (<option key={o.value} value={o.value}>{o.value === "all" ? t("date_posted.any_time") : o.value === "1" ? t("date_posted.24h") : o.value === "3" ? t("date_posted.3d") : o.value === "7" ? t("date_posted.7d") : o.value === "14" ? t("date_posted.14d") : o.value === "30" ? t("date_posted.30d") : o.label}</option>))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4 animate-pulse">
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded flex-1 max-w-[80%]"></div>
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded shrink-0"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : sortedJobs.length > 0 ? (
                sortedJobs.slice(0, visibleCount).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => setSelectedJob(job)}
                    onSave={handleSaveJob}
                    isSaved={savedJobIds.has(String(job.id))}
                  />
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
                  <Search size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {employeeData && filters.country === "All Countries" && employeeData.country
                      ? `${t("job.no_jobs_in")} ${employeeData.country}?`
                      : t("job.no_results")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {employeeData && filters.country === "All Countries" && employeeData.country
                      ? `Select a region from the sidebar to expand your search, or clear your filters to see all available jobs.`
                      : t("job.no_results_hint")}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={clearAll} className="text-sm font-medium text-primary dark:text-primary-light hover:underline">{t("filter.clear_all")}</button>
                    {employeeData && filters.country === "All Countries" && employeeData.country && (
                      <button onClick={() => {
                        const sup = createClient();
                        sup.from("regions").select("name").limit(0).then(() => {});
                        updateFilter("country", "All Countries");
                        updateFilter("region", "All Regions");
                      }} className="text-sm font-medium text-primary dark:text-primary-light hover:underline">
                        Browse all regions
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Load More */}
            {visibleCount < sortedJobs.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    if (!user) {
                      setShowSignupGate(true);
                      return;
                    }
                    setVisibleCount((prev) => prev + JOBS_PER_PAGE);
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  {t("job.load_more")}
                </button>
              </div>
            )}

            {/* ── Signup gate modal (logged-out Load More) ── */}
            {showSignupGate && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => { if (e.target === e.currentTarget) setShowSignupGate(false); }}
              >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                {/* Glass card */}
                <div
                  className="relative w-full max-w-md rounded-2xl p-8 text-center"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(28px) saturate(180%)",
                    WebkitBackdropFilter: "blur(28px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}
                >
                  {/* Close */}
                  <button
                    onClick={() => setShowSignupGate(false)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  {/* Icon */}
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)" }}>
                    <Lock size={24} className="text-indigo-200" />
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    See all jobs
                  </h2>
                  <p className="text-sm text-white/70 mb-6 leading-relaxed">
                    Create a free account to browse every listing, save jobs, and apply in seconds.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/signup"
                      onClick={() => setShowSignupGate(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,0.45)" }}
                    >
                      <UserPlus size={16} />
                      Sign up free
                    </Link>
                    <Link
                      href="/sign-in"
                      onClick={() => setShowSignupGate(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Hire CTA (hidden for logged-in users) ── */}
      {!user && (
        <section className="cta-3d py-16">
        <div className="cta-3d-mesh" aria-hidden="true" />
        <div className="cta-3d-grid" aria-hidden="true" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                <Search size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t("cta.candidate_title")}
              </h2>
              <p className="text-sm text-blue-200 mb-5 max-w-sm">
                {t("cta.candidate_desc")}
              </p>
              <Link href="/signup" className="btn-beam inline-block bg-white text-primary font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                {t("nav.find_job")}
              </Link>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-white/15 pt-6 md:pt-0 md:pl-10">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                <Building2 size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t("cta.employer_title")}
              </h2>
              <p className="text-sm text-blue-200 mb-5 max-w-sm">
                {t("cta.employer_desc")}
              </p>
              <div className="flex gap-3">
                <Link href="/post-job" className="btn-beam inline-block bg-white text-primary font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                  {t("nav.post_job")}
                </Link>
                <Link href="/companies" className="inline-block border border-white/30 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors">
                  {t("cta.learn_more")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── Footer ── */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold text-sm mb-3">{t("footer.for_candidates")}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/" className="hover:text-white dark:hover:text-gray-300">{t("footer.browse_jobs")}</Link></li>
                <li><Link href="/signup" className="hover:text-white dark:hover:text-gray-300">{t("nav.job_alerts")}</Link></li>
                <li><Link href="/blog" className="hover:text-white dark:hover:text-gray-300">{t("footer.career_advice")}</Link></li>
                <li><Link href="/" className="hover:text-white dark:hover:text-gray-300">{t("footer.skill_assessments")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold text-sm mb-3">{t("footer.for_employers")}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/post-job" className="hover:text-white dark:hover:text-gray-300">{t("nav.post_job")}</Link></li>
                <li><Link href="/post-job" className="hover:text-white dark:hover:text-gray-300">{t("footer.talent_pool")}</Link></li>
                <li><Link href="/post-job" className="hover:text-white dark:hover:text-gray-300">{t("footer.recruiter_crm")}</Link></li>
                <li><Link href="/post-job" className="hover:text-white dark:hover:text-gray-300">{t("footer.ats_integration")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold text-sm mb-3">{t("footer.company")}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/about" className="hover:text-white dark:hover:text-gray-300">{t("footer.about")}</Link></li>
                <li><Link href="/blog" className="hover:text-white dark:hover:text-gray-300">{t("footer.blog")}</Link></li>
                <li><Link href="/companies" className="hover:text-white dark:hover:text-gray-300">{t("footer.contact")}</Link></li>
                <li><Link href="/blog" className="hover:text-white dark:hover:text-gray-300">{t("footer.press")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold text-sm mb-3">{t("footer.support")}</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/support" className="hover:text-white dark:hover:text-gray-300">{t("footer.help_center")}</Link></li>
                <li><Link href="/privacy" className="hover:text-white dark:hover:text-gray-300">{t("footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-white dark:hover:text-gray-300">{t("footer.terms")}</Link></li>
                <li><Link href="/privacy" className="hover:text-white dark:hover:text-gray-300">{t("footer.cookies")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <a href="/" className="flex items-center">
              <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
            </a>
            <p className="text-xs">© 2025 DulyHired. {t("footer.rights")}</p>
          </div>
        </div>
      </footer>

      {/* ── Job Drawer ── */}
      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          allJobs={jobs}
          onSave={handleSaveJob}
          isSaved={savedJobIds.has(String(selectedJob.id))}
        />
      )}

    </div>
  );
}

// ─── Active Filter Tags ─────────────────────────────────────────
function ActiveFilterTags({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}) {
  const { t } = useI18n();
  const tags: { label: string; onRemove: () => void }[] = [];

  if (filters.search) tags.push({ label: `"${filters.search}"`, onRemove: () => onRemove("search") });
  if (filters.region !== "All Regions") tags.push({ label: `${t("filter.region")}: ${filters.region}`, onRemove: () => onRemove("region") });
  if (filters.country !== "All Countries") tags.push({ label: `${t("filter.country")}: ${filters.country}`, onRemove: () => onRemove("country") });
  if (filters.workplace !== "all") tags.push({ label: `${t("filter.workplace")}: ${filters.workplace}`, onRemove: () => onRemove("workplace") });
  if (filters.seniority !== "all") tags.push({ label: `${t("filter.seniority")}: ${filters.seniority}`, onRemove: () => onRemove("seniority") });
  if (filters.commitment !== "all") tags.push({ label: `${t("filter.commitment")}: ${filters.commitment}`, onRemove: () => onRemove("commitment") });
  if (filters.industry !== "All Industries") tags.push({ label: `${t("filter.industry")}: ${filters.industry}`, onRemove: () => onRemove("industry") });
  if (filters.datePosted !== "all") {
    const d = datePostedOptions.find((o) => o.value === filters.datePosted);
    if (d) tags.push({ label: `${t("filter.date_posted")}: ${d.value === "all" ? t("date_posted.any_time") : d.value === "1" ? t("date_posted.24h") : d.value === "3" ? t("date_posted.3d") : d.value === "7" ? t("date_posted.7d") : d.value === "14" ? t("date_posted.14d") : d.value === "30" ? t("date_posted.30d") : d.label}`, onRemove: () => onRemove("datePosted") });
  }
  if (filters.salaryMin > 0 || filters.salaryMax < 300000) tags.push({ label: `${t("filter.salary_range")}: $${(filters.salaryMin/1000).toFixed(0)}K-$${(filters.salaryMax/1000).toFixed(0)}K`, onRemove: () => { onRemove("salaryMin"); onRemove("salaryMax"); } });
  if (filters.excludeStaffing) tags.push({ label: t("filter.staffing_tag"), onRemove: () => onRemove("excludeStaffing") });

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {tags.map((tag) => (
        <span
          key={tag.label}
          className="inline-flex items-center gap-1 text-[11px] bg-primary-light dark:bg-primary/15 text-primary dark:text-white border border-primary/20 dark:border-primary/30 px-2 py-0.5 rounded font-medium"
        >
          {tag.label}
          <button onClick={tag.onRemove} className="hover:text-primary-dark dark:hover:text-primary-lighter">
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-[11px] text-gray-600 dark:text-gray-400 hover:text-danger ml-0.5 underline"
      >
        {t("filter.clear_all")}
      </button>
    </div>
  );
}

// ─── Salary Slider ──────────────────────────────────────────────
function SalarySlider({
  min, max, onChange,
}: {
  min: number; max: number;
  onChange: (min: number, max: number) => void;
}) {
  const formatK = (v: number) => `$${(v / 1000).toFixed(0)}K`;
  const MIN_VAL = 0;
  const MAX_VAL = 300000;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
        <span>{formatK(min)}</span>
        <span>{formatK(max)}</span>
      </div>
      <div className="relative h-1.5">
        <div className="absolute inset-0 bg-gray-200 dark:bg-dark-border rounded-full" />
        <div
          className="absolute h-1.5 bg-primary rounded-full"
          style={{
            left: `${((min - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100}%`,
            right: `${100 - ((max - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={MIN_VAL}
          max={MAX_VAL}
          step={5000}
          value={min}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v <= max) onChange(v, max);
          }}
          className="absolute inset-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm"
        />
        <input
          type="range"
          min={MIN_VAL}
          max={MAX_VAL}
          step={5000}
          value={max}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v >= min) onChange(min, v);
          }}
          className="absolute inset-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm"
        />
      </div>
    </div>
  );
}

// ─── Wrapper with Suspense ──────────────────────────────────────
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}



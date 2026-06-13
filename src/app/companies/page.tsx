"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/i18n/context";
import {
  Search,
  MapPin,
  Briefcase,
  ChevronDown,
  Building2,
  Users,
  Star,
  ExternalLink,
  Sun,
  Moon,
  Bell,
  X,
  ChevronLeft,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";

// ─── Sample Company Data ────────────────────────────────────────
interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  region: string;
  employees: string;
  openJobs: number;
  rating: number;
  description: string;
  featured: boolean;
  tags: string[];
}

const companies: Company[] = [
  {
    id: 1, name: "TechCorp", logo: "TC", industry: "Software & Technology",
    location: "Lagos, Nigeria", region: "Africa", employees: "500-1,000", openJobs: 12,
    rating: 4.5, featured: true,
    description: "Leading African tech company building the next generation of fintech and enterprise software solutions.",
    tags: ["Fintech", "Cloud", "AI"],
  },
  {
    id: 2, name: "BrandBoost", logo: "BB", industry: "Marketing & Advertising",
    location: "Nairobi, Kenya", region: "Africa", employees: "200-500", openJobs: 5,
    rating: 4.2, featured: false,
    description: "Full-service digital marketing agency helping brands scale across emerging markets.",
    tags: ["Digital", "Branding", "Analytics"],
  },
  {
    id: 3, name: "SteelWorks Ltd", logo: "SW", industry: "Construction & Trades",
    location: "Dubai, UAE", region: "Middle East", employees: "1,000-5,000", openJobs: 18,
    rating: 4.0, featured: true,
    description: "Premier steel fabrication and construction company serving the Middle East and North Africa.",
    tags: ["Fabrication", "Infrastructure", "Engineering"],
  },
  {
    id: 4, name: "DataFlow AI", logo: "DF", industry: "AI & Machine Learning",
    location: "Karachi, Pakistan", region: "Asia", employees: "100-200", openJobs: 8,
    rating: 4.7, featured: true,
    description: "AI-first company building data pipelines and ML models for global enterprises.",
    tags: ["ML", "Big Data", "Automation"],
  },
  {
    id: 5, name: "PowerGrid Solutions", logo: "PG", industry: "Energy & Utilities",
    location: "Johannesburg, South Africa", region: "Africa", employees: "5,000+", openJobs: 25,
    rating: 3.8, featured: false,
    description: "Africa's largest energy infrastructure company, powering homes and industries across the continent.",
    tags: ["Energy", "Infrastructure", "Sustainability"],
  },
  {
    id: 6, name: "InnoVentures", logo: "IV", industry: "SaaS & Cloud",
    location: "London, UK", region: "Europe", employees: "200-500", openJobs: 15,
    rating: 4.6, featured: true,
    description: "Venture-backed SaaS company building collaboration tools for distributed teams.",
    tags: ["SaaS", "Collaboration", "Remote"],
  },
  {
    id: 7, name: "ClimateCare Inc", logo: "CC", industry: "Construction & Trades",
    location: "Riyadh, Saudi Arabia", region: "Middle East", employees: "500-1,000", openJobs: 10,
    rating: 4.1, featured: false,
    description: "HVAC and climate control solutions provider for commercial and residential projects.",
    tags: ["HVAC", "Maintenance", "Facilities"],
  },
  {
    id: 8, name: "UX Studio", logo: "UX", industry: "Design & Creative",
    location: "Kigali, Rwanda", region: "Africa", employees: "50-100", openJobs: 4,
    rating: 4.8, featured: false,
    description: "Design-led consultancy crafting world-class digital experiences for global brands.",
    tags: ["UX/UI", "Design", "Research"],
  },
  {
    id: 9, name: "MediCare Health", logo: "MH", industry: "Healthcare & Medical",
    location: "Accra, Ghana", region: "Africa", employees: "1,000-5,000", openJobs: 30,
    rating: 4.3, featured: true,
    description: "Leading healthcare provider with hospitals and clinics across West Africa.",
    tags: ["Healthcare", "Medical", "Patient Care"],
  },
  {
    id: 10, name: "SecureNet", logo: "SN", industry: "Cybersecurity",
    location: "Abuja, Nigeria", region: "Africa", employees: "100-200", openJobs: 6,
    rating: 4.4, featured: false,
    description: "Cybersecurity firm protecting African enterprises from digital threats.",
    tags: ["Security", "Penetration Testing", "Compliance"],
  },
  {
    id: 11, name: "CloudStack", logo: "CS", industry: "SaaS & Cloud",
    location: "Toronto, Canada", region: "North America", employees: "500-1,000", openJobs: 20,
    rating: 4.5, featured: true,
    description: "Cloud infrastructure platform powering startups and enterprises worldwide.",
    tags: ["Cloud", "DevOps", "Kubernetes"],
  },
  {
    id: 12, name: "BuildCorp Africa", logo: "BC", industry: "Construction & Trades",
    location: "Algiers, Algeria", region: "Africa", employees: "5,000+", openJobs: 45,
    rating: 3.9, featured: false,
    description: "Major construction and civil engineering firm operating across North and Sub-Saharan Africa.",
    tags: ["Construction", "Civil Engineering", "Infrastructure"],
  },
  {
    id: 13, name: "GreenEnergy Co", logo: "GE", industry: "Energy & Utilities",
    location: "Casablanca, Morocco", region: "Africa", employees: "200-500", openJobs: 7,
    rating: 4.2, featured: false,
    description: "Renewable energy company specializing in solar and wind power installations.",
    tags: ["Solar", "Renewable", "Clean Energy"],
  },
  {
    id: 14, name: "Quantum AI", logo: "QA", industry: "AI & Machine Learning",
    location: "Berlin, Germany", region: "Europe", employees: "50-100", openJobs: 9,
    rating: 4.9, featured: true,
    description: "Cutting-edge AI research lab pushing the boundaries of deep learning and quantum computing.",
    tags: ["Deep Learning", "NLP", "Computer Vision"],
  },
  {
    id: 15, name: "SaaSify", logo: "SF", industry: "SaaS & Cloud",
    location: "Lagos, Nigeria", region: "Africa", employees: "100-200", openJobs: 11,
    rating: 4.3, featured: false,
    description: "African SaaS platform helping businesses digitize their operations and workflows.",
    tags: ["SaaS", "Digital Transformation", "Enterprise"],
  },
];

const industries = [
  "All Industries",
  "Software & Technology",
  "AI & Machine Learning",
  "Fintech & Finance",
  "Healthcare & Medical",
  "Cybersecurity",
  "SaaS & Cloud",
  "Construction & Trades",
  "Marketing & Advertising",
  "Energy & Utilities",
  "Design & Creative",
  "Logistics & Transportation",
];

const regions = ["All Regions", "Asia", "Africa", "Europe", "North America", "Middle East"];

// ─── Company Job type ───────────────────────────────────────────
interface CompanyJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workplace: string;
  seniority: string;
  salary_min: number | null;
  salary_max: number | null;
  external_url: string | null;
  posted: string;
}

// ─── Company Drawer ─────────────────────────────────────────────
function CompanyDrawer({ company, onClose }: { company: Company; onClose: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 150);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/jobs?company=${encodeURIComponent(company.name)}&limit=20`)
      .then((r) => r.json())
      .then((data) => { setJobs(data.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [company.name]);

  // Format salary
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

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
            Back to Companies
          </button>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 dark:text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Company header */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shrink-0">
                {company.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
                  {company.featured && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={13} />{company.location}</span>
                  <span className="flex items-center gap-1"><Users size={13} />{company.employees}</span>
                  <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" fill="currentColor" />{company.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{company.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-1 rounded-md font-medium">{company.industry}</span>
              {company.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Jobs section */}
          <div className="px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Open Positions
              {!loading && (
                <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                  ({jobs.length} found)
                </span>
              )}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No open positions found for {company.name}.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back later or explore other companies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const salary = formatSalary(job.salary_min, job.salary_max);
                  return (
                    <a
                      key={job.id}
                      href={job.external_url || `/?job=${job.id}`}
                      target={job.external_url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="block group bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors leading-snug">
                          {job.title}
                        </h4>
                        <ExternalLink size={14} className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors mt-0.5" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                        {job.type && <span className="capitalize">{job.type}</span>}
                        {job.workplace && job.workplace !== "onsite" && (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">{job.workplace}</span>
                        )}
                        {salary && <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300"><DollarSign size={11} />{salary}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md capitalize">{job.seniority}</span>
                        {job.posted && <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1"><Clock size={10} />{job.posted}</span>}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-dark-border shrink-0">
          <a
            href={`/?search=${encodeURIComponent(company.name)}`}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            <Search size={16} />
            Search All {company.name} Jobs
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Company Card ───────────────────────────────────────────────

function CompanyCard({ company, onClick }: { company: Company; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <div onClick={onClick} className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-lg dark:hover:shadow-black/30 hover:border-primary/30 dark:hover:border-primary/50 transition-all cursor-pointer animate-fade-in">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shrink-0">
          {company.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary transition-colors truncate">
              {company.name}
            </h3>
            {company.featured && (
              <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                {t("badge.featured")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MapPin size={13} />{company.location}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" fill="currentColor" />{company.rating}</span>
          </div>
        </div>
        <button className="shrink-0 p-2 rounded-lg border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-hover hover:text-primary dark:hover:text-primary transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{company.description}</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md font-medium">{company.industry}</span>
        <span className="text-xs bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
          <Users size={12} />{company.employees}
        </span>
        <span className="text-xs bg-primary-light/40 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-1 rounded-md font-medium">
          {company.openJobs} {t("page.companies.open_jobs")}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {company.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-50 dark:bg-dark-surface text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-100 dark:border-dark-border">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Companies Page ────────────────────────────────────────
export default function CompaniesPage() {
  const { t } = useI18n();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [region, setRegion] = useState("All Regions");
  const [sort, setSort] = useState("name");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filtered = companies
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.description.toLowerCase().includes(search.toLowerCase()) &&
          !c.industry.toLowerCase().includes(search.toLowerCase()) &&
          !c.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (industry !== "All Industries" && c.industry !== industry) return false;
      if (region !== "All Regions" && c.region !== region) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "jobs") return b.openJobs - a.openJobs;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 header-glass border-b border-gray-200/60 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Career<span className="text-primary">Portal</span>
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">{t("nav.find_job")}</a>
              <button className="text-sm font-semibold text-primary dark:text-primary-light flex items-center gap-1.5 bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 dark:border-primary/30">
                <Building2 size={14} />
                {t("nav.browse_companies")}
              </button>
              <a href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center gap-1">
                <Bell size={16} />{t("nav.job_alerts")}
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a href="/sign-in" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors hidden sm:block">{t("nav.sign_in")}</a>
              <a href="/post-job" className="text-sm font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-4 py-2 rounded-lg hover:bg-primary/15 dark:hover:bg-primary/30 transition-colors hidden lg:block">{t("nav.post_job")}</a>
              <a href="/signup" className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">{t("nav.find_job")}</a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-3d pt-12 pb-16 relative">
        <div className="hero-mesh-overlay" />
        <div className="hero-grid-overlay" />
        <div className="hero-orb-3d hero-orb-3d-1" />
        <div className="hero-orb-3d hero-orb-3d-2" />
        <div className="hero-orb-3d hero-orb-3d-3" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {t("page.companies.title")}
            </h1>
            <p className="text-white/60">
              {t("page.companies.subtitle")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="search-glass-3d rounded-xl p-3 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder={t("page.companies.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 focus:border-white/30 text-sm outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm appearance-none cursor-pointer min-w-[160px] transition-colors"
                >
                  {industries.map((i) => (<option key={i} className="text-gray-900">{i}</option>))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm appearance-none cursor-pointer min-w-[130px] transition-colors"
                >
                  {regions.map((r) => (<option key={r} className="text-gray-900">{r}</option>))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {filtered.length} {filtered.length === 1 ? t("page.companies.stats_companies").replace("companies", "company") : t("page.companies.stats_companies")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {industry !== "All Industries" && `${industry} • `}
              {region !== "All Regions" && `${region} • `}
              Updated just now
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 transition-colors"
          >
            <option value="name">{t("page.companies.sort_name")}</option>
            <option value="jobs">{t("page.companies.sort_jobs")}</option>
            <option value="rating">{t("page.companies.sort_rating")}</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => <CompanyCard key={c.id} company={c} onClick={() => setSelectedCompany(c)} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t("page.companies.no_results")}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t("page.companies.no_results_hint")}</p>
            <button onClick={() => { setSearch(""); setIndustry("All Industries"); setRegion("All Regions"); }}
              className="text-sm font-medium text-primary dark:text-primary-light hover:underline">{t("page.companies.clear_filters")}</button>
          </div>
        )}
      </section>

      {/* ── Company Drawer ── */}
      {selectedCompany && (
        <CompanyDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {/* ── Stats Strip ── */}
      <section className="bg-gray-50 dark:bg-dark-surface py-14 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">15+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("page.companies.stats_companies")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">225+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("page.companies.stats_jobs")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("page.companies.stats_industries")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">18</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("page.companies.stats_countries")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-4">{t("footer.for_candidates")}</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.browse_jobs")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("nav.job_alerts")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.career_advice")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.skill_assessments")}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-4">{t("footer.for_employers")}</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("nav.post_job")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.talent_pool")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.recruiter_crm")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.ats_integration")}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-4">{t("footer.company")}</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.about")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.blog")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.contact")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.press")}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-semibold mb-4">{t("footer.support")}</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.help_center")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.privacy")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.terms")}</li>
                <li className="hover:text-white dark:hover:text-gray-300 cursor-pointer transition-colors">{t("footer.cookies")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              <span className="text-white dark:text-gray-100 font-bold text-sm">CareerPortal</span>
            </div>
            <p className="text-xs">© 2025 {t("site.title")}. {t("footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

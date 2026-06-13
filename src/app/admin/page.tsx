"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Briefcase,
  Eye,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Globe,
  Download,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Search,
  Settings,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "24,891",
    change: "+12.5%",
    up: true,
    icon: <Users size={18} />,
    color: "bg-blue-500",
  },
  {
    label: "Active Jobs",
    value: "8,432",
    change: "+8.2%",
    up: true,
    icon: <Briefcase size={18} />,
    color: "bg-emerald-500",
  },
  {
    label: "Applications",
    value: "142,567",
    change: "+23.1%",
    up: true,
    icon: <Eye size={18} />,
    color: "bg-purple-500",
  },
  {
    label: "Revenue (MTD)",
    value: "$48,290",
    change: "-3.1%",
    up: false,
    icon: <DollarSign size={18} />,
    color: "bg-amber-500",
  },
];

const monthlyChart = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  jobs: [320, 450, 520, 610, 580, 720, 810, 890, 940, 1020, 1150, 1240],
  applicants: [2800, 3200, 4100, 4800, 5300, 6200, 7100, 7800, 8500, 9200, 10100, 11200],
};

const maxApplicants = Math.max(...monthlyChart.applicants);
const maxJobs = Math.max(...monthlyChart.jobs);

const recentJobs = [
  { title: "Senior Frontend Engineer", company: "TechCorp", location: "Lagos, Nigeria", applications: 48, posted: "2 days ago", status: "active" },
  { title: "Marketing Manager", company: "BrandBoost", location: "Nairobi, Kenya", applications: 32, posted: "1 week ago", status: "active" },
  { title: "Data Scientist", company: "DataFlow AI", location: "Karachi, Pakistan", applications: 67, posted: "Just now", status: "active" },
  { title: "Full Stack Developer", company: "InnoVentures", location: "London, UK", applications: 94, posted: "1 day ago", status: "active" },
  { title: "DevOps Engineer", company: "CloudStack", location: "Toronto, Canada", applications: 23, posted: "3 days ago", status: "paused" },
];

const topEmployers = [
  { name: "TechCorp", jobs: 24, hires: 12, spend: "$12,400" },
  { name: "DataFlow AI", jobs: 18, hires: 9, spend: "$9,800" },
  { name: "BrandBoost", jobs: 15, hires: 7, spend: "$7,200" },
  { name: "InnoVentures", jobs: 12, hires: 5, spend: "$6,100" },
  { name: "CloudStack", jobs: 10, hires: 4, spend: "$5,300" },
];

const BACKFILL_COUNTRIES = [
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "sg", name: "Singapore" },
  { code: "nz", name: "New Zealand" },
  { code: "za", name: "South Africa" },

  { code: "nl", name: "Netherlands" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "br", name: "Brazil" },
  { code: "at", name: "Austria" },
  { code: "be", name: "Belgium" },
  { code: "ch", name: "Switzerland" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "lu", name: "Luxembourg" },
  { code: "no", name: "Norway" },
  { code: "pl", name: "Poland" },
  { code: "se", name: "Sweden" },
];

interface BackfillStatus {
  running: boolean;
  lastRun: string | null;
  totalFetched: number;
  totalInserted: number;
  errors: string[];
  progress: { country: string; fetched: number }[];
}

export default function AdminAnalytics() {
  const [showChart, setShowChart] = useState(true);
  const [showBackfill, setShowBackfill] = useState(false);

  // Backfill state
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["gb", "us", "ca", "in", "za", "sg", "au"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagesToFetch, setPagesToFetch] = useState(2);
  const [whatKeyword, setWhatKeyword] = useState("");
  const [backfillStatus, setBackfillStatus] = useState<BackfillStatus | null>(null);
  const [polling, setPolling] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/programmatic");
      const data = await res.json();
      setBackfillStatus(data.status);
      if (data.status.running) {
        setTimeout(pollStatus, 2000);
      } else {
        setPolling(false);
      }
    } catch {
      setPolling(false);
    }
  }, []);

  const startBackfill = async () => {
    if (selectedCountries.length === 0) return;
    setPolling(true);
    setShowBackfill(true);

    try {
      const res = await fetch("/api/programmatic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countries: selectedCountries,
          what: whatKeyword,
          pages: pagesToFetch,
          resultsPerPage: 50,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setTimeout(pollStatus, 2000);
      }
    } catch (err) {
      console.error("Backfill start error:", err);
      setPolling(false);
    }
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Poll on mount if a backfill is already running
  useEffect(() => {
    pollStatus();
  }, [pollStatus]);

  const filteredCountries = BACKFILL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform overview and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-white`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Programmatic Backfill Section */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <button
          onClick={() => setShowBackfill(!showBackfill)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Database size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Programmatic Job Backfill
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Import jobs from Adzuna API into your database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backfillStatus?.running && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                <RefreshCw size={12} className="animate-spin" />
                Running
              </span>
            )}
            {backfillStatus?.lastRun && !backfillStatus.running && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} />
                Ready
              </span>
            )}
            {showBackfill ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </button>

        {showBackfill && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-dark-border pt-4">
            {/* Running indicator */}
            {backfillStatus?.running && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw size={16} className="animate-spin text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Backfill in progress...
                  </span>
                </div>
                {backfillStatus.progress.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {backfillStatus.progress.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Globe size={12} className="shrink-0" />
                        <span>{p.country}:</span>
                        <span className="font-medium">{p.fetched} fetched</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Total: {backfillStatus.totalFetched} fetched, {backfillStatus.totalInserted} inserted
                </div>
              </div>
            )}

            {/* Last run summary */}
            {backfillStatus?.lastRun && !backfillStatus.running && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last backfill completed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(backfillStatus.lastRun).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <p><span className="font-medium text-gray-900 dark:text-white">{backfillStatus.totalFetched}</span> fetched</p>
                    <p><span className="font-medium text-gray-900 dark:text-white">{backfillStatus.totalInserted}</span> inserted</p>
                  </div>
                </div>
                {backfillStatus.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                      {backfillStatus.errors.length} error(s):
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {backfillStatus.errors.map((err, i) => (
                        <p key={i} className="text-[11px] text-red-500 dark:text-red-400 truncate">
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Search keyword */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Search Keyword (optional)
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. software engineer, nurse..."
                    value={whatKeyword}
                    onChange={(e) => setWhatKeyword(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              {/* Pages to fetch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Pages per Country
                </label>
                <select
                  value={pagesToFetch}
                  onChange={(e) => setPagesToFetch(Number(e.target.value))}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value={1}>1 page (~50 jobs)</option>
                  <option value={2}>2 pages (~100 jobs)</option>
                  <option value={3}>3 pages (~150 jobs)</option>
                  <option value={5}>5 pages (~250 jobs)</option>
                  <option value={10}>10 pages (~500 jobs)</option>
                </select>
              </div>

              {/* Quick select all */}
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setSelectedCountries(
                      selectedCountries.length === BACKFILL_COUNTRIES.length
                        ? []
                        : BACKFILL_COUNTRIES.map((c) => c.code)
                    )
                  }
                  className="h-9 px-4 text-xs font-medium rounded-lg border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                >
                  {selectedCountries.length === BACKFILL_COUNTRIES.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            </div>

            {/* Country selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Target Countries ({selectedCountries.length} selected)
                </label>
                <div className="relative w-48">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-7 pl-7 pr-2.5 text-xs rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-dark-hover rounded-lg">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    disabled={backfillStatus?.running}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedCountries.includes(country.code)
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:border-primary/50"
                    } ${backfillStatus?.running ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedCountries.includes(country.code) ? "bg-white" : "bg-gray-300 dark:bg-gray-600"
                    }`}></span>
                    {country.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimated: ~{selectedCountries.length * pagesToFetch * 50} jobs from {selectedCountries.length} countries
              </p>
              <button
                onClick={startBackfill}
                disabled={backfillStatus?.running || selectedCountries.length === 0}
                className={`flex items-center gap-2 px-5 h-10 rounded-lg font-medium text-sm transition-all ${
                  backfillStatus?.running || selectedCountries.length === 0
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                }`}
              >
                {backfillStatus?.running ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Backfilling...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Start Backfill
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
        <button
          onClick={() => setShowChart(!showChart)}
          className="w-full flex items-center justify-between p-5"
        >
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Growth Trends</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Monthly jobs posted vs applicants
            </p>
          </div>
          {showChart ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        {showChart && (
          <div className="px-5 pb-5">
            <div className="flex gap-8 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Jobs Posted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Applicants</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-40">
              {monthlyChart.jobs.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-purple-500/70 dark:bg-purple-500/50 rounded-t"
                    style={{ height: `${(monthlyChart.applicants[i] / maxApplicants) * 100}%` }}
                  ></div>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(val / maxJobs) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {monthlyChart.labels.map((l, i) => (
                <span key={i} className="text-[10px] text-gray-400 dark:text-gray-500 flex-1 text-center">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
          <div className="p-5 border-b border-gray-100 dark:border-dark-border">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Job Postings</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {recentJobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company} • {job.location}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{job.applications} apps</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    job.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Employers */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
          <div className="p-5 border-b border-gray-100 dark:border-dark-border">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Employers</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {topEmployers.map((emp, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {emp.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{emp.jobs} active jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.hires} hires</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{emp.spend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

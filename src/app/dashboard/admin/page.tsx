"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/lib/theme-context";

// ─── Conversation type ────────────────────────────────────────────
interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user: { id: string; full_name: string | null; email: string | null; role: string | null; };
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender: { full_name: string | null; role: string | null; };
  is_mine: boolean;
}
import {
  Briefcase, Users, LayoutDashboard, LogOut, Sun, Moon,
  Loader2, ChevronLeft, X, ExternalLink, FileText,
  MapPin, Globe, Building2, Check, Shield,
  MousePointerClick, Bell, Clock, ChevronRight,
  Eye, Search, Filter, Activity, TrendingUp,
  Calendar, ArrowUp, ArrowDown,
  MessageSquare, Send, MoreHorizontal, CheckCheck, Bell as BellIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
type AdminTab = "analytics" | "recruiters" | "jobseekers" | "messages";

interface AdminRecruiter {
  id: string;
  full_name: string | null;
  email: string | null;
  linkedin_url: string | null;
  created_at: string;
  company_name: string | null;
  company_website: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_description: string | null;
  title: string | null;
  access_request: { id: string; status: string; created_at: string; message: string | null; } | null;
}

interface AdminJobSeeker {
  id: string;
  full_name: string | null;
  email: string | null;
  linkedin_url: string | null;
  created_at: string;
  headline: string | null;
  skills: string[] | null;
  location: string | null;
  is_open_to_work: boolean;
  cv_url: string | null;
  desired_job_type: string | null;
  desired_workplace: string | null;
  click_count: number;
}

interface AnalyticsData {
  uniqueVisitors: number;
  totalViews: number;
  jobViews: number;
  jobClicks: number;
  todayViews: number;
  topCountries: { country: string; count: number }[];
  topViewedJobs: { job_id: string; views: number }[];
  topClickedJobs: { job_id: string; clicks: number }[];
}

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({
  activeTab, setActiveTab, profile, signOut,
  pendingCount, unreadMessages,
}: {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  profile: { full_name: string | null; email: string | null } | null;
  signOut: () => void;
  pendingCount: number;
  unreadMessages: number;
}) {
  const { isDark, toggle } = useTheme();
  const nav: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "analytics",   label: "Analytics",    icon: <Activity size={18} /> },
    { id: "messages",    label: "Messages",    icon: <MessageSquare size={18} />, badge: unreadMessages },
    { id: "recruiters",  label: "Recruiters",   icon: <Building2 size={18} />, badge: pendingCount },
    { id: "jobseekers",  label: "Job Seekers",  icon: <Users size={18} /> },
  ];

  return (
    <aside className="w-64 shrink-0 dash-sidebar dash-sidebar-border flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-4 border-b border-white/10">
        <a href="/" className="flex items-center">
          <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
        </a>
      </div>

      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm mb-2">
          {profile?.full_name?.charAt(0).toUpperCase() || "A"}
        </div>
        <p className="text-sm font-semibold text-white truncate">{profile?.full_name || "Admin"}</p>
        <p className="text-xs text-white/40 truncate">{profile?.email}</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full mt-1.5">
          <Shield size={9} /> Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id ? "bg-indigo-500/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}>
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge ? (
              <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Briefcase size={18} /> Browse Jobs
        </a>
        <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Search Input Component ──────────────────────────────────────
function SearchInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-white pl-8 pr-3 py-1.5 
          placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-colors"
      />
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────
function AnalyticsTab() {
  const supabase = createClient();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/track");
        if (res.ok) setData(await res.json());
      } catch { /* */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;
  if (!data) return <div className="text-center py-20 text-white/40">No analytics data yet. Start browsing the site!</div>;

  const cards = [
    { label: "Unique Visitors",  value: data.uniqueVisitors.toLocaleString(), icon: <Users size={20} />, color: "from-blue-500 to-indigo-600" },
    { label: "Total Page Views", value: data.totalViews.toLocaleString(),     icon: <Eye size={20} />,    color: "from-violet-500 to-purple-600" },
    { label: "Job Views",        value: data.jobViews.toLocaleString(),       icon: <Briefcase size={20} />, color: "from-emerald-500 to-teal-600" },
    { label: "Job Clicks",       value: data.jobClicks.toLocaleString(),      icon: <MousePointerClick size={20} />, color: "from-amber-500 to-orange-600" },
    { label: "Today",            value: data.todayViews.toLocaleString(),     icon: <Calendar size={20} />, color: "from-rose-500 to-pink-600" },
  ];

  const maxCountry = Math.max(...data.topCountries.map(c => c.count), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Analytics</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(card => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/40 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Top Countries */}
      {data.topCountries.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe size={14} /> Visitors by Country
          </h3>
          <div className="space-y-2">
            {data.topCountries.map(({ country, count }) => (
              <div key={country} className="flex items-center gap-3">
                <span className="text-sm text-white/70 w-28 shrink-0 truncate">{country}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCountry) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/50 w-12 text-right shrink-0">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Viewed Jobs */}
      {data.topViewedJobs.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Eye size={14} /> Most Viewed Jobs
          </h3>
          <div className="space-y-2">
            {data.topViewedJobs.map(({ job_id, views }, i) => (
              <div key={job_id} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-6">{i + 1}.</span>
                <a href={`/jobs/${job_id}`} className="text-sm text-blue-300 hover:text-blue-200 flex-1 truncate" target="_blank">
                  {job_id.slice(0, 8)}...
                </a>
                <span className="text-xs text-white/50">{views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Clicked Jobs */}
      {data.topClickedJobs.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MousePointerClick size={14} /> Most Clicked Jobs (external links)
          </h3>
          <div className="space-y-2">
            {data.topClickedJobs.map(({ job_id, clicks }, i) => (
              <div key={job_id} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-6">{i + 1}.</span>
                <a href={`/jobs/${job_id}`} className="text-sm text-blue-300 hover:text-blue-200 flex-1 truncate" target="_blank">
                  {job_id.slice(0, 8)}...
                </a>
                <span className="text-xs text-white/50">{clicks} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topCountries.length === 0 && data.topViewedJobs.length === 0 && data.topClickedJobs.length === 0 && (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
          <Activity size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No analytics data collected yet. Browse the site to generate data.</p>
        </div>
      )}
    </div>
  );
}

// ─── Searchable Table ────────────────────────────────────────────
function SearchableTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage,
  rowHeight = "compact",
}: {
  columns: { key: string; label: string; render: (item: T) => React.ReactNode; sortable?: boolean }[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  rowHeight?: "compact" | "normal";
}) {
  // Per-column search
  const [searches, setSearches] = useState<Record<string, string>>({});
  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const setSearch = (key: string, value: string) => {
    setSearches(prev => ({ ...prev, [key]: value }));
  };

  const filtered = useMemo(() => {
    let result = [...data];

    // Apply per-column filters
    Object.entries(searches).forEach(([key, query]) => {
      if (!query.trim()) return;
      const q = query.toLowerCase();
      result = result.filter(item => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });

    // Apply sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searches, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const hasActiveFilters = Object.values(searches).some(s => s.trim().length > 0);

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map(col => (
                <th key={col.key} className="text-left py-2 pr-4">
                  <div className="space-y-1">
                    <button
                      onClick={() => col.sortable !== false && toggleSort(col.key)}
                      className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                        sortKey === col.key ? "text-primary" : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                      )}
                    </button>
                    <SearchInput
                      value={searches[col.key] || ""}
                      onChange={v => setSearch(col.key, v)}
                      placeholder={`Filter ${col.label.toLowerCase()}...`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-white/20" />
                    <p className="text-white/40 text-sm">
                      {hasActiveFilters ? "No results match your filters." : (emptyMessage || "No data.")}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={() => setSearches({})}
                        className="text-xs text-primary hover:text-primary-light transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr
                  key={item.id || i}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-white/[0.04] transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`pr-4 ${rowHeight === "compact" ? "py-2" : "py-3"}`}>
                      <div className="text-sm text-white/80 truncate max-w-[250px]">
                        {col.render(item)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 text-xs text-white/30">
        <span>{filtered.length} of {data.length} results</span>
        {hasActiveFilters && (
          <button onClick={() => setSearches({})} className="text-primary hover:text-primary-light transition-colors">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Recruiter Drawer ─────────────────────────────────────────────
function RecruiterDrawer({
  recruiter, onClose, onStatusChange,
}: {
  recruiter: AdminRecruiter;
  onClose: () => void;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
}) {
  const supabase = createClient();
  const [updating, setUpdating] = useState<"approved" | "rejected" | null>(null);
  const [exiting, setExiting] = useState(false);

  const handleClose = () => { setExiting(true); setTimeout(onClose, 150); };

  const updateRequest = async (status: "approved" | "rejected") => {
    setUpdating(status);
    await supabase.from("talent_access_requests")
      .update({ status })
      .eq("recruiter_id", recruiter.id);
    onStatusChange(recruiter.id, status);
    setUpdating(null);
  };

  const req = recruiter.access_request;
  const reqStatus = req?.status;

  return (
    <>
      <div onClick={handleClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${exiting ? "opacity-0" : "opacity-100"}`} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-dark-surface border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-150 ${exiting ? "translate-x-full" : "translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <button onClick={handleClose} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {recruiter.full_name?.charAt(0).toUpperCase() || "R"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">{recruiter.full_name || "Unknown"}</h2>
              {recruiter.title && <p className="text-sm text-white/60">{recruiter.title}</p>}
              <p className="text-sm text-blue-300 mt-0.5 break-all">{recruiter.email}</p>
              <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
                <Clock size={11} /> Joined {new Date(recruiter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {req && (
            <div className={`rounded-xl border p-4 space-y-3 ${
              reqStatus === "pending"  ? "bg-amber-500/10 border-amber-500/30" :
              reqStatus === "approved" ? "bg-emerald-500/10 border-emerald-500/30" :
              "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Talent Pool Access Request</p>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  reqStatus === "pending"  ? "bg-amber-500/20 text-amber-300" :
                  reqStatus === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                  "bg-red-500/20 text-red-300"
                }`}>
                  {reqStatus}
                </span>
              </div>
              {req.message && <p className="text-sm text-white/60">{req.message}</p>}
              <p className="text-xs text-white/40">Requested {new Date(req.created_at).toLocaleDateString()}</p>
              {reqStatus === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => updateRequest("approved")} disabled={updating !== null}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60 transition-colors">
                    {updating === "approved" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
                  </button>
                  <button onClick={() => updateRequest("rejected")} disabled={updating !== null}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60 transition-colors">
                    {updating === "rejected" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Reject
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Company</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              {recruiter.company_name && (
                <div className="flex items-center gap-3">
                  <Building2 size={15} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white">{recruiter.company_name}</span>
                </div>
              )}
              {recruiter.company_industry && (
                <div className="flex items-center gap-3">
                  <Briefcase size={15} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white/80">{recruiter.company_industry}</span>
                </div>
              )}
              {recruiter.company_size && (
                <div className="flex items-center gap-3">
                  <Users size={15} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white/80">{recruiter.company_size}</span>
                </div>
              )}
              {recruiter.company_website && (
                <a href={recruiter.company_website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                  <Globe size={15} className="shrink-0" />
                  <span className="text-sm truncate">{recruiter.company_website}</span>
                </a>
              )}
              {recruiter.linkedin_url && (
                <a href={recruiter.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                  <ExternalLink size={15} className="shrink-0" />
                  <span className="text-sm">LinkedIn Profile</span>
                </a>
              )}
              {recruiter.company_description && (
                <p className="text-sm text-white/60 leading-relaxed pt-1 border-t border-white/10">
                  {recruiter.company_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Job Seeker Drawer ────────────────────────────────────────────
function JobSeekerDrawer({ seeker, onClose }: { seeker: AdminJobSeeker; onClose: () => void }) {
  const [exiting, setExiting] = useState(false);
  const handleClose = () => { setExiting(true); setTimeout(onClose, 150); };

  return (
    <>
      <div onClick={handleClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${exiting ? "opacity-0" : "opacity-100"}`} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-dark-surface border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-150 ${exiting ? "translate-x-full" : "translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <button onClick={handleClose} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {seeker.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{seeker.full_name || seeker.email?.split("@")[0] || "Anonymous"}</h2>
                {seeker.is_open_to_work && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Open to Work</span>
                )}
              </div>
              {seeker.headline && <p className="text-sm text-white/60 mt-0.5">{seeker.headline}</p>}
              {seeker.location && <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><MapPin size={11} />{seeker.location}</p>}
              <p className="text-sm text-blue-300 mt-1 break-all">{seeker.email}</p>
              <p className="text-xs text-white/30 mt-1 flex items-center gap-1"><Clock size={11} /> Joined {new Date(seeker.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <MousePointerClick size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{seeker.click_count}</p>
              <p className="text-xs text-white/50">Offsite job link clicks</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Profile</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              {seeker.desired_job_type && (
                <div className="flex items-center gap-3">
                  <Briefcase size={14} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white/80 capitalize">{seeker.desired_job_type}</span>
                </div>
              )}
              {seeker.desired_workplace && seeker.desired_workplace !== "any" && (
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={14} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white/80 capitalize">{seeker.desired_workplace}</span>
                </div>
              )}
              {seeker.linkedin_url && (
                <a href={seeker.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="text-sm">LinkedIn Profile</span>
                </a>
              )}
              {seeker.cv_url && (
                <a href={seeker.cv_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                  <FileText size={14} className="shrink-0" />
                  <span className="text-sm">View CV / Resume</span>
                </a>
              )}
            </div>
          </div>

          {seeker.skills && seeker.skills.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Skills</p>
              <div className="flex flex-wrap gap-2">
                {seeker.skills.map(s => (
                  <span key={s} className="text-xs bg-primary/20 text-blue-300 border border-primary/30 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Recruiters Tab ───────────────────────────────────────────────
function RecruitersTab({ onPendingCountChange }: { onPendingCountChange: (n: number) => void }) {
  const supabase = createClient();
  const [recruiters, setRecruiters] = useState<AdminRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminRecruiter | null>(null);

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: rps }, { data: reqs }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, linkedin_url, created_at").eq("role", "recruiter").order("created_at", { ascending: false }),
      supabase.from("recruiter_profiles").select("id, company_name, company_website, company_industry, company_size, company_description, title"),
      supabase.from("talent_access_requests").select("recruiter_id, id, status, created_at, message"),
    ]);

    const rpMap = new Map((rps || []).map(r => [r.id, r]));
    const reqMap = new Map((reqs || []).map(r => [r.recruiter_id, r]));

    const list: AdminRecruiter[] = (profiles || []).map(p => {
      const rp = rpMap.get(p.id);
      const req = reqMap.get(p.id);
      return {
        ...p,
        company_name: rp?.company_name ?? null,
        company_website: rp?.company_website ?? null,
        company_industry: rp?.company_industry ?? null,
        company_size: rp?.company_size ?? null,
        company_description: rp?.company_description ?? null,
        title: rp?.title ?? null,
        access_request: req ? { id: req.id, status: req.status, created_at: req.created_at, message: req.message ?? null } : null,
      };
    });

    list.sort((a, b) => {
      const aP = a.access_request?.status === "pending" ? 0 : 1;
      const bP = b.access_request?.status === "pending" ? 0 : 1;
      return aP - bP;
    });

    setRecruiters(list);
    onPendingCountChange(list.filter(r => r.access_request?.status === "pending").length);
    setLoading(false);
  }, [supabase, onPendingCountChange]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (recruiterId: string, status: "approved" | "rejected") => {
    setRecruiters(prev => prev.map(r => {
      if (r.id !== recruiterId || !r.access_request) return r;
      return { ...r, access_request: { ...r.access_request, status } };
    }));
    onPendingCountChange(recruiters.filter(r => r.id !== recruiterId && r.access_request?.status === "pending").length);
    if (selected?.id === recruiterId && selected.access_request) {
      setSelected(s => s ? { ...s, access_request: s.access_request ? { ...s.access_request, status } : null } : null);
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "Name",
      render: (r: AdminRecruiter) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
            {r.full_name?.charAt(0).toUpperCase() || "R"}
          </div>
          <span className="font-medium text-white">{r.full_name || "Unknown"}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (r: AdminRecruiter) => <span className="text-white/60">{r.email}</span>,
    },
    {
      key: "company_name",
      label: "Company",
      render: (r: AdminRecruiter) => <span className="text-white/70">{r.company_name || "—"}</span>,
    },
    {
      key: "company_industry",
      label: "Industry",
      render: (r: AdminRecruiter) => <span className="text-white/50 text-xs">{r.company_industry || "—"}</span>,
    },
    {
      key: "title",
      label: "Title",
      render: (r: AdminRecruiter) => <span className="text-white/50 text-xs">{r.title || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r: AdminRecruiter) => {
        const s = r.access_request?.status;
        if (!s) return <span className="text-white/30 text-xs">Active</span>;
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
            s === "pending"  ? "bg-amber-500/20 text-amber-300" :
            s === "approved" ? "bg-emerald-500/20 text-emerald-300" :
            "bg-red-500/20 text-red-300"
          }`}>
            {s}
          </span>
        );
      },
    },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Recruiters</h2>
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <SearchableTable
          columns={columns}
          data={recruiters}
          onRowClick={setSelected}
          emptyMessage="No recruiters registered yet."
        />
      </div>
      {selected && (
        <RecruiterDrawer
          recruiter={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ─── Job Seekers Tab ──────────────────────────────────────────────
function JobSeekersTab() {
  const supabase = createClient();
  const [seekers, setSeekers] = useState<AdminJobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminJobSeeker | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: eps }, { data: clicks }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, linkedin_url, created_at").eq("role", "employee").order("created_at", { ascending: false }),
        supabase.from("employee_profiles").select("id, headline, skills, location, is_open_to_work, cv_url, desired_job_type, desired_workplace"),
        supabase.from("job_clicks").select("user_id").not("user_id", "is", null),
      ]);

      const epMap = new Map((eps || []).map(e => [e.id, e]));
      const clickCounts: Record<string, number> = {};
      (clicks || []).forEach((c: { user_id: string }) => {
        clickCounts[c.user_id] = (clickCounts[c.user_id] || 0) + 1;
      });

      setSeekers(
        (profiles || []).map(p => {
          const ep = epMap.get(p.id);
          return {
            ...p,
            headline: ep?.headline ?? null,
            skills: ep?.skills ?? null,
            location: ep?.location ?? null,
            is_open_to_work: ep?.is_open_to_work ?? false,
            cv_url: ep?.cv_url ?? null,
            desired_job_type: ep?.desired_job_type ?? null,
            desired_workplace: ep?.desired_workplace ?? null,
            click_count: clickCounts[p.id] || 0,
          };
        })
      );
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: "full_name",
      label: "Name",
      render: (s: AdminJobSeeker) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
            {s.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <span className="font-medium text-white block truncate">{s.full_name || s.email?.split("@")[0] || "Unknown"}</span>
            {s.is_open_to_work && (
              <span className="text-[10px] font-semibold text-emerald-400">Open to Work</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (s: AdminJobSeeker) => <span className="text-white/60 text-xs">{s.email}</span>,
    },
    {
      key: "headline",
      label: "Headline",
      render: (s: AdminJobSeeker) => <span className="text-white/50 text-xs truncate block max-w-[180px]">{s.headline || "—"}</span>,
    },
    {
      key: "skills",
      label: "Skills",
      render: (s: AdminJobSeeker) => (
        <div className="flex gap-1 flex-wrap">
          {(s.skills || []).slice(0, 3).map(sk => (
            <span key={sk} className="text-[10px] bg-primary/20 text-blue-300 px-1.5 py-0.5 rounded">{sk}</span>
          ))}
          {(s.skills || []).length > 3 && <span className="text-[10px] text-white/30">+{s.skills!.length - 3}</span>}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (s: AdminJobSeeker) => <span className="text-white/50 text-xs">{s.location || "—"}</span>,
    },
    {
      key: "click_count",
      label: "Clicks",
      render: (s: AdminJobSeeker) => (
        <span className={`text-xs font-medium ${s.click_count > 0 ? "text-amber-400" : "text-white/30"}`}>
          {s.click_count}
        </span>
      ),
      sortable: true,
    },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Job Seekers</h2>
        <span className="text-sm text-white/40">{seekers.length} registered</span>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <SearchableTable
          columns={columns}
          data={seekers}
          onRowClick={setSelected}
          emptyMessage="No job seekers registered yet."
        />
      </div>
      {selected && (
        <JobSeekerDrawer seeker={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ─── Messages Tab ────────────────────────────────────────────────
function MessagesTab() {
  const supabase = createClient();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [recruiters, setRecruiters] = useState<{ id: string; full_name: string | null; email: string | null; }[]>([]);
  const [searchRecruiter, setSearchRecruiter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) setConversations(await res.json());
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const load = async () => {
      const res = await fetch(`/api/messages/${selectedConv}`);
      if (res.ok) setMessages(await res.json());
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load recruiters for new chat
  const loadRecruiters = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "recruiter")
      .order("full_name");
    setRecruiters(data || []);
    setShowNewChat(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConv,
          receiver_id: conversations.find(c => c.id === selectedConv)?.other_user.id,
          content: newMessage.trim(),
        }),
      });
      setNewMessage("");
      // Reload messages & conversations
      const res = await fetch(`/api/messages/${selectedConv}`);
      if (res.ok) setMessages(await res.json());
      loadConversations();
    } catch { /* */ }
    setSending(false);
  };

  const startNewChat = async (recruiterId: string) => {
    setShowNewChat(false);
    // Send an initial message to create conversation
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver_id: recruiterId,
        content: "Hello! I'm reaching out from DulyHired.",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedConv(data.conversation_id);
      loadConversations();
    }
  };

  const filteredRecruiters = searchRecruiter.trim()
    ? recruiters.filter(r =>
        (r.full_name || "").toLowerCase().includes(searchRecruiter.toLowerCase()) ||
        (r.email || "").toLowerCase().includes(searchRecruiter.toLowerCase())
      )
    : recruiters;

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation list */}
      <div className="w-72 shrink-0 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Messages</h3>
          <button onClick={loadRecruiters} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="New message">
            <MessageSquare size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 size={16} className="animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare size={24} className="mx-auto text-white/20 mb-2" />
              <p className="text-xs text-white/30">No conversations yet.</p>
              <button onClick={loadRecruiters} className="text-xs text-primary hover:text-primary-light mt-2 transition-colors">Start a chat</button>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {conversations.map(conv => (
                <button key={conv.id} onClick={() => { setSelectedConv(conv.id); setMessages([]); }}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    selectedConv === conv.id ? "bg-primary/15 border border-primary/30" : "hover:bg-white/[0.04] border border-transparent"
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {conv.other_user.full_name?.charAt(0).toUpperCase() || "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white truncate">{conv.other_user.full_name || "Unknown"}</span>
                      {conv.unread_count > 0 && (
                        <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        {selectedConv && selectedConvData ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {selectedConvData.other_user.full_name?.charAt(0).toUpperCase() || "R"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{selectedConvData.other_user.full_name || "Recruiter"}</p>
                <p className="text-xs text-white/40">{selectedConvData.other_user.email || ""}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <Loader2 size={16} className="animate-spin text-primary mx-auto" />
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                      m.is_mine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/10 text-white/80 rounded-bl-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.is_mine ? "text-white/50" : "text-white/30"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {m.is_mine && m.read_at && (
                          <span className="ml-1.5">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-primary hover:bg-primary-dark disabled:opacity-40 rounded-lg transition-colors">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto text-white/20 mb-3" />
              <p className="text-white/40 text-sm">Select a conversation or start a new one</p>
              <button onClick={loadRecruiters} className="mt-3 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                New Message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowNewChat(false)}>
          <div className="bg-white dark:bg-dark-surface border border-white/10 rounded-xl w-full max-w-md max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Message a Recruiter</h3>
              <button onClick={() => setShowNewChat(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchRecruiter}
                  onChange={e => setSearchRecruiter(e.target.value)}
                  placeholder="Search recruiters..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-white pl-8 pr-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {filteredRecruiters.map(r => (
                  <button key={r.id} onClick={() => startNewChat(r.id)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {r.full_name?.charAt(0).toUpperCase() || "R"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.full_name || "Unknown"}</p>
                      <p className="text-xs text-white/40 truncate">{r.email}</p>
                    </div>
                  </button>
                ))}
                {filteredRecruiters.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-6">No recruiters found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────
export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Poll for unread messages
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const convos = await res.json();
          const total = convos.reduce((sum: number, c: Conversation) => sum + (c.unread_count || 0), 0);
          setUnreadMessages(total);
        }
      } catch { /* */ }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Poll for notifications
  useEffect(() => {
    if (!user) return;
    const pollNotifs = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.unread_count > 0) {
            setUnreadMessages(prev => prev + data.unread_count);
          }
        }
      } catch { /* */ }
    };
    const interval = setInterval(pollNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { window.location.href = "/sign-in"; return; }
    if (!loading && profile && profile.role !== "admin") {
      window.location.href = `/dashboard/${profile.role}`;
    }
  }, [loading, user, profile]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen dash-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen dash-bg flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        signOut={signOut}
        pendingCount={pendingCount}
        unreadMessages={unreadMessages}
      />
      <main className="flex-1 min-w-0 overflow-y-auto h-full">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === "analytics"   && <AnalyticsTab />}
          {activeTab === "recruiters"  && <RecruitersTab onPendingCountChange={setPendingCount} />}
          {activeTab === "jobseekers"  && <JobSeekersTab />}
          {activeTab === "messages"    && <MessagesTab />}
        </div>
      </main>
    </div>
  );
}


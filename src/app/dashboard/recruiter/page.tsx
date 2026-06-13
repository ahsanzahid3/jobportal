"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";
import {
  Briefcase, Users, Bell, LayoutDashboard, LogOut,
  Sun, Moon, Plus, X, Check, Loader2, Building2,
  Edit3, Save, ChevronRight, MapPin, Star, Trash2,
  UserPlus, ExternalLink, Globe, Link as LinkIcon,
  ChevronDown, ChevronLeft, Search, DollarSign, Eye, Paperclip, FileText,
  MessageSquare, Send, Shield as ShieldIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface RecruiterProfile {
  company_name: string;
  company_website: string;
  company_industry: string;
  company_size: string;
  company_description: string;
  title: string;
  linkedin_url: string;
}

interface CrmEntry {
  id: string;
  candidate_name: string;
  candidate_email: string | null;
  candidate_linkedin: string | null;
  job_title: string | null;
  company: string | null;
  status: "contacted" | "interviewing" | "rejected" | "hired";
  notes: string | null;
  cv_url: string | null;
  created_at: string;
}

interface TalentProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  linkedin_url: string | null;
  employee_profiles: {
    headline: string | null;
    skills: string[];
    location: string | null;
    is_open_to_work: boolean;
    desired_job_type: string | null;
    desired_workplace: string | null;
    cv_url: string | null;
  } | null;
}

type Tab = "overview" | "company" | "post-job" | "talent" | "crm" | "posted-jobs" | "messages" | "saved";

const REGIONS = [
  "North America", "South America", "Africa", "European Union",
  "United Kingdom", "Slavic States", "Middle East", "ASEAN", "Oceania",
];

// ── Region tag picker ──────────────────────────────────────────────
function RegionPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const available = REGIONS.filter(r => !selected.includes(r));
  return (
    <div className="space-y-2">
      {available.length > 0 && (
        <div className="relative">
          <select defaultValue=""
            onChange={e => { if (e.target.value) { onChange([...selected, e.target.value]); e.target.value = ""; } }}
            className="w-full pl-3 pr-8 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:border-primary outline-none appearance-none">
            <option value="" disabled>Add a region…</option>
            {available.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(r => (
            <span key={r} className="flex items-center gap-1.5 text-xs bg-primary/20 text-blue-300 border border-primary/30 px-2.5 py-1 rounded-full">
              {r}
              <button type="button" onClick={() => onChange(selected.filter(x => x !== r))}
                className="hover:text-red-400 transition-colors leading-none">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const CRM_COLUMNS: { status: CrmEntry["status"]; label: string; color: string }[] = [
  { status: "contacted",    label: "Contacted",    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  { status: "interviewing", label: "Interviewing", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  { status: "rejected",     label: "Rejected",     color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  { status: "hired",        label: "Hired",        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
];

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, profile, signOut, unreadMessages }: {
  activeTab: Tab; setActiveTab: (t: Tab) => void;
  profile: { full_name: string | null; email: string | null } | null;
  signOut: () => void;
  unreadMessages: number;
}) {
  const { isDark, toggle } = useTheme();
  const nav: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "messages",     label: "Messages",       icon: <MessageSquare size={18} />, badge: unreadMessages },
    { id: "overview",     label: "Overview",       icon: <LayoutDashboard size={18} /> },
    { id: "company",      label: "Company Profile", icon: <Building2 size={18} /> },
    { id: "post-job",     label: "Post a Job",      icon: <Plus size={18} /> },
    { id: "posted-jobs",  label: "Posted Jobs",     icon: <Briefcase size={18} /> },
    { id: "talent",       label: "Talent Pool",     icon: <Users size={18} /> },
    { id: "crm",          label: "CRM Pipeline",    icon: <Bell size={18} /> },
    { id: "saved",        label: "Saved Candidates",  icon: <Star size={18} /> },
  ];

  return (
    <aside className="w-64 shrink-0 dash-sidebar dash-sidebar-border flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-4 border-b border-white/10">
        <a href="/" className="flex items-center">
          <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
        </a>
      </div>
      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-2">
          {profile?.full_name?.charAt(0).toUpperCase() || "R"}
        </div>
        <p className="text-sm font-semibold text-white truncate">{profile?.full_name || "Recruiter"}</p>
        <p className="text-xs text-white/40 truncate">{profile?.email}</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full mt-1.5">
          Recruiter
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
              <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
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

// ─── Overview Tab ─────────────────────────────────────────────────
function OverviewTab({ crmEntries, companyName, setActiveTab, accessRequested, accessApproved, requestAccess }: {
  crmEntries: CrmEntry[]; companyName: string | null; setActiveTab: (t: Tab) => void;
  accessRequested: boolean; accessApproved: boolean; requestAccess: () => void;
}) {
  const statusCounts = CRM_COLUMNS.reduce((acc, col) => {
    acc[col.status] = crmEntries.filter(e => e.status === col.status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {companyName ? `${companyName} Dashboard` : "Recruiter Dashboard"}
        </h1>
        <p className="text-white/60 mt-1 text-sm">Manage your hiring pipeline and talent pool.</p>
      </div>

      {/* CRM stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CRM_COLUMNS.map(col => (
          <button key={col.status} onClick={() => setActiveTab("crm")}
            className="group bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-4 text-left hover:shadow-md transition-all">
            <p className="text-3xl font-bold text-white">{statusCounts[col.status] || 0}</p>
            <p className={`text-xs font-semibold mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${col.color}`}>
              {col.label}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View <ChevronRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Post a Job",        tab: "post-job" as Tab, icon: <Plus size={16} />,      primary: true },
            { label: "Browse Talent Pool", tab: "talent" as Tab,  icon: <Users size={16} /> },
            { label: "Add CRM Entry",      tab: "crm" as Tab,     icon: <UserPlus size={16} /> },
            { label: "Company Profile",    tab: "company" as Tab,  icon: <Building2 size={16} /> },
            ...(accessApproved ? [] : [{
              label: accessRequested ? "Access Requested" : "Request Talent Pool Access",
              tab: "overview" as Tab,
              icon: accessRequested ? <Check size={16} /> : <ShieldIcon size={16} />,
              primary: !accessRequested,
              disabled: accessRequested,
              onClick: requestAccess,
            }]),
          ].map((a: any) => (
            <button key={a.label} onClick={() => a.onClick ? a.onClick() : setActiveTab(a.tab)}
              disabled={a.disabled || false}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                a.primary ? "bg-primary text-white hover:bg-primary-dark" : "border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
              } ${a.disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent pipeline */}
      {crmEntries.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Pipeline</h3>
            <button onClick={() => setActiveTab("crm")} className="text-sm text-primary dark:text-primary-light hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {crmEntries.slice(0, 4).map(entry => {
              const col = CRM_COLUMNS.find(c => c.status === entry.status)!;
              return (
                <div key={entry.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {entry.candidate_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{entry.candidate_name}</p>
                    <p className="text-xs text-gray-400 truncate">{entry.job_title || "No role specified"}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${col.color}`}>
                    {col.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Company Profile Tab ──────────────────────────────────────────
function CompanyTab({ userId, baseName }: { userId: string; baseName: string | null }) {
  const supabase = createClient();
  const [rp, setRp] = useState<RecruiterProfile>({
    company_name: "", company_website: "", company_industry: "",
    company_size: "", company_description: "", title: "", linkedin_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("recruiter_profiles").select("*").eq("id", userId).single(),
      supabase.from("profiles").select("linkedin_url").eq("id", userId).single(),
    ]).then(([{ data: rpData }, { data: pData }]) => {
      if (rpData) {
        setRp({
          company_name: rpData.company_name || baseName || "",
          company_website: rpData.company_website || "",
          company_industry: rpData.company_industry || "",
          company_size: rpData.company_size || "",
          company_description: rpData.company_description || "",
          title: rpData.title || "",
          linkedin_url: pData?.linkedin_url || "",
        });
      } else {
        setRp(prev => ({ ...prev, company_name: baseName || "", linkedin_url: pData?.linkedin_url || "" }));
      }
      setLoading(false);
    });
  }, [userId, baseName, supabase]);

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from("profiles").update({ linkedin_url: rp.linkedin_url }).eq("id", userId),
      supabase.from("recruiter_profiles").upsert({
        id: userId,
        company_name: rp.company_name,
        company_website: rp.company_website,
        company_industry: rp.company_industry,
        company_size: rp.company_size,
        company_description: rp.company_description,
        title: rp.title,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }),
    ]);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  const f = (key: keyof RecruiterProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setRp(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Company Profile</h2>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Edit3 size={15} /> Company Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Company Name", key: "company_name" as const, placeholder: "Acme Inc." },
            { label: "Your Job Title", key: "title" as const, placeholder: "Head of Talent" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
              <input value={rp[key]} onChange={f(key)} placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Industry</label>
            <input value={rp.company_industry} onChange={f("company_industry")} placeholder="Software & Technology"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Company Size</label>
            <select value={rp.company_size} onChange={f("company_size")}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors">
              <option value="">Select size</option>
              {["1-10","11-50","51-200","201-500","501-1000","1000+"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Website</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={rp.company_website} onChange={f("company_website")} placeholder="https://yourcompany.com"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:border-primary outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">LinkedIn Profile</label>
            <div className="relative">
              <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={rp.linkedin_url} onChange={f("linkedin_url")} placeholder="https://linkedin.com/in/yourprofile"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:border-primary outline-none transition-colors" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Company Description</label>
            <textarea value={rp.company_description} onChange={f("company_description")} rows={4}
              placeholder="Tell candidates about your company, culture, and mission..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Job Tab ─────────────────────────────────────────────────
// ── Bullet-point list input helper ────────────────────────────────
function BulletListInput({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !items.includes(t)) { onChange([...items, t]); }
    setDraft("");
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder || "Type and press Enter or Add"}
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors" />
        <button type="button" onClick={add}
          className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shrink-0">
          Add
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              <span className="flex-1 text-sm text-white/80">{item}</span>
              <button type="button" onClick={() => remove(i)}
                className="flex items-center justify-center w-5 h-5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors shrink-0 mt-0.5">
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostJobTab({ userId, companyName }: { userId: string; companyName: string | null }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    title: "", company: companyName || "", location: "", country: "",
    type: "full-time", seniority: "mid",
    industry: "", salary_min: "", salary_max: "",
    description: "", external_url: "",
    visa_sponsorship: "no",
    allowed_countries: "",
    anywhere: true,
    remote_scope: "all",
    is_urgent: false,
    is_featured: false,
  });
  const [workplace, setWorkplace] = useState<string[]>(["onsite"]);
  const [skills, setSkills] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [remoteRegions, setRemoteRegions] = useState<string[]>([]);
  const [allowedRegions, setAllowedRegions] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState("");

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const toggleWorkplace = (val: string) => {
    setWorkplace(prev =>
      prev.includes(val) ? (prev.length > 1 ? prev.filter(v => v !== val) : prev) : [...prev, val]
    );
  };

  const isRemote = workplace.includes("remote");

  const handlePost = async () => {
    if (!form.title || !form.company || !form.location) { setError("Title, company, and location are required."); return; }
    setPosting(true); setError("");
    const { error: err } = await supabase.from("jobs").insert({
      title: form.title,
      company: form.company,
      location: form.location,
      country: form.country || null,
      type: form.type,
      workplace: workplace.join(","),
      seniority: form.seniority,
      industry: form.industry || null,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      description: form.description || null,
      external_url: form.external_url || null,
      skills: skills.length > 0 ? skills : null,
      responsibilities: responsibilities.length > 0 ? responsibilities : null,
      allowed_countries: form.anywhere ? "Anywhere" : (allowedRegions.length > 0 ? allowedRegions.join(", ") : null),
      visa_sponsorship: form.visa_sponsorship,
      remote_scope: isRemote ? form.remote_scope : null,
      remote_regions: isRemote && form.remote_scope === "regions" ? remoteRegions.join(", ") : null,
      is_urgent: form.is_urgent,
      is_featured: form.is_featured,
      status: "active",
      recruiter_id: userId,
      collar: "white",
      posted: "Just now",
    });
    setPosting(false);
    if (err) { setError(err.message); return; }
    setPosted(true);
    setForm({ title: "", company: companyName || "", location: "", country: "", type: "full-time", seniority: "mid", industry: "", salary_min: "", salary_max: "", description: "", external_url: "", visa_sponsorship: "no", allowed_countries: "", anywhere: true, remote_scope: "all", is_urgent: false, is_featured: false });
    setWorkplace(["onsite"]); setSkills([]); setResponsibilities([]); setRemoteRegions([]); setAllowedRegions([]);
    setTimeout(() => setPosted(false), 4000);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors";
  const selectCls = "w-full pl-3 pr-8 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:border-primary outline-none transition-colors appearance-none";
  const sectionCls = "bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5 space-y-4";

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Post a Job</h2>

      {posted && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">Job posted successfully!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">It&apos;s now live on DulyHired. <a href="/" className="underline">View it →</a></p>
          </div>
        </div>
      )}
      {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {/* ── Basic Info ── */}
      <div className={sectionCls}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Basic Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Job Title *</label>
            <input value={form.title} onChange={f("title")} placeholder="e.g. Senior Software Engineer" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Company Name *</label>
            <input value={form.company} onChange={f("company")} placeholder="Acme Inc." className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Location *</label>
            <input value={form.location} onChange={f("location")} placeholder="e.g. Lagos, Nigeria" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Country</label>
            <input value={form.country} onChange={f("country")} placeholder="Nigeria" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Industry</label>
            <input value={form.industry} onChange={f("industry")} placeholder="Software & Technology" className={inputCls} />
          </div>
          {[
            { label: "Job Type", key: "type", options: [["full-time","Full-time"],["part-time","Part-time"],["contract","Contract"],["freelance","Freelance"],["internship","Internship"]] },
            { label: "Seniority", key: "seniority", options: [["no-experience","No experience"],["junior","Junior"],["mid","Mid-level"],["senior","Senior"],["lead","Lead"],["manager","Manager"],["director","Director"],["executive","Executive"]] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
              <div className="relative">
                <select value={(form as unknown as Record<string, string>)[key]} onChange={f(key)} className={selectCls}>
                  {(options as [string, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Min. Salary (USD/yr)</label>
            <div className="relative"><DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" value={form.salary_min} onChange={f("salary_min")} placeholder="e.g. 60000" className={`${inputCls} pl-8`} /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Max. Salary (USD/yr)</label>
            <div className="relative"><DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" value={form.salary_max} onChange={f("salary_max")} placeholder="e.g. 100000" className={`${inputCls} pl-8`} /></div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Application / External URL</label>
            <input value={form.external_url} onChange={f("external_url")} placeholder="https://apply.yourcompany.com/job" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Workplace ── */}
      <div className={sectionCls}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Workplace</p>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">Work Type (select all that apply)</label>
          <div className="flex flex-wrap gap-3">
            {[["onsite","Onsite"],["remote","Remote"],["hybrid","Hybrid"],["field","Field"]].map(([val, lbl]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={workplace.includes(val)} onChange={() => toggleWorkplace(val)}
                  className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-white/80 capitalize">{lbl}</span>
              </label>
            ))}
          </div>
        </div>

        {isRemote && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-white/60">Remote Scope</label>
            <div className="flex flex-col gap-2">
              {[
                ["company", "Company region only"],
                ["regions", "Allow from specific regions"],
                ["all",     "Allow from all countries"],
              ].map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="remote_scope" value={val}
                    checked={form.remote_scope === val}
                    onChange={e => setForm(p => ({ ...p, remote_scope: e.target.value }))}
                    className="accent-primary" />
                  <span className="text-sm text-white/80">{lbl}</span>
                </label>
              ))}
            </div>
            {form.remote_scope === "regions" && (
              <div className="pl-5">
                <p className="text-xs text-white/50 mb-2">Select which regions can apply remotely</p>
                <RegionPicker selected={remoteRegions} onChange={setRemoteRegions} />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">Allowed Countries</label>
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input type="checkbox" checked={form.anywhere}
              onChange={e => setForm(p => ({ ...p, anywhere: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-white/80">Anywhere in the world</span>
          </label>
          {!form.anywhere && (
            <RegionPicker selected={allowedRegions} onChange={setAllowedRegions} />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-white/60 mb-2">Visa Sponsorship</label>
          <div className="relative">
            <select value={form.visa_sponsorship}
              onChange={e => setForm(p => ({ ...p, visa_sponsorship: e.target.value }))}
              className={selectCls}>
              <option value="no">No</option>
              <option value="rarely">Rarely — but for the right person</option>
              <option value="probation">Remote first, then visa after probation</option>
              <option value="yes">Yes (often)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Job Details ── */}
      <div className={sectionCls}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Job Details</p>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-white/60 mb-1">Job Description</label>
          <textarea value={form.description} onChange={f("description")} rows={5}
            placeholder="Overview of the role and what you're looking for..."
            className={`${inputCls} resize-none`} />
        </div>
        <BulletListInput
          label="Responsibilities"
          items={responsibilities}
          onChange={setResponsibilities}
          placeholder="e.g. Manage the end-to-end product lifecycle" />
        <BulletListInput
          label="Required Skills"
          items={skills}
          onChange={setSkills}
          placeholder="e.g. React, Node.js, 3+ years experience" />
      </div>

      {/* ── Flags ── */}
      <div className={sectionCls}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Listing Options</p>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_urgent}
              onChange={e => setForm(p => ({ ...p, is_urgent: e.target.checked }))}
              className="w-4 h-4 mt-0.5 rounded accent-primary" />
            <div>
              <p className="text-sm font-medium text-white">Mark as Urgent</p>
              <p className="text-xs text-white/40">Shows an &quot;Urgent&quot; badge on the listing</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
              className="w-4 h-4 mt-0.5 rounded accent-primary" />
            <div>
              <p className="text-sm font-medium text-white">Feature this Job</p>
              <p className="text-xs text-white/40">Pins the listing at the top of the homepage</p>
            </div>
          </label>
        </div>
      </div>

      <button onClick={handlePost} disabled={posting}
        className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
        {posting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Post Job
      </button>
    </div>
  );
}

// ─── Talent Pool Tab ──────────────────────────────────────────────
function TalentTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [accessStatus, setAccessStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [requesting, setRequesting] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState<TalentProfile | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles")
        .select("id, full_name, email, linkedin_url, employee_profiles(headline, skills, location, is_open_to_work, desired_job_type, desired_workplace, cv_url)")
        .eq("role", "employee")
        .limit(50),
      supabase.from("talent_access_requests")
        .select("status")
        .eq("recruiter_id", userId)
        .single(),
      supabase.from("saved_candidates").select("candidate_id").eq("recruiter_id", userId),
    ]).then(([{ data: talentData }, { data: reqData }, { data: savedData }]) => {
      setTalent((talentData as unknown as TalentProfile[]) || []);
      setAccessStatus((reqData?.status as typeof accessStatus) || "none");
      setSavedIds(new Set((savedData || []).map((s: any) => s.candidate_id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const requestAccess = async () => {
    setRequesting(true);
    await supabase.from("talent_access_requests").upsert(
      { recruiter_id: userId, status: "pending" },
      { onConflict: "recruiter_id" }
    );
    setAccessStatus("pending");
    setRequesting(false);
  };

  const toggleSave = async (candidateId: string) => {
    if (savedIds.has(candidateId)) {
      await supabase.from("saved_candidates").delete().eq("recruiter_id", userId).eq("candidate_id", candidateId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(candidateId); return n; });
    } else {
      await supabase.from("saved_candidates").insert({ recruiter_id: userId, candidate_id: candidateId });
      setSavedIds(prev => new Set(prev).add(candidateId));
    }
  };

  const filtered = talent.filter(t => {
    const ep = t.employee_profiles;
    // Free-text search
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch = (
        t.full_name?.toLowerCase().includes(q) ||
        ep?.headline?.toLowerCase().includes(q) ||
        ep?.skills?.some(s => s.toLowerCase().includes(q)) ||
        ep?.location?.toLowerCase().includes(q)
      );
      if (!matchesSearch) return false;
    }
    // Skill filter (exact match search)
    if (skillFilter) {
      const sq = skillFilter.toLowerCase();
      if (!ep?.skills?.some(s => s.toLowerCase().includes(sq))) return false;
    }
    // Location filter
    if (locationFilter) {
      if (!ep?.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* ── Access Request Banner ── */}
      {accessStatus === "none" && (
        <div className="flex items-center justify-between gap-4 bg-indigo-500/10 border border-indigo-500/25 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Want full access to candidate details?</p>
            <p className="text-xs text-white/50 mt-0.5">Request access and our admin team will review your company and get back to you.</p>
          </div>
          <button onClick={requestAccess} disabled={requesting}
            className="shrink-0 flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
            {requesting ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
            Request Access
          </button>
        </div>
      )}
      {accessStatus === "pending" && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-5 py-4">
          <Loader2 size={16} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Access request pending</p>
            <p className="text-xs text-white/50 mt-0.5">Our admin team will review your request and contact you shortly.</p>
          </div>
        </div>
      )}
      {accessStatus === "approved" && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-5 py-4">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold text-emerald-300">Full talent pool access granted — all details visible</p>
        </div>
      )}
      {accessStatus === "rejected" && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-5 py-4">
          <X size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">Access request declined</p>
            <p className="text-xs text-white/50 mt-0.5">Contact us if you believe this was a mistake.</p>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, headline, or any keyword..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div className="relative w-40">
            <input value={locationFilter} onChange={e => setLocationFilter(e.target.value)} placeholder="Filter by location"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div className="relative w-40">
            <input value={skillFilter} onChange={e => setSkillFilter(e.target.value)} placeholder="Filter by skill"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-sm focus:border-primary outline-none transition-colors" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl">
          <Users size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-white/60 text-sm">No candidates found for your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(candidate => {
            const ep = candidate.employee_profiles;
            const isSaved = savedIds.has(candidate.id);
            return (
              <div key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5 cursor-pointer hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {candidate.full_name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{candidate.full_name || "Anonymous"}</p>
                      {ep?.is_open_to_work && (
                        <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Open to Work
                        </span>
                      )}
                      {accessStatus === "approved" && isSaved && (
                        <span className="text-[10px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          Saved
                        </span>
                      )}
                    </div>
                    {ep?.headline && <p className="text-xs text-white/60 mt-0.5 truncate">{ep.headline}</p>}
                    {ep?.location && <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11} />{ep.location}</p>}
                  </div>
                </div>

                {ep?.skills && ep.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ep.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[11px] bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {ep.skills.length > 4 && <span className="text-[11px] text-gray-400 dark:text-gray-500">+{ep.skills.length - 4}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex gap-2 text-xs text-gray-400 dark:text-gray-500">
                    {ep?.desired_job_type && <span className="capitalize">{ep.desired_job_type}</span>}
                    {ep?.desired_workplace && ep.desired_workplace !== "any" && <span>· {ep.desired_workplace}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Email: blurred if no access, visible if approved */}
                    <span className={`text-xs ${accessStatus === "approved" ? "text-white/70" : "text-gray-300 dark:text-gray-600 blur-sm select-none"}`}>
                      {candidate.email || "email@hidden.com"}
                    </span>
                    {candidate.linkedin_url && (
                      <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border text-gray-400 hover:text-primary hover:border-primary/30 transition-colors"
                        title="View LinkedIn">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {accessStatus === "approved" && (
                      <button onClick={() => toggleSave(candidate.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : "border-gray-200 dark:border-dark-border text-gray-400 hover:text-primary hover:border-primary/30"
                        }`}
                        title={isSaved ? "Remove from saved" : "Save candidate"}>
                        <Star size={13} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Drawer */}
      {selectedCandidate && accessStatus === "approved" && (
        <CandidateDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          isSaved={savedIds.has(selectedCandidate.id)}
          onToggleSave={() => toggleSave(selectedCandidate.id)}
        />
      )}
    </div>
  );
}

// ─── Candidate Drawer ─────────────────────────────────────────────
function CandidateDrawer({ candidate, onClose, isSaved, onToggleSave }: {
  candidate: TalentProfile;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const handleClose = () => { setExiting(true); setTimeout(onClose, 150); };
  const ep = candidate.employee_profiles;

  return (
    <>
      <div onClick={handleClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${exiting ? "opacity-0" : "opacity-100"}`} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-dark-surface border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-150 ${exiting ? "translate-x-full" : "translate-x-0"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <button onClick={handleClose} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onToggleSave}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
              }`}>
              <Star size={15} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {candidate.full_name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{candidate.full_name || "Candidate"}</h2>
                {ep?.is_open_to_work && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Open to Work</span>
                )}
              </div>
              {ep?.headline && <p className="text-sm text-white/60 mt-0.5">{ep.headline}</p>}
              {ep?.location && <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><MapPin size={11} />{ep.location}</p>}
              <p className="text-sm text-blue-300 mt-1 break-all">{candidate.email}</p>
              {candidate.linkedin_url && (
                <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 mt-1 transition-colors">
                  <ExternalLink size={12} /> LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          {/* Details grid */}
          {ep && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4">
              {ep.desired_job_type && (
                <div>
                  <p className="text-xs text-white/40">Desired Job Type</p>
                  <p className="text-sm font-medium text-white capitalize mt-0.5">{ep.desired_job_type}</p>
                </div>
              )}
              {ep.desired_workplace && ep.desired_workplace !== "any" && (
                <div>
                  <p className="text-xs text-white/40">Workplace</p>
                  <p className="text-sm font-medium text-white capitalize mt-0.5">{ep.desired_workplace}</p>
                </div>
              )}
              {ep.location && (
                <div>
                  <p className="text-xs text-white/40">Location</p>
                  <p className="text-sm font-medium text-white mt-0.5">{ep.location}</p>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {ep?.skills && ep.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Skills</p>
              <div className="flex flex-wrap gap-2">
                {ep.skills.map(s => (
                  <span key={s} className="text-xs bg-primary/20 text-blue-300 border border-primary/30 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CV / Resume */}
          {ep?.cv_url && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">CV / Resume</p>
              <a href={ep.cv_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                <FileText size={20} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">View Resume</p>
                  <p className="text-xs text-white/40">Opens in a new tab</p>
                </div>
                <ExternalLink size={14} className="text-white/30 group-hover:text-primary transition-colors" />
              </a>
            </div>
          )}

          {!ep?.cv_url && (
            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6 text-center">
              <FileText size={24} className="mx-auto text-white/20 mb-2" />
              <p className="text-sm text-white/30">No CV / Resume uploaded</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── CRM Tab ──────────────────────────────────────────────────────
function CrmTab({ userId, onEntriesChange }: { userId: string; onEntriesChange: (entries: CrmEntry[]) => void }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<CrmEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ candidate_name: "", candidate_email: "", candidate_linkedin: "", job_title: "", company: "", status: "contacted" as CrmEntry["status"], notes: "" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [savedCandidates, setSavedCandidates] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const [selectedSavedCandidate, setSelectedSavedCandidate] = useState("");

  useEffect(() => {
    supabase.from("saved_candidates").select("candidate_id").eq("recruiter_id", userId)
      .then(async ({ data: saved }) => {
        if (!saved?.length) return;
        const ids = saved.map((s: any) => s.candidate_id);
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
        setSavedCandidates((profiles || []).map(p => ({ id: p.id, full_name: p.full_name, email: p.email })));
      });
  }, [userId]);

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase.from("crm_entries").select("*").eq("recruiter_id", userId).order("created_at", { ascending: false });
    const list = (data || []) as CrmEntry[];
    setEntries(list);
    onEntriesChange(list);
    setLoading(false);
  }, [userId, supabase, onEntriesChange]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const createEntry = async () => {
    if (!form.candidate_name) return;
    setCreating(true);
    let cv_url: string | null = null;
    if (cvFile) {
      const ext = cvFile.name.split(".").pop();
      const path = `crm/${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("cvs").upload(path, cvFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(path);
        cv_url = urlData.publicUrl;
      }
    }
    await supabase.from("crm_entries").insert({ ...form, recruiter_id: userId, cv_url });
    setForm({ candidate_name: "", candidate_email: "", candidate_linkedin: "", job_title: "", company: "", status: "contacted", notes: "" });
    setCvFile(null);
    setShowForm(false);
    await fetchEntries();
    setCreating(false);
  };

  const moveEntry = async (id: string, status: CrmEntry["status"]) => {
    setMovingId(id);
    await supabase.from("crm_entries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    await fetchEntries();
    setMovingId(null);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("crm_entries").delete().eq("id", id);
    await fetchEntries();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">CRM Pipeline</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <UserPlus size={15} /> Add Candidate
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-primary/30 dark:border-primary/40 p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">Add Candidate to Pipeline</h3>

          {/* Saved Candidates Dropdown */}
          {savedCandidates.length > 0 && (
            <div className="pb-3 border-b border-white/10 mb-2">
              <label className="block text-xs font-medium text-white/60 mb-2">From your saved talent pool</label>
              <div className="relative">
                <select value={selectedSavedCandidate}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedSavedCandidate(id);
                    if (!id) return;
                    const c = savedCandidates.find(sc => sc.id === id);
                    if (c) {
                      setForm(prev => ({
                        ...prev,
                        candidate_name: c.full_name || "",
                        candidate_email: c.email || "",
                      }));
                    }
                  }}
                  className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:border-primary outline-none transition-colors appearance-none">
                  <option value="">Select a saved candidate...</option>
                  {savedCandidates.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name || c.email || "Unknown"}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          <p className="text-xs text-white/30">Or fill in manually:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Candidate Name *", key: "candidate_name", placeholder: "Jane Smith" },
              { label: "Email", key: "candidate_email", placeholder: "jane@company.com" },
              { label: "LinkedIn URL", key: "candidate_linkedin", placeholder: "https://linkedin.com/in/jane" },
              { label: "Role Applied For", key: "job_title", placeholder: "Software Engineer" },
              { label: "Company", key: "company", placeholder: "Acme Inc." },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
                <input value={(form as Record<string, string>)[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as CrmEntry["status"] }))}
                  className="w-full pl-3 pr-8 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:border-primary outline-none transition-colors appearance-none">
                  {CRM_COLUMNS.map(c => <option key={c.status} value={c.status}>{c.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2}
                placeholder="Any notes about this candidate..."
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary outline-none transition-colors resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-1">CV / Resume (optional)</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:border-primary/50 transition-colors flex-1">
                  <Paperclip size={14} className="text-white/40 shrink-0" />
                  <span className="text-sm text-white/50 truncate">
                    {cvFile ? cvFile.name : "Click to attach a CV (PDF, DOC, DOCX)"}
                  </span>
                </div>
                {cvFile && (
                  <button type="button" onClick={() => setCvFile(null)}
                    className="flex items-center justify-center w-8 h-8 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors shrink-0">
                    <X size={13} />
                  </button>
                )}
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only"
                  onChange={e => setCvFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createEntry} disabled={creating || !form.candidate_name}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Add to Pipeline
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-white/10 border border-white/15 rounded-lg text-white/70 hover:bg-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {CRM_COLUMNS.map(col => {
          const colEntries = entries.filter(e => e.status === col.status);
          return (
            <div key={col.status} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden">
              {/* Column header */}
              <div className={`px-3 py-2.5 border-b border-white/10 flex items-center justify-between`}>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-white/40 font-medium">{colEntries.length}</span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[120px]">
                {colEntries.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-4">No candidates</p>
                )}
                {colEntries.map(entry => (
                  <div key={entry.id} className="bg-white/5 rounded-lg border border-white/10 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white leading-tight">{entry.candidate_name}</p>
                      <button onClick={() => deleteEntry(entry.id)} className="text-white/30 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                        <X size={13} />
                      </button>
                    </div>
                    {entry.job_title && <p className="text-xs text-white/60 mb-1">{entry.job_title}</p>}
                    {entry.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 line-clamp-2">{entry.notes}</p>}
                    {entry.cv_url && (
                      <a href={entry.cv_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-300 hover:text-blue-200 mb-2 transition-colors">
                        <FileText size={12} /> View CV
                      </a>
                    )}

                    {/* Move to buttons */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {CRM_COLUMNS.filter(c => c.status !== col.status).map(target => (
                        <button key={target.status} disabled={movingId === entry.id}
                          onClick={() => moveEntry(entry.id, target.status)}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${target.color} opacity-70 hover:opacity-100`}>
                          → {target.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Posted Jobs Tab ──────────────────────────────────────────────
interface PostedJob {
  id: string;
  title: string;
  type: string | null;
  workplace: string | null;
  location: string | null;
  status: string | null;
  posted: string | null;
  created_at: string;
  views: number | null;
}

function PostedJobsTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id, title, type, workplace, location, status, posted, created_at, views")
      .eq("recruiter_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJobs((data || []) as PostedJob[]);
        setLoading(false);
      });
  }, [userId, supabase]);

  const statusColor = (s: string | null) => {
    if (s === "active") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    if (s === "closed") return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
    return "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700";
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Posted Jobs</h2>
        <span className="text-sm text-white/40">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl">
          <Briefcase size={40} className="mx-auto text-gray-500 mb-3" />
          <p className="text-white/60 text-sm">You haven&apos;t posted any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Briefcase size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{job.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  {job.location && <span className="text-xs text-white/50 flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                  {job.type && <span className="text-xs text-white/50 capitalize">{job.type}</span>}
                  {job.workplace && <span className="text-xs text-white/50 capitalize">{job.workplace}</span>}
                  <span className="text-xs text-white/30">{job.posted || new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Eye size={14} />
                  <span>{(job.views ?? 0).toLocaleString()}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColor(job.status)}`}>
                  {job.status || "draft"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Messages Tab ────────────────────────────────────────────────
function MessagesTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) setConversations(await res.json());
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);
    try {
      const conv = conversations.find(c => c.id === selectedConv);
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConv,
          receiver_id: conv?.other_user.id,
          content: newMessage.trim(),
        }),
      });
      setNewMessage("");
      const res = await fetch(`/api/messages/${selectedConv}`);
      if (res.ok) setMessages(await res.json());
      loadConversations();
    } catch { /* */ }
    setSending(false);
  };

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-72 shrink-0 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 size={16} className="animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare size={24} className="mx-auto text-white/20 mb-2" />
              <p className="text-xs text-white/30">No conversations yet.</p>
              <p className="text-xs text-white/20 mt-1">Admin will reach out here.</p>
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {conversations.map(conv => (
                <button key={conv.id} onClick={() => { setSelectedConv(conv.id); setMessages([]); }}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    selectedConv === conv.id ? "bg-primary/15 border border-primary/30" : "hover:bg-white/[0.04] border border-transparent"
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {conv.other_user.full_name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white truncate">{conv.other_user.full_name || "Admin"}</span>
                      {conv.unread_count > 0 && (
                        <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full shrink-0">{conv.unread_count}</span>
                      )}
                    </div>
                    {conv.last_message && <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        {selectedConv && selectedConvData ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {selectedConvData.other_user.full_name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{selectedConvData.other_user.full_name || "Admin"}</p>
                <p className="text-xs text-white/40">{selectedConvData.other_user.email || ""}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10"><Loader2 size={16} className="animate-spin text-primary mx-auto" /></div>
              ) : (
                messages.map((m: any) => (
                  <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                      m.is_mine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/10 text-white/80 rounded-bl-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.is_mine ? "text-white/50" : "text-white/30"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors" />
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
              <p className="text-white/40 text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Saved Candidates Tab ─────────────────────────────────────────
function SavedCandidatesTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [candidates, setCandidates] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TalentProfile | null>(null);
  const savedIdsSet = useMemo(() => new Set(candidates.map(c => c.id)), [candidates]);

  const load = useCallback(async () => {
    const { data: saved } = await supabase.from("saved_candidates").select("candidate_id").eq("recruiter_id", userId);
    if (!saved?.length) { setLoading(false); return; }
    const ids = saved.map((s: any) => s.candidate_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, linkedin_url, employee_profiles(headline, skills, location, is_open_to_work, desired_job_type, desired_workplace, cv_url)")
      .in("id", ids);
    setCandidates((profiles || []) as unknown as TalentProfile[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const removeCandidate = async (candidateId: string) => {
    await supabase.from("saved_candidates").delete().eq("recruiter_id", userId).eq("candidate_id", candidateId);
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Saved Candidates</h2>
        <span className="text-sm text-white/40">{candidates.length} saved</span>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
          <Star size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No saved candidates yet.</p>
          <p className="text-white/20 text-xs mt-1">Browse the talent pool and click the star icon to save candidates.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {candidates.map(candidate => {
            const ep = candidate.employee_profiles;
            return (
              <div key={candidate.id} onClick={() => setSelected(candidate)}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-5 cursor-pointer hover:bg-white/[0.07] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {candidate.full_name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{candidate.full_name || "Candidate"}</p>
                    {ep?.headline && <p className="text-xs text-white/60 mt-0.5 truncate">{ep.headline}</p>}
                    {ep?.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={11} />{ep.location}</p>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeCandidate(candidate.id); }}
                    className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors shrink-0" title="Remove from saved">
                    <Trash2 size={13} />
                  </button>
                </div>
                {ep?.skills && ep.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ep.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[11px] bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {ep.skills.length > 4 && <span className="text-[11px] text-gray-400">+{ep.skills.length - 4}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <CandidateDrawer
          candidate={selected}
          onClose={() => setSelected(null)}
          isSaved={true}
          onToggleSave={() => { removeCandidate(selected.id); setSelected(null); }}
        />
      )}
    </div>
  );
}

// ─── Main Recruiter Dashboard ──────────────────────────────────────
export default function RecruiterDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [crmEntries, setCrmEntries] = useState<CrmEntry[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Poll for unread messages
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const convos = await res.json();
          const total = convos.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
          setUnreadMessages(total);
        }
      } catch { /* */ }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/sign-in";
    if (!loading && profile && profile.role !== "recruiter") {
      window.location.href = `/dashboard/${profile.role}`;
    }
  }, [loading, user, profile]);

  // Load company name
  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase.from("recruiter_profiles").select("company_name").eq("id", user.id).single().then(({ data }) => {
        setCompanyName(data?.company_name || null);
      });
    }
  }, [user]);

  // ── Track access request status ──────────────────────────────────
  const [accessRequested, setAccessRequested] = useState(false);
  const [accessApproved, setAccessApproved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("talent_access_requests")
        .select("status")
        .eq("recruiter_id", user.id)
        .limit(1)
        .single();
      if (data?.status === "pending") setAccessRequested(true);
      if (data?.status === "approved") setAccessApproved(true);
    })().catch(() => {});
  }, [user]);

  const requestAccess = async () => {
    if (!user) return;
    await supabase.from("talent_access_requests").insert({
      recruiter_id: user.id,
      status: "pending",
    });
    setAccessRequested(true);
    // Also send notification to admin
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");
    const { data: recruiterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    for (const admin of admins || []) {
      await supabase.from("notifications").insert({
        user_id: admin.id,
        type: "access_request",
        title: "Talent Pool Access Requested",
        message: `${recruiterProfile?.full_name || "A recruiter"} (${recruiterProfile?.email || ""}) is requesting access to the talent pool.`,
        related_user_id: user.id,
      });
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen dash-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen dash-bg flex overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} signOut={signOut} unreadMessages={unreadMessages} />

      <main className="flex-1 min-w-0 overflow-y-auto h-full">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {activeTab === "overview"     && <OverviewTab crmEntries={crmEntries} companyName={companyName} setActiveTab={setActiveTab} accessRequested={accessRequested} accessApproved={accessApproved} requestAccess={requestAccess} />}
          {activeTab === "company"      && <CompanyTab userId={user.id} baseName={companyName} />}
          {activeTab === "post-job"     && <PostJobTab userId={user.id} companyName={companyName} />}
          {activeTab === "posted-jobs"  && <PostedJobsTab userId={user.id} />}
          {activeTab === "talent"       && <TalentTab userId={user.id} />}
          {activeTab === "crm"          && <CrmTab userId={user.id} onEntriesChange={setCrmEntries} />}
          {activeTab === "messages"     && <MessagesTab userId={user.id} />}
          {activeTab === "saved"        && <SavedCandidatesTab userId={user.id} />}
        </div>
      </main>
    </div>
  );
}


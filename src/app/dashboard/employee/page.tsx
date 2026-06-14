"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/utils/supabase/client";
import {
  Briefcase, User, Bell, Bookmark, LayoutDashboard, LogOut,
  Sun, Moon, MapPin, ExternalLink, Trash2, Plus, X, Check,
  Link as LinkIcon, Edit3, Save, Loader2, ChevronRight, ChevronLeft, Lock,
  AlertCircle, GraduationCap, Building2, Calendar, Star, FileText, Upload, CheckCircle2,
  Heart, Share2, Clock, DollarSign,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface SavedJob {
  id: string;
  job_id: string;
  job_title: string | null;
  job_company: string | null;
  job_location: string | null;
  job_salary: string | null;
  external_url: string | null;
  saved_at: string;
}

interface JobAlert {
  id: string;
  keyword: string | null;
  location: string | null;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
}

interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  start_month: string;
  end_month: string;
  is_current: boolean;
  description: string;
}

interface EmployeeProfile {
  headline: string;
  bio: string;
  skills: string[];
  location: string;
  desired_job_type: string;
  desired_workplace: string;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  is_open_to_work: boolean;
  linkedin_url: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

type Tab = "overview" | "profile" | "saved" | "alerts";

// ─── Glass input / card helpers ───────────────────────────────────
const glassInput = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:border-primary focus:bg-white/15 outline-none transition-colors";
const glassCard = "bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl";
const glassSelect = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:border-primary outline-none transition-colors appearance-none";

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, profile, signOut, isProfileComplete }: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  profile: { full_name: string | null; email: string | null } | null;
  signOut: () => void;
  isProfileComplete: boolean;
}) {
  const { isDark, toggle } = useTheme();

  const nav: { id: Tab; label: string; icon: React.ReactNode; requiresComplete: boolean }[] = [
    { id: "overview", label: "Overview",   icon: <LayoutDashboard size={18} />, requiresComplete: true },
    { id: "profile",  label: "My Profile", icon: <User size={18} />,            requiresComplete: false },
    { id: "saved",    label: "Saved Jobs", icon: <Bookmark size={18} />,        requiresComplete: true },
    { id: "alerts",   label: "Job Alerts", icon: <Bell size={18} />,            requiresComplete: true },
  ];

  return (
    <aside className="w-64 shrink-0 dash-sidebar dash-sidebar-border flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-4 border-b border-white/10">
        <a href="/" className="flex items-center">
          <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" /><img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
        </a>
      </div>

      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm mb-2">
          {profile?.full_name?.charAt(0).toUpperCase() || "U"}
        </div>
        <p className="text-sm font-semibold text-white truncate">{profile?.full_name || "Job Seeker"}</p>
        <p className="text-xs text-white/40 truncate">{profile?.email}</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/20 text-primary-light px-2 py-0.5 rounded-full mt-1.5">
          Job Seeker
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => {
          const locked = item.requiresComplete && !isProfileComplete;
          return (
            <button key={item.id}
              onClick={() => !locked && setActiveTab(item.id)}
              disabled={locked}
              title={locked ? "Complete your profile first" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                locked
                  ? "text-white/20 cursor-not-allowed"
                  : activeTab === item.id
                    ? "bg-primary/20 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              {item.icon}
              {item.label}
              {locked && <Lock size={12} className="ml-auto opacity-40" />}
            </button>
          );
        })}
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

// ─── Overview Tab ─────────────────────────────────────────────────
function OverviewTab({ savedCount, alertCount, name, setActiveTab }: {
  savedCount: number; alertCount: number; name: string | null; setActiveTab: (t: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {name?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-white/50 mt-1 text-sm">Here&apos;s a summary of your job search activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Saved Jobs",    value: savedCount, tab: "saved" as Tab,   color: "text-[#7eb3ff]" },
          { label: "Active Alerts", value: alertCount, tab: "alerts" as Tab,  color: "text-emerald-400" },
        ].map(s => (
          <button key={s.label} onClick={() => setActiveTab(s.tab)}
            className={`group ${glassCard} p-5 text-left hover:bg-white/15 transition-all`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-white/50 mt-1">{s.label}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">
              View <ChevronRight size={12} />
            </div>
          </button>
        ))}
      </div>

      <div className={`${glassCard} p-5`}>
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Browse Jobs",      href: "/",          icon: <Briefcase size={16} />, primary: true },
            { label: "Update Profile",   tab: "profile" as Tab, icon: <User size={16} /> },
            { label: "Create Job Alert", tab: "alerts" as Tab,  icon: <Bell size={16} /> },
            { label: "Browse Companies", href: "/companies",  icon: <MapPin size={16} /> },
          ].map(a => (
            a.href ? (
              <a key={a.label} href={a.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  a.primary ? "bg-primary text-white hover:bg-primary-dark" : "bg-white/10 border border-white/15 text-white/80 hover:bg-white/20"
                }`}>
                {a.icon}{a.label}
              </a>
            ) : (
              <button key={a.label} onClick={() => a.tab && setActiveTab(a.tab)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 transition-colors">
                {a.icon}{a.label}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CV Upload Section ─────────────────────────────────────────────
interface ParsedCV {
  full_name?: string;
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  cv_url?: string;
}

function CVUploadSection({ userId, savedCvUrl, onApply }: { userId: string; savedCvUrl?: string; onApply: (cv: ParsedCV) => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(true);

  const handleFile = async (file: File) => {
    setStatus("loading");
    setParsed(null);
    setErrorMsg("");

    const form = new FormData();
    form.append("file", file);
    form.append("userId", userId);

    try {
      const res = await fetch("/api/parse-cv", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to parse CV");
        setStatus("error");
        return;
      }

      setParsed(data as ParsedCV);
      setStatus("done");
      setExpanded(true);
    } catch {
      setErrorMsg("Network error — please try again");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const countExtracted = parsed
    ? [parsed.full_name, parsed.headline, parsed.bio].filter(Boolean).length
      + (parsed.skills.length > 0 ? 1 : 0)
      + (parsed.education.length > 0 ? 1 : 0)
      + (parsed.experience.length > 0 ? 1 : 0)
    : 0;

  return (
    <div className={`${glassCard} p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FileText size={16} />
          Upload CV
          <span className="text-xs font-normal text-[#7eb3ff]">Auto-fill your profile</span>
        </h3>
        {status === "done" && parsed && (
          <button onClick={() => setExpanded(v => !v)} className="text-xs text-white/40 hover:text-white transition-colors">
            {expanded ? "Hide" : "Show"} results
          </button>
        )}
      </div>

      {/* Saved CV indicator */}
      {savedCvUrl && status !== "done" && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/30">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={14} />
            <span>CV on file</span>
          </div>
          <a href={savedCvUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-emerald-400/80 hover:text-emerald-400 underline underline-offset-2 transition-colors">
            View / Download
          </a>
        </div>
      )}

      {/* Drop zone */}
      {status !== "done" && (
        <label
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
            status === "loading"
              ? "border-primary/40 bg-primary/5"
              : "border-white/15 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="text-sm text-white/50">Parsing your CV…</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-white/30" />
              <div className="text-center">
                <p className="text-sm font-medium text-white/60">Drop your CV here or <span className="text-[#7eb3ff]">browse</span></p>
                <p className="text-xs text-white/30 mt-0.5">PDF or DOCX · max 5 MB</p>
              </div>
            </>
          )}
          <input
            type="file" accept=".pdf,.docx" className="hidden"
            disabled={status === "loading"}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </label>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300">{errorMsg}</p>
            <button onClick={() => setStatus("idle")} className="text-xs text-red-400/70 hover:text-red-300 mt-1 underline">Try again</button>
          </div>
        </div>
      )}

      {/* Results */}
      {status === "done" && parsed && expanded && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40">{countExtracted} field{countExtracted !== 1 ? "s" : ""} extracted</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-2 text-sm">
            {parsed.full_name && <PreviewRow label="Name" value={parsed.full_name} />}
            {parsed.headline && <PreviewRow label="Headline" value={parsed.headline} />}
            {parsed.bio && <PreviewRow label="Bio" value={parsed.bio.slice(0, 100) + (parsed.bio.length > 100 ? "…" : "")} />}
            {parsed.linkedin_url && <PreviewRow label="LinkedIn" value={parsed.linkedin_url} />}
            {parsed.skills.length > 0 && <PreviewRow label="Skills" value={parsed.skills.slice(0, 6).join(", ") + (parsed.skills.length > 6 ? ` +${parsed.skills.length - 6} more` : "")} />}
            {parsed.education.length > 0 && <PreviewRow label="Education" value={`${parsed.education.length} entr${parsed.education.length === 1 ? "y" : "ies"}`} />}
            {parsed.experience.length > 0 && <PreviewRow label="Experience" value={`${parsed.experience.length} entr${parsed.experience.length === 1 ? "y" : "ies"}`} />}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onApply(parsed); setStatus("idle"); setParsed(null); }}
              className="flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Check size={13} /> Apply to Profile
            </button>
            <button
              onClick={() => { setStatus("idle"); setParsed(null); }}
              className="px-4 py-2 text-xs bg-white/10 border border-white/15 rounded-lg text-white/60 hover:bg-white/20 transition-colors"
            >
              Discard
            </button>
          </div>
          <p className="text-xs text-white/30">Only blank fields will be overwritten. Review before saving.</p>
        </div>
      )}

      {/* Upload another */}
      {status === "done" && (
        <label className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors w-fit">
          <Upload size={12} />
          Upload different file
          <input type="file" accept=".pdf,.docx" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white/5">
      <span className="text-xs text-white/40 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-white/80 flex-1 min-w-0 break-words">{value}</span>
    </div>
  );
}

// ─── Education Section ────────────────────────────────────────────
function EducationSection({ entries, onChange }: { entries: EducationEntry[]; onChange: (e: EducationEntry[]) => void }) {
  const blank = (): EducationEntry => ({ id: crypto.randomUUID(), institution: "", degree: "", field_of_study: "", start_year: "", end_year: "", is_current: false });
  const [editing, setEditing] = useState<EducationEntry | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => { setEditing(blank()); setIsNew(true); };
  const openEdit = (e: EducationEntry) => { setEditing({ ...e }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.institution) return;
    if (isNew) onChange([...entries, editing]);
    else onChange(entries.map(e => e.id === editing.id ? editing : e));
    cancel();
  };

  const remove = (id: string) => onChange(entries.filter(e => e.id !== id));

  const years = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className={`${glassCard} p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <GraduationCap size={16} />
          Education
          <span className="text-xs font-normal text-amber-400 flex items-center gap-1"><Star size={10} fill="currentColor" /> Recommended</span>
        </h3>
        {!editing && (
          <button onClick={openNew} className="flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:text-white transition-colors">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* Existing entries */}
      {entries.map(entry => (
        <div key={entry.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap size={14} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{entry.institution}</p>
            <p className="text-xs text-white/60 truncate">{[entry.degree, entry.field_of_study].filter(Boolean).join(" · ")}</p>
            <p className="text-xs text-white/40 mt-0.5">{entry.start_year}{entry.start_year ? " – " : ""}{entry.is_current ? "Present" : entry.end_year}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openEdit(entry)} className="p-1.5 text-white/30 hover:text-white transition-colors"><Edit3 size={13} /></button>
            <button onClick={() => remove(entry.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {entries.length === 0 && !editing && (
        <div className="text-center py-4 border border-dashed border-white/15 rounded-lg">
          <p className="text-xs text-white/30">Add your educational background to stand out to recruiters</p>
          <button onClick={openNew} className="text-xs text-primary-light hover:underline mt-1">+ Add education</button>
        </div>
      )}

      {/* Add / Edit form */}
      {editing && (
        <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{isNew ? "Add Education" : "Edit Education"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/50 mb-1">School / University *</label>
              <input value={editing.institution} onChange={e => setEditing(prev => prev ? { ...prev, institution: e.target.value } : prev)}
                placeholder="e.g. University of Lagos" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Degree</label>
              <select value={editing.degree} onChange={e => setEditing(prev => prev ? { ...prev, degree: e.target.value } : prev)} className={glassSelect}>
                {["", "High School Diploma", "Associate's", "Bachelor's", "Master's", "MBA", "PhD", "MD", "JD", "Certificate", "Diploma", "Other"].map(d => (
                  <option key={d} value={d} className="bg-gray-900">{d || "Select degree"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Field of Study</label>
              <input value={editing.field_of_study} onChange={e => setEditing(prev => prev ? { ...prev, field_of_study: e.target.value } : prev)}
                placeholder="e.g. Computer Science" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Start Year</label>
              <select value={editing.start_year} onChange={e => setEditing(prev => prev ? { ...prev, start_year: e.target.value } : prev)} className={glassSelect}>
                <option value="" className="bg-gray-900">Year</option>
                {years.map(y => <option key={y} value={y} className="bg-gray-900">{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">End Year</label>
              <select value={editing.end_year} disabled={editing.is_current}
                onChange={e => setEditing(prev => prev ? { ...prev, end_year: e.target.value } : prev)} className={`${glassSelect} disabled:opacity-40`}>
                <option value="" className="bg-gray-900">Year</option>
                {years.map(y => <option key={y} value={y} className="bg-gray-900">{y}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60">
                <input type="checkbox" checked={editing.is_current}
                  onChange={e => setEditing(prev => prev ? { ...prev, is_current: e.target.checked, end_year: "" } : prev)}
                  className="w-4 h-4 rounded accent-primary" />
                Currently studying here
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={!editing.institution}
              className="flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
              <Check size={13} /> Save
            </button>
            <button onClick={cancel} className="px-4 py-2 text-xs bg-white/10 border border-white/15 rounded-lg text-white/60 hover:bg-white/20 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Experience Section ────────────────────────────────────────────
function ExperienceSection({ entries, onChange }: { entries: ExperienceEntry[]; onChange: (e: ExperienceEntry[]) => void }) {
  const blank = (): ExperienceEntry => ({ id: crypto.randomUUID(), company: "", title: "", location: "", start_month: "", end_month: "", is_current: false, description: "" });
  const [editing, setEditing] = useState<ExperienceEntry | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => { setEditing(blank()); setIsNew(true); };
  const openEdit = (e: ExperienceEntry) => { setEditing({ ...e }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.company || !editing.title) return;
    if (isNew) onChange([...entries, editing]);
    else onChange(entries.map(e => e.id === editing.id ? editing : e));
    cancel();
  };

  const remove = (id: string) => onChange(entries.filter(e => e.id !== id));

  const formatMonth = (m: string) => {
    if (!m) return "";
    const [year, month] = m.split("-");
    if (!year || !month) return m;
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "short", year: "numeric" });
  };

  return (
    <div className={`${glassCard} p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Building2 size={16} />
          Work Experience
          <span className="text-xs font-normal text-amber-400 flex items-center gap-1"><Star size={10} fill="currentColor" /> Recommended</span>
        </h3>
        {!editing && (
          <button onClick={openNew} className="flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:text-white transition-colors">
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* Existing entries */}
      {entries.map(entry => (
        <div key={entry.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 size={14} className="text-primary-light" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{entry.title}</p>
            <p className="text-xs text-white/60 truncate">{entry.company}{entry.location ? ` · ${entry.location}` : ""}</p>
            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
              <Calendar size={10} />
              {formatMonth(entry.start_month)}{entry.start_month ? " – " : ""}{entry.is_current ? "Present" : formatMonth(entry.end_month)}
            </p>
            {entry.description && <p className="text-xs text-white/50 mt-1 line-clamp-2">{entry.description}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openEdit(entry)} className="p-1.5 text-white/30 hover:text-white transition-colors"><Edit3 size={13} /></button>
            <button onClick={() => remove(entry.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {entries.length === 0 && !editing && (
        <div className="text-center py-4 border border-dashed border-white/15 rounded-lg">
          <p className="text-xs text-white/30">Add your work history to show recruiters your experience</p>
          <button onClick={openNew} className="text-xs text-primary-light hover:underline mt-1">+ Add experience</button>
        </div>
      )}

      {/* Add / Edit form */}
      {editing && (
        <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{isNew ? "Add Experience" : "Edit Experience"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Job Title *</label>
              <input value={editing.title} onChange={e => setEditing(prev => prev ? { ...prev, title: e.target.value } : prev)}
                placeholder="e.g. Software Engineer" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Company *</label>
              <input value={editing.company} onChange={e => setEditing(prev => prev ? { ...prev, company: e.target.value } : prev)}
                placeholder="e.g. Google" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Location</label>
              <input value={editing.location} onChange={e => setEditing(prev => prev ? { ...prev, location: e.target.value } : prev)}
                placeholder="e.g. Lagos, Nigeria" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Start Date</label>
              <input type="month" value={editing.start_month} onChange={e => setEditing(prev => prev ? { ...prev, start_month: e.target.value } : prev)}
                className={glassInput} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">End Date</label>
              <input type="month" value={editing.end_month} disabled={editing.is_current}
                onChange={e => setEditing(prev => prev ? { ...prev, end_month: e.target.value } : prev)}
                className={`${glassInput} disabled:opacity-40`} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60">
                <input type="checkbox" checked={editing.is_current}
                  onChange={e => setEditing(prev => prev ? { ...prev, is_current: e.target.checked, end_month: "" } : prev)}
                  className="w-4 h-4 rounded accent-primary" />
                I currently work here
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/50 mb-1">Description</label>
              <textarea value={editing.description} onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : prev)}
                rows={3} placeholder="Brief description of your role and achievements..."
                className={`${glassInput} resize-none`} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={!editing.company || !editing.title}
              className="flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
              <Check size={13} /> Save
            </button>
            <button onClick={cancel} className="px-4 py-2 text-xs bg-white/10 border border-white/15 rounded-lg text-white/60 hover:bg-white/20 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────
function ProfileTab({ userId, baseProfile, onProfileSaved }: {
  userId: string;
  baseProfile: { full_name: string | null; email: string | null; linkedin_url: string | null };
  onProfileSaved: () => void;
}) {
  const supabase = createClient();
  const [ep, setEp] = useState<EmployeeProfile>({
    headline: "", bio: "", skills: [], location: "",
    desired_job_type: "full-time", desired_workplace: "any",
    desired_salary_min: null, desired_salary_max: null,
    is_open_to_work: true,
    linkedin_url: baseProfile.linkedin_url || "",
    education: [],
    experience: [],
  });
  const [fullName, setFullName] = useState(baseProfile.full_name || "");
  const [cvUrl, setCvUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("employee_profiles").select("*").eq("id", userId).single(),
      supabase.from("profiles").select("full_name,linkedin_url").eq("id", userId).single(),
    ]).then(([{ data: empData }, { data: profileData }]) => {
      if (empData) {
        setEp({
          headline: empData.headline || "",
          bio: empData.bio || "",
          skills: empData.skills || [],
          location: empData.location || "",
          desired_job_type: empData.desired_job_type || "full-time",
          desired_workplace: empData.desired_workplace || "any",
          desired_salary_min: empData.desired_salary_min,
          desired_salary_max: empData.desired_salary_max,
          is_open_to_work: empData.is_open_to_work ?? true,
          linkedin_url: profileData?.linkedin_url || "",
          education: empData.education || [],
          experience: empData.experience || [],
        });
        if (empData.cv_url) setCvUrl(empData.cv_url);
      }
      if (profileData?.full_name) setFullName(profileData.full_name);
      setLoading(false);
    });
  }, [userId, supabase]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !ep.skills.includes(s)) setEp(prev => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };
  const removeSkill = (s: string) => setEp(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from("profiles").update({ full_name: fullName, linkedin_url: ep.linkedin_url, updated_at: new Date().toISOString() }).eq("id", userId),
      supabase.from("employee_profiles").upsert({
        id: userId, headline: ep.headline, bio: ep.bio, skills: ep.skills,
        location: ep.location, desired_job_type: ep.desired_job_type,
        desired_workplace: ep.desired_workplace, desired_salary_min: ep.desired_salary_min,
        desired_salary_max: ep.desired_salary_max, is_open_to_work: ep.is_open_to_work,
        education: ep.education, experience: ep.experience,
        ...(cvUrl ? { cv_url: cvUrl } : {}),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }),
    ]);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onProfileSaved();
  };

  const handleReset = async () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return; }
    setConfirmReset(false);
    setResetting(true);
    const blank = {
      headline: "", bio: "", skills: [], location: "",
      desired_job_type: "full-time" as const, desired_workplace: "any" as const,
      desired_salary_min: null, desired_salary_max: null,
      is_open_to_work: true, linkedin_url: "", education: [], experience: [],
    };
    await Promise.all([
      supabase.from("profiles").update({ full_name: "", linkedin_url: "", updated_at: new Date().toISOString() }).eq("id", userId),
      supabase.from("employee_profiles").upsert({
        id: userId, ...blank, cv_url: null, updated_at: new Date().toISOString(),
      }, { onConflict: "id" }),
    ]);
    setEp(blank);
    setFullName("");
    setCvUrl(undefined);
    setResetting(false);
    onProfileSaved();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  const isComplete = !!fullName && !!ep.headline && !!ep.location && ep.skills.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Profile</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} disabled={resetting}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-all disabled:opacity-50 ${
              confirmReset
                ? "bg-red-500 border-red-500 text-white animate-pulse"
                : "border-red-400/40 text-red-400 hover:bg-red-400/10 hover:border-red-400"
            }`}>
            {resetting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {resetting ? "Clearing…" : confirmReset ? "Confirm?" : "Clear Profile"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* CV Upload */}
      <CVUploadSection
        userId={userId}
        savedCvUrl={cvUrl}
        onApply={(cv) => {
          if (cv.cv_url) setCvUrl(cv.cv_url);
          setFullName(prev => prev || cv.full_name || prev);
          setEp(prev => ({
            ...prev,
            headline: prev.headline || cv.headline || "",
            bio: prev.bio || cv.bio || "",
            linkedin_url: prev.linkedin_url || cv.linkedin_url || "",
            skills: prev.skills.length > 0 ? [...new Set([...prev.skills, ...cv.skills])] : cv.skills,
            education: prev.education.length > 0 ? prev.education : cv.education,
            experience: prev.experience.length > 0 ? prev.experience : cv.experience,
          }));
        }}
      />

      {/* Completion banner */}
      {!isComplete && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/15 border border-amber-400/30">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Complete your profile to unlock all features</p>
            <p className="text-xs text-amber-300/70 mt-0.5">Required: Full name, headline, location, and at least one skill. LinkedIn is optional.</p>
          </div>
        </div>
      )}

      {/* Open to work */}
      <div className={`${glassCard} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white text-sm">Open to Work</p>
            <p className="text-xs text-white/50 mt-0.5">Recruiters can see you&apos;re looking for opportunities</p>
          </div>
          <button onClick={() => setEp(prev => ({ ...prev, is_open_to_work: !prev.is_open_to_work }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${ep.is_open_to_work ? "bg-emerald-500" : "bg-white/20"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ep.is_open_to_work ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Basic info */}
      <div className={`${glassCard} p-5 space-y-4`}>
        <h3 className="font-semibold text-white flex items-center gap-2"><Edit3 size={15} /> Basic Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Full Name <span className="text-red-400">*</span></label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className={glassInput} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Location <span className="text-red-400">*</span></label>
            <input value={ep.location} onChange={e => setEp(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Lagos, Nigeria" className={glassInput} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Professional Headline <span className="text-red-400">*</span></label>
            <input value={ep.headline} onChange={e => setEp(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="e.g. Senior Software Engineer" className={glassInput} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">
              LinkedIn Profile URL <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={ep.linkedin_url} onChange={e => setEp(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                className={`${glassInput} pl-9`} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/60 mb-1">Bio</label>
            <textarea value={ep.bio} onChange={e => setEp(prev => ({ ...prev, bio: e.target.value }))} rows={3}
              placeholder="Tell recruiters a bit about yourself..."
              className={`${glassInput} resize-none`} />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className={`${glassCard} p-5 space-y-4`}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          Skills <span className="text-red-400 text-xs font-normal">(at least one required)</span>
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {ep.skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 text-xs bg-primary/30 border border-primary/40 text-white px-2.5 py-1 rounded-full">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-red-300 transition-colors"><X size={11} /></button>
            </span>
          ))}
          {ep.skills.length === 0 && <p className="text-xs text-white/30">No skills added yet</p>}
        </div>
        <div className="flex gap-2">
          <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill and press Enter"
            className={glassInput} />
          <button onClick={addSkill} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Education */}
      <EducationSection
        entries={ep.education}
        onChange={education => setEp(prev => ({ ...prev, education }))}
      />

      {/* Experience */}
      <ExperienceSection
        entries={ep.experience}
        onChange={experience => setEp(prev => ({ ...prev, experience }))}
      />

      {/* Job preferences */}
      <div className={`${glassCard} p-5 space-y-4`}>
        <h3 className="font-semibold text-white">Job Preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Job Type</label>
            <select value={ep.desired_job_type} onChange={e => setEp(prev => ({ ...prev, desired_job_type: e.target.value }))} className={glassSelect}>
              {["full-time","part-time","contract","freelance","internship"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Workplace</label>
            <select value={ep.desired_workplace} onChange={e => setEp(prev => ({ ...prev, desired_workplace: e.target.value }))} className={glassSelect}>
              {["any","remote","hybrid","onsite"].map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Min. Salary (USD/yr)</label>
            <input type="number" value={ep.desired_salary_min || ""} onChange={e => setEp(prev => ({ ...prev, desired_salary_min: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder="e.g. 50000" className={glassInput} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Max. Salary (USD/yr)</label>
            <input type="number" value={ep.desired_salary_max || ""} onChange={e => setEp(prev => ({ ...prev, desired_salary_max: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder="e.g. 100000" className={glassInput} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Jobs Tab ───────────────────────────────────────────────
function SavedJobsTab({ userId, onCountChange }: { userId: string; onCountChange: (n: number) => void }) {
  const supabase = createClient();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [exiting, setExiting] = useState(false);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from("saved_jobs").select("*").eq("employee_id", userId).order("saved_at", { ascending: false });
    setJobs(data || []);
    onCountChange((data || []).length);
    setLoading(false);
  }, [userId, supabase, onCountChange]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const remove = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id);
    setJobs(prev => { const u = prev.filter(j => j.id !== id); onCountChange(u.length); return u; });
  };

  const openDrawer = async (saved: SavedJob) => {
    setLoadingJob(true);
    setSelectedJob(null);
    try {
      let jobData: any = null;
      if (saved.job_id) {
        const { data } = await supabase.from("jobs").select("*").eq("id", saved.job_id).single();
        if (data) {
          jobData = data;
        }
      }
      if (jobData) {
        setSelectedJob({
          id: jobData.id,
          title: jobData.title,
          company: jobData.company || saved.job_company,
          companyLogo: ((jobData.company || saved.job_company || "").charAt(0).toUpperCase()),
          location: jobData.location || saved.job_location || "Remote",
          country: jobData.country || "",
          region: jobData.region || "",
          collar: jobData.collar || "white",
          workplace: jobData.workplace || "onsite",
          seniority: jobData.seniority || "mid",
          commitment: jobData.type || "fulltime",
          salary: jobData.salary_min || jobData.salary_max
            ? `$${(jobData.salary_min || 0).toLocaleString()} - $${(jobData.salary_max || 0).toLocaleString()}`
            : saved.job_salary || "Competitive",
          salaryMin: jobData.salary_min || 0,
          salaryMax: jobData.salary_max || 0,
          industry: jobData.industry || "Other",
          type: jobData.type || "full-time",
          posted: jobData.created_at
            ? (() => { const d = Math.floor((Date.now() - new Date(jobData.created_at).getTime()) / 86400000); return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`; })()
            : "Recently",
          urgent: jobData.is_urgent || false,
          featured: jobData.is_featured || false,
          skills: jobData.skills || [],
          staffingAgency: false,
          description: jobData.description || "",
          external_url: jobData.external_url || saved.external_url,
        });
      } else {
        // Fallback: use saved job data directly
        setSelectedJob({
          id: saved.job_id,
          title: saved.job_title,
          company: saved.job_company,
          companyLogo: (saved.job_company || "J").charAt(0),
          location: saved.job_location || "Remote",
          country: "",
          region: "",
          collar: "white",
          workplace: "onsite",
          seniority: "mid",
          commitment: "fulltime",
          salary: saved.job_salary || "Competitive",
          salaryMin: 0,
          salaryMax: 0,
          industry: "Other",
          type: "full-time",
          posted: `Saved ${new Date(saved.saved_at).toLocaleDateString()}`,
          urgent: false,
          featured: false,
          skills: [],
          staffingAgency: false,
          description: "",
          external_url: saved.external_url,
        });
      }
    } catch { /* */ }
    setLoadingJob(false);
  };

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => { setSelectedJob(null); setExiting(false); }, 150);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Saved Jobs</h2>
        <a href="/" className="text-sm font-medium text-[#7eb3ff] hover:underline">Browse more →</a>
      </div>

      {jobs.length === 0 ? (
        <div className={`text-center py-20 ${glassCard}`}>
          <Bookmark size={40} className="mx-auto text-white/20 mb-3" />
          <p className="font-medium text-white/70 mb-1">No saved jobs yet</p>
          <p className="text-sm text-white/40 mb-4">Browse jobs and click the bookmark icon to save them here.</p>
          <a href="/" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <Briefcase size={15} /> Browse Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} onClick={() => openDrawer(job)} className={`${glassCard} p-4 flex items-start gap-4 hover:bg-white/15 transition-all cursor-pointer`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(job.job_company || "J").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{job.job_title || "Job"}</h3>
                <div className="flex flex-wrap items-center gap-x-3 text-sm text-white/50 mt-0.5">
                  {job.job_company && <span>{job.job_company}</span>}
                  {job.job_location && <span className="flex items-center gap-1"><MapPin size={12} />{job.job_location}</span>}
                  {job.job_salary && <span className="text-emerald-400 font-medium">{job.job_salary}</span>}
                </div>
                <p className="text-xs text-white/30 mt-1">Saved {new Date(job.saved_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {job.external_url && (
                  <a href={job.external_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/10 border border-white/15 text-white/50 hover:text-white hover:bg-white/20 transition-colors">
                    <ExternalLink size={15} />
                  </a>
                )}
                <button onClick={() => remove(job.id)}
                  className="p-2 rounded-lg bg-white/10 border border-white/15 text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Job Drawer ── */}
      {/* ── Job Drawer ── */}
      {selectedJob && (
        <>
          <div onClick={handleClose}
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${exiting ? "opacity-0" : "opacity-100"}`} />
          <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-dark-surface border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-150 ${exiting ? "translate-x-full" : "translate-x-0"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <button onClick={handleClose} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                <ChevronLeft size={18} /> Back
              </button>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingJob ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>
              ) : selectedJob ? (
                <>
                  {/* Job Header Section */}
                  <div className="px-5 py-6 border-b border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {selectedJob.companyLogo || (selectedJob.company?.charAt(0) || "J")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white leading-tight">{selectedJob.title}</h2>
                        <p className="text-base text-white/60 mt-1">{selectedJob.company || "Confidential"}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-white/50">
                          <span className="flex items-center gap-1.5"><MapPin size={15} />{selectedJob.location}</span>
                          {selectedJob.salary !== "Competitive" && (
                            <span className="flex items-center gap-1.5"><DollarSign size={15} />{selectedJob.salary}</span>
                          )}
                          <span className="flex items-center gap-1.5"><Briefcase size={15} />{selectedJob.type}</span>
                          <span className="flex items-center gap-1.5"><Clock size={15} />{selectedJob.posted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-5 flex-wrap">
                      {selectedJob.external_url ? (
                        <a href={selectedJob.external_url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors text-sm text-center">
                          Apply Job
                        </a>
                      ) : (
                        <a href={`/jobs/${selectedJob.id}`} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors text-sm text-center">
                          View Details
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-5 py-5 space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-2">Description</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {(selectedJob.description || "").slice(0, 350)}
                        {selectedJob.description && selectedJob.description.length > 350 && selectedJob.external_url && (
                          <a href={selectedJob.external_url} target="_blank" rel="noopener noreferrer"
                            className="text-[#7eb3ff] font-medium hover:underline ml-1 inline">
                            ... Read More
                          </a>
                        )}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    {(() => {
                      const desc = selectedJob.description || "";
                      const bullets = desc.split(/\n/).filter((l: string) => {
                        const tr = l.trim();
                        return (tr.startsWith("-") || tr.startsWith("•") || tr.startsWith("*") || /^\d+[.)]/.test(tr)) &&
                          tr.replace(/^[-•*\d.)\s]+/, "").length > 15;
                      }).map((l: string) => l.replace(/^[-•*\d.)\s]+/, "").trim()).slice(0, 6);
                      if (bullets.length < 3) return null;
                      return (
                        <div>
                          <h3 className="text-base font-semibold text-white mb-2">Responsibilities</h3>
                          <ul className="space-y-2">
                            {bullets.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                                <Check size={14} className="text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    {/* Skills */}
                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-white mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((s: string) => (
                            <span key={s} className="text-xs bg-primary/20 text-blue-300 border border-primary/30 px-2.5 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div>
                        <p className="text-xs text-white/40">Industry</p>
                        <p className="text-sm font-medium text-white mt-0.5">{selectedJob.industry || "Other"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Job Type</p>
                        <p className="text-sm font-medium text-white mt-0.5 capitalize">{selectedJob.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Seniority</p>
                        <p className="text-sm font-medium text-white mt-0.5 capitalize">{(selectedJob.seniority || "").replace("-", " ")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Workplace</p>
                        <p className="text-sm font-medium text-white mt-0.5 capitalize">{selectedJob.workplace}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Location</p>
                        <p className="text-sm font-medium text-white mt-0.5">{selectedJob.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Region</p>
                        <p className="text-sm font-medium text-white mt-0.5">{selectedJob.region || selectedJob.country}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-20 text-white/40 text-sm">Could not load job details.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────────
function AlertsTab({ userId, onCountChange }: { userId: string; onCountChange: (n: number) => void }) {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [creating, setCreating] = useState(false);

  const fetchAlerts = useCallback(async () => {
    const { data } = await supabase.from("job_alerts").select("*").eq("employee_id", userId).order("created_at", { ascending: false });
    const list = data || [];
    setAlerts(list);
    onCountChange(list.filter(a => a.is_active).length);
    setLoading(false);
  }, [userId, supabase, onCountChange]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async () => {
    if (!keyword && !location) return;
    setCreating(true);
    await supabase.from("job_alerts").insert({ employee_id: userId, keyword, location, frequency, is_active: true });
    setKeyword(""); setLocation(""); setFrequency("daily"); setShowForm(false);
    await fetchAlerts();
    setCreating(false);
  };

  const toggleAlert = async (id: string, current: boolean) => {
    await supabase.from("job_alerts").update({ is_active: !current }).eq("id", id);
    setAlerts(prev => { const u = prev.map(a => a.id === id ? { ...a, is_active: !current } : a); onCountChange(u.filter(a => a.is_active).length); return u; });
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("job_alerts").delete().eq("id", id);
    setAlerts(prev => { const u = prev.filter(a => a.id !== id); onCountChange(u.filter(a => a.is_active).length); return u; });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Job Alerts</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={15} /> New Alert
        </button>
      </div>

      {showForm && (
        <div className={`${glassCard} border-primary/40 p-5 space-y-4`}>
          <h3 className="font-semibold text-white text-sm">Create Job Alert</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Keyword</label>
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. Software Engineer" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className={glassInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} className={glassSelect}>
                <option value="instant" className="bg-gray-900">Instant</option>
                <option value="daily" className="bg-gray-900">Daily Digest</option>
                <option value="weekly" className="bg-gray-900">Weekly Digest</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createAlert} disabled={creating || (!keyword && !location)}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-60 transition-colors">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Create Alert
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-white/10 border border-white/15 rounded-lg text-white/70 hover:bg-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 && !showForm ? (
        <div className={`text-center py-20 ${glassCard}`}>
          <Bell size={40} className="mx-auto text-white/20 mb-3" />
          <p className="font-medium text-white/70 mb-1">No job alerts yet</p>
          <p className="text-sm text-white/40">Create alerts to get notified when matching jobs are posted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`${glassCard} p-4 flex items-center gap-4 hover:bg-white/15 transition-all`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${alert.is_active ? "bg-emerald-400" : "bg-white/20"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">
                  {[alert.keyword, alert.location].filter(Boolean).join(" in ") || "Any jobs"}
                </p>
                <p className="text-xs text-white/40 mt-0.5 capitalize">{alert.frequency} · {alert.is_active ? "Active" : "Paused"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                    alert.is_active
                      ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-400/10"
                      : "border-white/20 text-white/50 hover:bg-white/10"
                  }`}>
                  {alert.is_active ? "Pause" : "Resume"}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Employee Dashboard ──────────────────────────────────────
export default function EmployeeDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [savedCount, setSavedCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileCheckDone, setProfileCheckDone] = useState(false);
  // Only auto-navigate to overview on the very first load, never after a manual save
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/sign-in";
    if (!loading && profile && profile.role !== "employee") {
      window.location.href = `/dashboard/${profile.role}`;
    }
  }, [loading, user, profile]);

  // Check profile completion — redirect parameter controls whether to navigate
  const checkCompletion = useCallback(async (redirectIfComplete = false) => {
    if (!user || !profile) return;
    const { data } = await supabase.from("employee_profiles")
      .select("headline, location, skills")
      .eq("id", user.id)
      .single();
    const complete = !!profile.full_name && !!data?.headline && !!data?.location && (data?.skills?.length ?? 0) > 0;
    setIsProfileComplete(complete);
    setProfileCheckDone(true);
    if (complete && redirectIfComplete) setActiveTab("overview");
  }, [user, profile, supabase]);

  useEffect(() => {
    if (!loading && user && profile && !initialCheckDone.current) {
      initialCheckDone.current = true;
      checkCompletion(true); // only this call may redirect
    }
  }, [loading, user, profile, checkCompletion]);

  if (loading || !user || !profile || !profileCheckDone) {
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
        isProfileComplete={isProfileComplete}
      />

      <main className="flex-1 min-w-0 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {activeTab === "overview" && (
            <OverviewTab savedCount={savedCount} alertCount={alertCount} name={profile.full_name} setActiveTab={setActiveTab} />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              userId={user.id}
              baseProfile={{ full_name: profile.full_name, email: profile.email, linkedin_url: profile.linkedin_url }}
              onProfileSaved={() => checkCompletion(false)}
            />
          )}
          {activeTab === "saved" && <SavedJobsTab userId={user.id} onCountChange={setSavedCount} />}
          {activeTab === "alerts" && <AlertsTab userId={user.id} onCountChange={setAlertCount} />}
        </div>
      </main>
    </div>
  );
}


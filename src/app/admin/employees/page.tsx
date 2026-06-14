"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Star,
  Calendar,
} from "lucide-react";

const employees = [
  { id: 1, name: "John Doe", email: "john@email.com", location: "Lagos, Nigeria", skills: ["React", "TypeScript", "Node.js"], verified: true, premium: true, applied: 24, joined: "Jan 2025" },
  { id: 2, name: "Jane Smith", email: "jane@email.com", location: "Nairobi, Kenya", skills: ["Marketing", "SEO", "Content"], verified: true, premium: false, applied: 18, joined: "Feb 2025" },
  { id: 3, name: "Ali Khan", email: "ali@email.com", location: "Karachi, Pakistan", skills: ["Python", "ML", "SQL"], verified: true, premium: true, applied: 31, joined: "Mar 2025" },
  { id: 4, name: "Maria Garcia", email: "maria@email.com", location: "Mexico City, Mexico", skills: ["UI/UX", "Figma", "Design Systems"], verified: false, premium: false, applied: 12, joined: "Mar 2025" },
  { id: 5, name: "Samuel Osei", email: "samuel@email.com", location: "Accra, Ghana", skills: ["Finance", "Excel", "Analysis"], verified: true, premium: false, applied: 8, joined: "Apr 2025" },
  { id: 6, name: "Aisha Mohammed", email: "aisha@email.com", location: "Dubai, UAE", skills: ["Sales", "CRM", "Negotiation"], verified: true, premium: true, applied: 15, joined: "Apr 2025" },
  { id: 7, name: "Carlos Rivera", email: "carlos@email.com", location: "Toronto, Canada", skills: ["DevOps", "AWS", "Kubernetes"], verified: false, premium: false, applied: 9, joined: "May 2025" },
  { id: 8, name: "Fatima Diallo", email: "fatima@email.com", location: "Dakar, Senegal", skills: ["HR", "Recruiting", "Payroll"], verified: true, premium: false, applied: 6, joined: "May 2025" },
];

export default function AdminEmployees() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = employees.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || (filter === "premium" && e.premium) || (filter === "verified" && e.verified) || (filter === "basic" && !e.premium);
    return matchesSearch && matchesFilter;
  });

  const premiumCount = employees.filter((e) => e.premium).length;
  const verifiedCount = employees.filter((e) => e.verified).length;
  const totalApplied = employees.reduce((s, e) => s + e.applied, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage registered candidates</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: employees.length, color: "bg-blue-500" },
          { label: "Premium", value: premiumCount, color: "bg-amber-500" },
          { label: "Verified", value: verifiedCount, color: "bg-emerald-500" },
          { label: "Total Applications", value: totalApplied, color: "bg-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-1">
          {["all", "premium", "verified", "basic"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((e) => (
          <div key={e.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {e.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex gap-1">
                {e.premium && <Star size={14} className="text-amber-500 fill-amber-500" />}
                {e.verified ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-gray-400" />}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{e.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {e.location}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {e.skills.slice(0, 3).map((s) => (
                <span key={s} className="text-[10px] bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{s}</span>
              ))}
              {e.skills.length > 3 && <span className="text-[10px] text-gray-400">+{e.skills.length - 3}</span>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400">{e.applied} applications</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Joined {e.joined}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

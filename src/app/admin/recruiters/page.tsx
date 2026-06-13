"use client";

import { useState } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const allRecruiters = [
  { id: 1, name: "Sarah Johnson", company: "TechCorp", email: "sarah@techcorp.com", phone: "+1 555-0101", jobs: 24, hires: 12, verified: true, joined: "Jan 2025", status: "active", plan: "Enterprise" },
  { id: 2, name: "Mark Wilson", company: "BrandBoost", email: "mark@brandboost.com", phone: "+1 555-0102", jobs: 18, hires: 9, verified: true, joined: "Feb 2025", status: "active", plan: "Professional" },
  { id: 3, name: "Emily Chen", company: "DataFlow AI", email: "emily@dataflow.ai", phone: "+1 555-0103", jobs: 15, hires: 7, verified: true, joined: "Mar 2025", status: "active", plan: "Enterprise" },
  { id: 4, name: "James Okafor", company: "InnoVentures", email: "james@innoventures.com", phone: "+1 555-0104", jobs: 12, hires: 5, verified: true, joined: "Mar 2025", status: "active", plan: "Professional" },
  { id: 5, name: "Priya Patel", company: "CloudStack", email: "priya@cloudstack.com", phone: "+1 555-0105", jobs: 10, hires: 4, verified: false, joined: "Apr 2025", status: "pending", plan: "Starter" },
  { id: 6, name: "Ahmed Hassan", company: "SecureNet", email: "ahmed@securenet.com", phone: "+1 555-0106", jobs: 8, hires: 3, verified: true, joined: "Apr 2025", status: "active", plan: "Professional" },
  { id: 7, name: "Lisa Thompson", company: "GreenEnergy Co", email: "lisa@greenenergy.com", phone: "+1 555-0107", jobs: 6, hires: 2, verified: false, joined: "May 2025", status: "suspended", plan: "Starter" },
  { id: 8, name: "David Kim", company: "SaaSify", email: "david@saasify.com", phone: "+1 555-0108", jobs: 20, hires: 10, verified: true, joined: "Jan 2025", status: "active", plan: "Enterprise" },
];

export default function AdminRecruiters() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = allRecruiters.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = allRecruiters.filter((r) => r.status === "active").length;
  const pendingCount = allRecruiters.filter((r) => r.status === "pending").length;
  const totalJobs = allRecruiters.reduce((s, r) => s + r.jobs, 0);
  const totalHires = allRecruiters.reduce((s, r) => s + r.hires, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiters</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage platform recruiters</p>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Recruiters", value: allRecruiters.length, color: "bg-blue-500" },
          { label: "Active", value: activeCount, color: "bg-emerald-500" },
          { label: "Pending", value: pendingCount, color: "bg-amber-500" },
          { label: "Total Jobs", value: totalJobs, color: "bg-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search recruiters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-hover">
                <th className="px-4 py-3 font-medium">Recruiter</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Jobs</th>
                <th className="px-4 py-3 font-medium">Hires</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {r.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Joined {r.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.company}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{r.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.jobs}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.hires}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      r.plan === "Enterprise" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" :
                      r.plan === "Professional" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                      "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400"
                    }`}>{r.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      r.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                      r.status === "pending" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                      "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.verified ? (
                      <CheckCircle size={16} className="text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover rounded">
                      <MoreHorizontal size={15} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

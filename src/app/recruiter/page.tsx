"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Star,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Bell,
  UserPlus,
  MessageSquare,
  Zap,
  Send,
  Search,
} from "lucide-react";

const stats = [
  { label: "Talent Pool", value: "2,847", change: "+124 this week", icon: <Users size={18} />, color: "bg-blue-500", href: "/recruiter/talent-pool" },
  { label: "Watchlist", value: "48", change: "+12 this week", icon: <Star size={18} />, color: "bg-amber-500", href: "/recruiter/watchlist" },
  { label: "Active Jobs", value: "12", change: "3 expiring soon", icon: <Briefcase size={18} />, color: "bg-emerald-500", href: "/recruiter/post-job" },
  { label: "CRM Contacts", value: "156", change: "23 in pipeline", icon: <Eye size={18} />, color: "bg-purple-500", href: "/recruiter/crm" },
];

const recentActivity = [
  { action: "Contacted", name: "John Doe", role: "Frontend Engineer", time: "2 hours ago", icon: <Send size={14} />, color: "text-blue-500" },
  { action: "Interviewing", name: "Jane Smith", role: "Marketing Manager", time: "Yesterday", icon: <MessageSquare size={14} />, color: "text-amber-500" },
  { action: "Hired", name: "Ali Khan", role: "Data Scientist", time: "3 days ago", icon: <UserPlus size={14} />, color: "text-emerald-500" },
  { action: "Watchlisted", name: "Maria Garcia", role: "Product Designer", time: "5 days ago", icon: <Star size={14} />, color: "text-purple-500" },
  { action: "Rejected", name: "Samuel Osei", role: "Financial Analyst", time: "1 week ago", icon: <Users size={14} />, color: "text-red-500" },
];

const pipelineBreakdown = [
  { stage: "Contacted", count: 42, color: "bg-blue-500" },
  { stage: "Interviewing", count: 28, color: "bg-amber-500" },
  { stage: "Rejected", count: 15, color: "bg-red-500" },
  { stage: "Hired", count: 8, color: "bg-emerald-500" },
];

const totalPipeline = pipelineBreakdown.reduce((s, p) => s + p.count, 0);

export default function RecruiterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, Sarah</p>
        </div>
        <div className="flex gap-2">
          <Link href="/recruiter/post-job" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            Post a Job
          </Link>
          <Link href="/recruiter/ai-search" className="border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
            AI Search
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg ${s.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-white`}>{s.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <ArrowUpRight size={12} className="text-emerald-500" />
              {s.change}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">CRM Pipeline</h2>
          <div className="space-y-3">
            {pipelineBreakdown.map((p) => (
              <div key={p.stage}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{p.stage}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{p.count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-dark-hover rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: `${(p.count / totalPipeline) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/recruiter/crm" className="block text-center text-xs font-medium text-primary dark:text-primary-light mt-4 pt-3 border-t border-gray-100 dark:border-dark-border hover:underline">
            View full pipeline →
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 ${a.color}`}>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{a.action}:</span> {a.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.role} — {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/recruiter/post-job" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Briefcase size={16} className="text-blue-600 dark:text-blue-400" /></div>
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Post a New Job</p><p className="text-xs text-gray-500 dark:text-gray-400">Create a job listing</p></div>
            </Link>
            <Link href="/recruiter/talent-pool" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Users size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Browse Talent Pool</p><p className="text-xs text-gray-500 dark:text-gray-400">Find candidates</p></div>
            </Link>
            <Link href="/recruiter/ai-search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"><Search size={16} className="text-purple-600 dark:text-purple-400" /></div>
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">AI Candidate Search</p><p className="text-xs text-gray-500 dark:text-gray-400">Smart matching</p></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

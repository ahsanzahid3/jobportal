"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  MapPin,
  Briefcase,
  Clock,
  Plus,
  X,
  BellRing,
  BellOff,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const initialAlerts = [
  { id: 1, name: "Frontend Jobs - Nigeria", keywords: "React, Frontend, TypeScript", location: "Nigeria", frequency: "Daily", active: true, matches: 12 },
  { id: 2, name: "Remote Data Science", keywords: "Data Science, ML, Python", location: "Remote", frequency: "Weekly", active: true, matches: 8 },
  { id: 3, name: "Senior Roles - Africa", keywords: "Senior, Lead, Architect", location: "Africa", frequency: "Daily", active: false, matches: 24 },
  { id: 4, name: "Blue Collar - UAE", keywords: "Electrician, Welder, Plumber", location: "UAE", frequency: "Weekly", active: true, matches: 6 },
];

const featuredJobs = [
  { title: "Senior Frontend Engineer", company: "TechCorp", location: "Lagos, Nigeria", salary: "$80K - $120K", posted: "2 days ago", featured: true, match: 92 },
  { title: "Data Scientist", company: "DataFlow AI", location: "Karachi, Pakistan", salary: "$60K - $90K", posted: "Just now", featured: true, match: 88 },
  { title: "Full Stack Developer", company: "InnoVentures", location: "London, UK", salary: "$90K - $130K", posted: "1 day ago", featured: true, match: 85 },
  { title: "DevOps Engineer", company: "CloudStack", location: "Toronto, Canada", salary: "$95K - $140K", posted: "3 days ago", featured: true, match: 79 },
];

export default function JobAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showCreate, setShowCreate] = useState(false);

  const toggleAlert = (id: number) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get notified about jobs that match your preferences</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Job Alert</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Alert Name</label>
              <input type="text" placeholder="e.g. Frontend Jobs in Africa" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Keywords</label>
              <input type="text" placeholder="React, TypeScript, Frontend" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
              <input type="text" placeholder="Nigeria, Remote, etc." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Frequency</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 focus:border-primary outline-none">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Instant</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors w-full">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Alerts</h2>
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.active ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-dark-hover"
                }`}>
                  <Bell size={16} className={alert.active ? "text-emerald-500" : "text-gray-400"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{alert.name}</h3>
                    {alert.matches > 0 && (
                      <span className="text-[10px] font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-1.5 py-0.5 rounded">
                        {alert.matches} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.keywords}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {alert.location}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {alert.frequency}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleAlert(alert.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    alert.active ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover"
                  }`}>
                  {alert.active ? <BellRing size={15} /> : <BellOff size={15} />}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Job Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Featured Opportunities</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Sponsored</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredJobs.map((job, i) => (
            <div key={i} className="bg-white dark:bg-dark-card rounded-xl border border-amber-200 dark:border-amber-900/30 p-4 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                FEATURED
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white pr-16">{job.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{job.company}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={11} /> {job.location}
              </p>
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{job.salary}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{job.posted}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  {job.match}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

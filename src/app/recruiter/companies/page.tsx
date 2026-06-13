"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Users,
  Briefcase,
  Star,
  ExternalLink,
  Edit3,
  Plus,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

const companies = [
  { id: 1, name: "TechCorp", industry: "Software & Technology", location: "Lagos, Nigeria", employees: "250-500", openJobs: 24, rating: 4.5, verified: true, website: "techcorp.com", logo: "TC" },
  { id: 2, name: "BrandBoost", industry: "Marketing & Advertising", location: "Nairobi, Kenya", employees: "100-250", openJobs: 18, rating: 4.2, verified: true, website: "brandboost.com", logo: "BB" },
  { id: 3, name: "DataFlow AI", industry: "AI & Machine Learning", location: "Karachi, Pakistan", employees: "50-100", openJobs: 15, rating: 4.8, verified: true, website: "dataflow.ai", logo: "DF" },
  { id: 4, name: "InnoVentures", industry: "SaaS & Cloud", location: "London, UK", employees: "200-500", openJobs: 12, rating: 4.3, verified: true, website: "innoventures.com", logo: "IV" },
  { id: 5, name: "CloudStack", industry: "Cloud Infrastructure", location: "Toronto, Canada", employees: "100-250", openJobs: 10, rating: 4.1, verified: true, website: "cloudstack.com", logo: "CS" },
  { id: 6, name: "SecureNet", industry: "Cybersecurity", location: "Abuja, Nigeria", employees: "50-150", openJobs: 8, rating: 4.6, verified: true, website: "securenet.com", logo: "SN" },
  { id: 7, name: "GreenEnergy Co", industry: "Energy & Utilities", location: "Casablanca, Morocco", employees: "100-200", openJobs: 6, rating: 4.0, verified: false, website: "greenenergy.com", logo: "GE" },
  { id: 8, name: "SaaSify", industry: "SaaS & Cloud", location: "Lagos, Nigeria", employees: "150-300", openJobs: 20, rating: 4.4, verified: true, website: "saasify.com", logo: "SF" },
];

export default function RecruiterCompanies() {
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Companies</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage companies you work with</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          <Plus size={16} />
          Add Company
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-base font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {c.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    {c.verified && <Star size={12} className="text-blue-500 fill-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.industry}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {c.location}
                  </p>
                </div>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors">
                <Edit3 size={14} />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Users size={12} /> {c.employees} employees</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {c.openJobs} open jobs</span>
              <span className="flex items-center gap-1"><Star size={12} /> {c.rating}</span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
              <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary dark:text-primary-light hover:underline flex items-center gap-1">
                <Globe size={12} /> {c.website}
              </a>
              <Link href="/recruiter/post-job" className="text-xs font-medium text-primary dark:text-primary-light hover:underline">
                Post a job →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

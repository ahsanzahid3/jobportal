"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  LayoutDashboard,
  Users,
  Star,
  ListChecks,
  Building2,
  Briefcase,
  Search,
  } from "lucide-react";
import { LinkedinIcon } from "@/components/LinkedinIcon";

const recruiterSections = [
  {
    title: "Recruiting",
    items: [
      { label: "Overview", href: "/recruiter", icon: <LayoutDashboard size={16} /> },
      { label: "Talent Pool", href: "/recruiter/talent-pool", icon: <Users size={16} /> },
      { label: "Watchlist", href: "/recruiter/watchlist", icon: <Star size={16} /> },
      { label: "CRM Pipeline", href: "/recruiter/crm", icon: <ListChecks size={16} /> },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Companies", href: "/recruiter/companies", icon: <Building2 size={16} /> },
      { label: "Post a Job", href: "/recruiter/post-job", icon: <Briefcase size={16} /> },
      { label: "AI Search", href: "/recruiter/ai-search", icon: <Search size={16} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "LinkedIn", href: "/recruiter", icon: <LinkedinIcon size={16} /> },
    ],
  },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <DashboardSidebar
        sections={recruiterSections}
        panel="recruiter"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

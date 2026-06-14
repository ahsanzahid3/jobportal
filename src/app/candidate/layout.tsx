"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  User,
  CheckCircle,
  Bell,
  FileText,
  Settings,
} from "lucide-react";
import { LinkedinIcon } from "@/components/LinkedinIcon";

const candidateSections = [
  {
    title: "Profile",
    items: [
      { label: "My Profile", href: "/candidate", icon: <User size={16} /> },
      { label: "Verification", href: "/candidate/verification", icon: <CheckCircle size={16} /> },
      { label: "Job Alerts", href: "/candidate/alerts", icon: <Bell size={16} /> },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "LinkedIn", href: "/candidate", icon: <LinkedinIcon size={16} /> },
    ],
  },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <DashboardSidebar
        sections={candidateSections}
        panel="candidate"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

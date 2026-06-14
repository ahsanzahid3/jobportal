"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Users, Briefcase, Shield } from "lucide-react";

const adminSections = [
  {
    title: "Main",
    items: [
      { label: "Analytics", href: "/admin", icon: <LayoutDashboard size={16} /> },
      { label: "Recruiters", href: "/admin/recruiters", icon: <Users size={16} /> },
      { label: "Employees", href: "/admin/employees", icon: <Briefcase size={16} /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/admin", icon: <Shield size={16} /> },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <DashboardSidebar
        sections={adminSections}
        panel="admin"
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

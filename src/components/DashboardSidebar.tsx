"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  UserCheck,
  UserPlus,
  UserX,
  Settings,
  Search,
  Star,
  MessageSquare,
  ListChecks,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  TrendingUp,
  Eye,
  Zap,
  DollarSign,
  BarChart3,
  LogOut,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  sections: SidebarSection[];
  panel: "admin" | "recruiter" | "candidate";
  collapsed?: boolean;
  onToggle?: () => void;
}

const panelColors: Record<string, string> = {
  admin: "bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-indigo-950",
  recruiter: "bg-gradient-to-b from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950",
  candidate: "bg-gradient-to-b from-emerald-600 to-emerald-800 dark:from-emerald-900 dark:to-emerald-950",
};

const panelAccents: Record<string, string> = {
  admin: "text-indigo-100 border-indigo-400",
  recruiter: "text-blue-100 border-blue-400",
  candidate: "text-emerald-100 border-emerald-400",
};

export default function DashboardSidebar({
  sections,
  panel,
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isDark, toggle } = useTheme();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } shrink-0 min-h-screen ${panelColors[panel]} transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-white tracking-tight">
              {panel === "admin"
                ? "Admin"
                : panel === "recruiter"
                ? "Recruiter"
                : "Candidate"}
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-none">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-3 mb-2">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <LogOut size={16} />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>
    </aside>
  );
}

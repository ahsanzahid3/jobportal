'use client'

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import Link from "next/link"
import { Briefcase, ArrowLeft, HelpCircle, Mail, MessageCircle, FileText } from "lucide-react"
import { useI18n } from "@/i18n/context";


function SupportContent() {
  const { mounted } = useTheme()
  const { t } = useI18n()
  if (!mounted) return null

  const topics = [
    { icon: <HelpCircle size={20} />, title: t("page.support.getting_started"), desc: t("page.support.getting_started_desc") },
    { icon: <FileText size={20} />, title: "Account & Billing", desc: "Manage your subscription, payment methods, and invoices." },
    { icon: <MessageCircle size={20} />, title: "Job Applications", desc: "Track your applications, interview requests, and offers." },
    { icon: <Briefcase size={20} />, title: t("page.support.employers"), desc: t("page.support.employers_desc") },
    { icon: <Mail size={20} />, title: "Contact Us", desc: "Reach our support team — we typically respond within 24 hours." },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] transition-colors">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#2a2e3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">CareerPortal</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            {t("nav.back_to_jobs")}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("page.support.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">{t("page.support.subtitle")}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <div key={i} className="p-6 bg-white dark:bg-[#1e2230] border border-gray-200 dark:border-[#2a2e3a] rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">{topic.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{topic.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{topic.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2a2e3a] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">&copy; 2025 {t("site.title")}. {t("footer.rights")}</div>
      </footer>
    </div>
  )
}

export default function SupportPage() {
  return (
    <ThemeProvider>
      <SupportContent />
    </ThemeProvider>
  )
}

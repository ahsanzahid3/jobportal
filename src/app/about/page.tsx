'use client'

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import Link from "next/link"
import { Briefcase, ArrowLeft } from "lucide-react"
import { useI18n } from "@/i18n/context";


function AboutContent() {
  const { mounted } = useTheme()
  const { t } = useI18n()
  if (!mounted) return null

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
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            {t("nav.back_to_jobs")}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t("page.about.title")}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <p>
            CareerPortal is a next-generation job marketplace connecting talented professionals with
            employers across the globe. We focus on making the job search smarter through AI-powered
            matching, transparent filtering, and a seamless application experience.
          </p>
          <p>
            Founded in 2025, our mission is to remove friction from hiring — whether you are a
            recruiter managing a talent pipeline or a job seeker looking for the perfect role.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Transparency</strong> — No hidden fees, no dark patterns.</li>
            <li><strong>Global Reach</strong> — Serving job markets across Asia, Africa, Europe, the Middle East, and the Americas.</li>
            <li><strong>AI-First</strong> — Smart matching, CV parsing, and skill gap analysis.</li>
            <li><strong>Inclusivity</strong> — Equal opportunity for white-collar professionals and blue-collar workers alike.</li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2a2e3a] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-500">
          &copy; 2025 {t("site.title")}. {t("footer.rights")}
        </div>
      </footer>
    </div>
  )
}

export default function AboutPage() {
  return (
    <ThemeProvider>
      <AboutContent />
    </ThemeProvider>
  )
}

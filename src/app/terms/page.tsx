'use client'

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import Link from "next/link"
import { Briefcase, ArrowLeft } from "lucide-react"
import { useI18n } from "@/i18n/context";


function TermsContent() {
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
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            {t("nav.back_to_jobs")}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t("page.terms.title")}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          <p><strong className="text-gray-900 dark:text-gray-100">{t("page.terms.last_updated")}:</strong> March 2025</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">1. Acceptance of Terms</h2>
          <p>By accessing or using CareerPortal, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">2. Account Registration</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">3. Job Seeker Responsibilities</h2>
          <p>You agree to provide truthful information in your profile and applications. Misrepresentation of qualifications may result in account suspension.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">4. Recruiter Responsibilities</h2>
          <p>Recruiters agree to use the platform for legitimate hiring purposes only. Spam, unsolicited marketing, or discriminatory postings are prohibited.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">5. Prohibited Conduct</h2>
          <p>You may not scrape the platform, create fake accounts, post fraudulent jobs, or engage in any activity that disrupts the service.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">6. Limitation of Liability</h2>
          <p>CareerPortal is provided &quot;as is&quot; without warranties of any kind. We are not liable for interactions between users or for the accuracy of job postings.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">7. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, at our sole discretion.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">8. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2a2e3a] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">&copy; 2025 {t("site.title")}. {t("footer.rights")}</div>
      </footer>
    </div>
  )
}

export default function TermsPage() {
  return (
    <ThemeProvider>
      <TermsContent />
    </ThemeProvider>
  )
}

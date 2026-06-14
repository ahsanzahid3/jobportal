'use client'

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import Link from "next/link"
import { Briefcase, ArrowLeft } from "lucide-react"
import { useI18n } from "@/i18n/context";


function PrivacyContent() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t("page.privacy.title")}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          <p><strong className="text-gray-900 dark:text-gray-100">{t("page.privacy.last_updated")}:</strong> March 2025</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, phone number, resume, work history, education, and skills. We also collect usage data such as pages visited, searches performed, and applications submitted.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">2. How We Use Your Information</h2>
          <p>Your information is used to match you with job opportunities, facilitate applications, improve our AI matching algorithms, and send relevant job alerts. Recruiters see only the information you choose to share in your profile.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">3. Data Sharing</h2>
          <p>We share your profile with recruiters when you apply to jobs or opt into the talent pool. We do not sell your personal data to third parties.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">4. Data Retention</h2>
          <p>We retain your account information until you delete your account. Usage logs are retained for up to 12 months.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">5. Your Rights</h2>
          <p>You can access, update, export, or delete your data at any time from your account settings. Contact us at privacy@careerportal.com for assistance.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. Analytics cookies are optional and can be managed in your preferences.</p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">7. Contact</h2>
          <p>For privacy-related inquiries, email privacy@careerportal.com or write to us at the address listed on our Contact page.</p>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2a2e3a] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">&copy; 2025 {t("site.title")}. {t("footer.rights")}</div>
      </footer>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <ThemeProvider>
      <PrivacyContent />
    </ThemeProvider>
  )
}

'use client'

import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import Link from "next/link"
import { Briefcase, ArrowLeft, Calendar, User } from "lucide-react"
import { useI18n } from "@/i18n/context";


const posts = [
  { id: 1, title: "How to Ace Your Remote Job Interview", author: "Sarah Chen", date: "Mar 15, 2025", category: "Career Advice", excerpt: "Tips and tricks for making a great impression when you can't meet in person." },
  { id: 2, title: "The Future of Blue-Collar Work in Africa", author: "James Okafor", date: "Mar 12, 2025", category: "Industry Insights", excerpt: "How skilled trades are driving economic growth across the continent." },
  { id: 3, title: "ATS-Friendly Resume Tips for 2025", author: "Priya Sharma", date: "Mar 8, 2025", category: "Career Advice", excerpt: "Make sure your resume gets past automated screening systems." },
  { id: 4, title: "Recruiter Spotlight: Building Diverse Talent Pipelines", author: "David Kim", date: "Mar 5, 2025", category: "Recruiting", excerpt: "Best practices for inclusive hiring in a global market." },
  { id: 5, title: "Salary Negotiation: A Guide for Job Seekers", author: "Aisha Mohammed", date: "Mar 1, 2025", category: "Career Advice", excerpt: "Know your worth and get the compensation you deserve." },
]

function BlogContent() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("page.blog.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">{t("page.blog.subtitle")}</p>

        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="p-6 bg-white dark:bg-[#1e2230] border border-gray-200 dark:border-[#2a2e3a] rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full">{post.category}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{post.date}</span>
                <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 hover:text-primary transition-colors cursor-pointer">{post.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2a2e3a] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">&copy; 2025 {t("site.title")}. {t("footer.rights")}</div>
      </footer>
    </div>
  )
}

export default function BlogPage() {
  return (
    <ThemeProvider>
      <BlogContent />
    </ThemeProvider>
  )
}

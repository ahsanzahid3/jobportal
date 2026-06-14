"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import {
  Sun, Moon, Mail, User, MessageSquare, Send,
  MapPin, Phone, Clock, ChevronRight, CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setError("All fields are required.");
      return;
    }
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen hero-3d flex flex-col">
      {/* Background */}
      <div className="hero-mesh-overlay" />
      <div className="hero-grid-overlay" />
      <div className="hero-orb-3d hero-orb-3d-1" />
      <div className="hero-orb-3d hero-orb-3d-2" />
      <div className="hero-orb-3d hero-orb-3d-3" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center">
              <img src="/logo-light.png" alt="DulyHired" className="h-9 w-auto block dark:hidden" />
              <img src="/logo-dark.png" alt="DulyHired" className="h-9 w-auto hidden dark:block" />
            </a>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link href="/sign-in" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Left — Contact Info */}
            <div className="md:col-span-2 space-y-6 md:pt-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
                <p className="text-sm text-white/50 leading-relaxed">
                  Have a question, partnership idea, or need help? We&apos;d love to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <p className="text-sm text-white/80">support@dulyhired.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Response Time</p>
                    <p className="text-sm text-white/80">Usually within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">For Employers</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Interested in posting jobs or accessing our talent pool?{" "}
                  <Link href="/post-job" className="text-primary-light hover:underline">Learn more</Link>
                </p>
              </div>
            </div>

            {/* Right — Form */}
            <div className="md:col-span-3">
              {sent ? (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/50 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSent(false)}
                    className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl shadow-black/50 p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send us a message</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      We&apos;ll respond via email within 24 hours.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name *</label>
                        <div className="relative">
                          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="John Doe" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Email *</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                          placeholder="How can we help?" required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Tell us more about your inquiry..." required rows={5}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 dark:placeholder-gray-500 focus:border-primary text-sm outline-none transition-colors resize-none" />
                    </div>

                    <button type="submit" disabled={sending}
                      className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {sending ? (
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send size={16} />
                      )}
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 text-white/40 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs">
          <p>© 2025 DulyHired. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

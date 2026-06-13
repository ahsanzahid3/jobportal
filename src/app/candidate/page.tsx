"use client";

import {
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  Pencil,
  Settings,
  Award,
  Bell,
  Languages,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { LinkedinIcon } from "@/components/LinkedinIcon";
import Link from "next/link";

export default function CandidateProfile() {
  const profile = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+234 801 234 5678",
    location: "Lagos, Nigeria",
    role: "Senior Frontend Engineer",
    linkedin_: "linkedin.com/in/johndoe",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Node.js", "PostgreSQL"],
    experience: "6 years",
    education: "BSc Computer Science, University of Lagos (2018)",
    languages: ["English (Fluent)", "Yoruba (Native)", "French (Intermediate)"],
    certifications: ["AWS Certified Developer", "Meta Front-End Developer"],
    verified: true,
    premium: false,
    profileCompleteness: 75,
    missing: ["Portfolio URL", "GitHub link"],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your candidate profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-dark-card border-4 border-white dark:border-dark-card flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 shadow-md">
              JD
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                {profile.verified && <CheckCircle size={16} className="text-emerald-500 fill-emerald-500" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.role}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {profile.location}
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-primary dark:text-primary-light border border-primary/30 dark:border-primary/50 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
              <Pencil size={13} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Mail size={13} className="text-gray-400" /> {profile.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Phone size={13} className="text-gray-400" /> {profile.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">LinkedIn</p>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <LinkedinIcon size={13} /> {profile.linkedin_}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Briefcase size={13} className="text-gray-400" /> {profile.experience}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Skills, Education, etc */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s} className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded">{s}</span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
              <GraduationCap size={15} className="text-gray-400" /> Education
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{profile.education}</p>
          </div>

          {/* Certifications */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Award size={15} className="text-gray-400" /> Certifications
            </h3>
            <ul className="space-y-1.5">
              {profile.certifications.map((c) => (
                <li key={c} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CheckCircle size={12} className="text-emerald-500 shrink-0" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Languages size={15} className="text-gray-400" /> Languages
            </h3>
            <ul className="space-y-1.5">
              {profile.languages.map((l) => (
                <li key={l} className="text-sm text-gray-700 dark:text-gray-300">{l}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Completeness + Quick Actions */}
        <div className="space-y-6">
          {/* Profile Completeness */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Completeness</h3>
              <span className="text-2xl font-bold text-emerald-500">{profile.profileCompleteness}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-dark-hover rounded-full overflow-hidden mb-4">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profile.profileCompleteness}%` }}></div>
            </div>
            {profile.missing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Missing items:</p>
                <ul className="space-y-1">
                  {profile.missing.map((m) => (
                    <li key={m} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <XCircle size={11} /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/candidate/verification" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><CheckCircle size={15} className="text-blue-600 dark:text-blue-400" /></div>
                <div><p className="text-xs font-medium text-gray-900 dark:text-white">Verify Account</p><p className="text-[10px] text-gray-500">LinkedIn & Email</p></div>
              </Link>
              <Link href="/candidate/alerts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><Bell size={15} className="text-emerald-600 dark:text-emerald-400" /></div>
                <div><p className="text-xs font-medium text-gray-900 dark:text-white">Job Alerts</p><p className="text-[10px] text-gray-500">Featured opportunities</p></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

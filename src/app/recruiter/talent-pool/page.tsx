"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Eye,
  Lock,
  Unlock,
  Briefcase,
  GraduationCap,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import Link from "next/link";

interface Candidate {
  id: number;
  name: string;
  role: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  email: string;
  phone: string;
  unlocked: boolean;
  watchlisted: boolean;
  matchScore: number;
  availability: string;
}

const candidates: Candidate[] = [
  { id: 1, name: "John Doe", role: "Senior Frontend Engineer", location: "Lagos, Nigeria", skills: ["React", "TypeScript", "Next.js", "Tailwind"], experience: "6 years", education: "BSc Computer Science", email: "john.doe@email.com", phone: "+234 801 234 5678", unlocked: false, watchlisted: true, matchScore: 92, availability: "2 weeks" },
  { id: 2, name: "Jane Smith", role: "Marketing Manager", location: "Nairobi, Kenya", skills: ["Marketing Strategy", "Digital Media", "Analytics", "SEO"], experience: "8 years", education: "MBA Marketing", email: "jane.smith@email.com", phone: "+254 712 345 678", unlocked: false, watchlisted: false, matchScore: 88, availability: "Immediate" },
  { id: 3, name: "Ali Khan", role: "Full Stack Developer", location: "Karachi, Pakistan", skills: ["React", "Node.js", "PostgreSQL", "AWS"], experience: "4 years", education: "BSc Software Engineering", email: "ali.khan@email.com", phone: "+92 321 123 4567", unlocked: true, watchlisted: true, matchScore: 95, availability: "1 month" },
  { id: 4, name: "Maria Garcia", role: "Product Designer", location: "Mexico City, Mexico", skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"], experience: "5 years", education: "BDes Industrial Design", email: "maria.garcia@email.com", phone: "+52 55 1234 5678", unlocked: false, watchlisted: false, matchScore: 79, availability: "2 weeks" },
  { id: 5, name: "Samuel Osei", role: "DevOps Engineer", location: "Accra, Ghana", skills: ["Docker", "Kubernetes", "Terraform", "CI/CD"], experience: "3 years", education: "BSc Computer Engineering", email: "samuel.osei@email.com", phone: "+233 501 234 567", unlocked: false, watchlisted: false, matchScore: 84, availability: "Immediate" },
  { id: 6, name: "Aisha Mohammed", role: "Data Scientist", location: "Dubai, UAE", skills: ["Python", "TensorFlow", "SQL", "ML"], experience: "7 years", education: "MSc Data Science", email: "aisha.m@email.com", phone: "+971 50 123 4567", unlocked: true, watchlisted: true, matchScore: 91, availability: "3 weeks" },
  { id: 7, name: "Carlos Rivera", role: "Backend Engineer", location: "Toronto, Canada", skills: ["Python", "Django", "Redis", "PostgreSQL"], experience: "5 years", education: "BSc Computer Science", email: "carlos.r@email.com", phone: "+1 416 555 0101", unlocked: false, watchlisted: false, matchScore: 76, availability: "1 month" },
  { id: 8, name: "Fatima Diallo", role: "HR Manager", location: "Dakar, Senegal", skills: ["Recruiting", "Payroll", "Compliance", "Employee Relations"], experience: "9 years", education: "MBA HR", email: "fatima.d@email.com", phone: "+221 77 123 4567", unlocked: false, watchlisted: false, matchScore: 82, availability: "2 weeks" },
  { id: 9, name: "David Kim", role: "Product Manager", location: "Nairobi, Kenya", skills: ["Product Strategy", "Agile", "User Research", "Analytics"], experience: "6 years", education: "MBA Product Management", email: "david.kim@email.com", phone: "+254 722 345 678", unlocked: false, watchlisted: true, matchScore: 89, availability: "Immediate" },
  { id: 10, name: "Blessing Okonkwo", role: "Mobile Developer", location: "Lagos, Nigeria", skills: ["React Native", "Flutter", "Firebase", "TypeScript"], experience: "4 years", education: "BSc Computer Science", email: "blessing.o@email.com", phone: "+234 803 456 7890", unlocked: false, watchlisted: false, matchScore: 87, availability: "1 month" },
];

export default function TalentPool() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [candidateList, setCandidateList] = useState(candidates);

  const toggleUnlock = (id: number) => {
    setCandidateList((prev) => prev.map((c) => c.id === id ? { ...c, unlocked: !c.unlocked } : c));
  };

  const toggleWatchlist = (id: number) => {
    setCandidateList((prev) => prev.map((c) => c.id === id ? { ...c, watchlisted: !c.watchlisted } : c));
  };

  const filtered = [...candidateList]
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()) || c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => sortBy === "match" ? b.matchScore - a.matchScore : a.availability.localeCompare(b.availability));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Pool</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{candidateList.length} candidates available</p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search candidates by name, role, or skill..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400">
          <option value="match">Best Match</option>
          <option value="availability">Availability</option>
        </select>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {c.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleWatchlist(c.id)} className={`p-1 rounded ${c.watchlisted ? "text-amber-500" : "text-gray-400 hover:text-amber-500"} transition-colors`}>
                      <Star size={15} className={c.watchlisted ? "fill-amber-500" : ""} />
                    </button>
                  </div>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                    c.matchScore >= 90 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                    c.matchScore >= 80 ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                    "bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400"
                  }`}>{c.matchScore}%</div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-3">
                {c.skills.map((s) => (
                  <span key={s} className="text-[10px] font-medium bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Briefcase size={12} /> {c.experience}</span>
                <span className="flex items-center gap-1"><GraduationCap size={12} /> {c.education}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {c.availability}</span>
              </div>
            </div>

            {/* Contact Section (Blurred or Unlocked) */}
            <div className={`px-5 py-3 border-t border-gray-100 dark:border-dark-border ${c.unlocked ? "bg-blue-50 dark:bg-blue-900/10" : "bg-gray-50 dark:bg-dark-hover"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {c.unlocked ? (
                    <>
                      <span className="text-xs text-blue-600 dark:text-blue-400">{c.email}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">{c.phone}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400 dark:text-gray-500 blur-sm select-none">{c.email}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 blur-sm select-none">{c.phone}</span>
                      <Lock size={11} className="text-gray-400 dark:text-gray-500" />
                    </>
                  )}
                </div>
                <button
                  onClick={() => toggleUnlock(c.id)}
                  className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                    c.unlocked
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {c.unlocked ? "Locked" : "Unlock"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No candidates found</p>
        </div>
      )}
    </div>
  );
}

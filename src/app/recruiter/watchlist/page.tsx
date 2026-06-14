"use client";

import { useState } from "react";
import {
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Mail,
  Phone,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";

const watchlisted = [
  { id: 1, name: "John Doe", role: "Senior Frontend Engineer", location: "Lagos, Nigeria", skills: ["React", "TypeScript", "Next.js"], experience: "6 years", matchScore: 92, added: "2 days ago" },
  { id: 3, name: "Ali Khan", role: "Full Stack Developer", location: "Karachi, Pakistan", skills: ["React", "Node.js", "PostgreSQL"], experience: "4 years", matchScore: 95, added: "1 week ago" },
  { id: 6, name: "Aisha Mohammed", role: "Data Scientist", location: "Dubai, UAE", skills: ["Python", "TensorFlow", "SQL"], experience: "7 years", matchScore: 91, added: "3 days ago" },
  { id: 9, name: "David Kim", role: "Product Manager", location: "Nairobi, Kenya", skills: ["Product Strategy", "Agile", "Analytics"], experience: "6 years", matchScore: 89, added: "5 days ago" },
];

export default function Watchlist() {
  const [list, setList] = useState(watchlisted);

  const remove = (id: number) => {
    setList((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Watchlist</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{list.length} saved candidates</p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
          <Star size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Watchlist is empty</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Star candidates from the talent pool to save them here</p>
          <Link href="/recruiter/talent-pool" className="text-sm font-medium text-primary dark:text-primary-light hover:underline">
            Browse Talent Pool →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((c) => (
            <div key={c.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {c.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">{c.matchScore}%</div>
                  <button onClick={() => remove(c.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {c.skills.map((s) => (
                  <span key={s} className="text-[10px] font-medium bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Briefcase size={12} /> {c.experience}</span>
                <span className="flex items-center gap-1"><Star size={12} /> Saved {c.added}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

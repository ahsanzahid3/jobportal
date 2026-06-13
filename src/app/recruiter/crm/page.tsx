"use client";

import { useState } from "react";
import {
  Send,
  MessageSquare,
  XCircle,
  UserCheck,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";

type Stage = "contacted" | "interviewing" | "rejected" | "hired";

interface CRMCandidate {
  id: number;
  name: string;
  role: string;
  location: string;
  stage: Stage;
  skills: string[];
  contactedDate: string;
  notes: string;
  email: string;
  phone: string;
}

const initialCandidates: CRMCandidate[] = [
  { id: 1, name: "John Doe", role: "Senior Frontend Engineer", location: "Lagos, Nigeria", stage: "contacted", skills: ["React", "TypeScript", "Next.js"], contactedDate: "2 days ago", notes: "Strong portfolio, reached out via email", email: "john@email.com", phone: "+234 801 234 5678" },
  { id: 2, name: "Jane Smith", role: "Marketing Manager", location: "Nairobi, Kenya", stage: "interviewing", skills: ["Marketing Strategy", "Digital Media", "SEO"], contactedDate: "1 week ago", notes: "First interview completed, waiting for second round", email: "jane@email.com", phone: "+254 712 345 678" },
  { id: 3, name: "Ali Khan", role: "Full Stack Developer", location: "Karachi, Pakistan", stage: "interviewing", skills: ["React", "Node.js", "PostgreSQL"], contactedDate: "5 days ago", notes: "Technical assessment sent", email: "ali@email.com", phone: "+92 321 123 4567" },
  { id: 4, name: "Maria Garcia", role: "Product Designer", location: "Mexico City, Mexico", stage: "rejected", skills: ["Figma", "UI/UX", "Design Systems"], contactedDate: "2 weeks ago", notes: "Not enough experience with design systems at scale", email: "maria@email.com", phone: "+52 55 1234 5678" },
  { id: 5, name: "Samuel Osei", role: "DevOps Engineer", location: "Accra, Ghana", stage: "contacted", skills: ["Docker", "Kubernetes", "Terraform"], contactedDate: "3 days ago", notes: "Reached out on LinkedIn", email: "samuel@email.com", phone: "+233 501 234 567" },
  { id: 6, name: "Aisha Mohammed", role: "Data Scientist", location: "Dubai, UAE", stage: "hired", skills: ["Python", "TensorFlow", "SQL"], contactedDate: "1 month ago", notes: "Accepted offer, starts next month", email: "aisha@email.com", phone: "+971 50 123 4567" },
  { id: 7, name: "Carlos Rivera", role: "Backend Engineer", location: "Toronto, Canada", stage: "interviewing", skills: ["Python", "Django", "Redis"], contactedDate: "1 week ago", notes: "Second round scheduled", email: "carlos@email.com", phone: "+1 416 555 0101" },
  { id: 8, name: "David Kim", role: "Product Manager", location: "Nairobi, Kenya", stage: "contacted", skills: ["Product Strategy", "Agile", "Analytics"], contactedDate: "1 day ago", notes: "Sent personalized outreach", email: "david@email.com", phone: "+254 722 345 678" },
];

const stages: { key: Stage; label: string; color: string; icon: React.ReactNode }[] = [
  { key: "contacted", label: "Contacted", color: "border-t-blue-500 bg-blue-50 dark:bg-blue-900/10", icon: <Send size={14} /> },
  { key: "interviewing", label: "Interviewing", color: "border-t-amber-500 bg-amber-50 dark:bg-amber-900/10", icon: <MessageSquare size={14} /> },
  { key: "rejected", label: "Rejected", color: "border-t-red-500 bg-red-50 dark:bg-red-900/10", icon: <XCircle size={14} /> },
  { key: "hired", label: "Hired", color: "border-t-emerald-500 bg-emerald-50 dark:bg-emerald-900/10", icon: <UserCheck size={14} /> },
];

const nextStage: Record<Stage, Stage | null> = {
  contacted: "interviewing",
  interviewing: "hired",
  rejected: null,
  hired: null,
};

export default function CRMPage() {
  const [candidates, setCandidates] = useState(initialCandidates);

  const moveCandidate = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = nextStage[c.stage];
        if (!next) return c;
        return { ...c, stage: next };
      })
    );
  };

  const rejectCandidate = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: "rejected" as Stage } : c))
    );
  };

  const getCandidatesByStage = (stage: Stage) => candidates.filter((c) => c.stage === stage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter CRM</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {candidates.length} candidates in pipeline
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.key);
          return (
            <div key={stage.key} className="bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-200 dark:border-dark-border">
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 border-t-2 ${stage.color.replace("bg", "").split(" ")[0]} bg-white dark:bg-dark-card rounded-t-xl border-b border-gray-200 dark:border-dark-border`}>
                <div className="flex items-center gap-2">
                  <span className={stage.key === "contacted" ? "text-blue-600 dark:text-blue-400" : stage.key === "interviewing" ? "text-amber-600 dark:text-amber-400" : stage.key === "rejected" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>{stage.icon}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stage.label}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-dark-hover text-gray-600 dark:text-gray-400">{stageCandidates.length}</span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {stageCandidates.map((c) => (
                  <div key={c.id} className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          c.stage === "contacted" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                          c.stage === "interviewing" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                          c.stage === "rejected" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                          "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.role}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {c.location}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 italic">
                      "{c.notes}"
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                      <Clock size={10} />
                      {c.contactedDate}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                      {nextStage[c.stage] && (
                        <button onClick={() => moveCandidate(c.id)}
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                          Move <ArrowRight size={11} />
                        </button>
                      )}
                      {c.stage !== "rejected" && c.stage !== "hired" && (
                        <button onClick={() => rejectCandidate(c.id)}
                          className="text-[11px] text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors">
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

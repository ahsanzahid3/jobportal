"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  Users,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Lock,
  Unlock,
} from "lucide-react";

const sampleResults = [
  { id: 1, name: "John Doe", role: "Senior Frontend Engineer", location: "Lagos, Nigeria", skills: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind"], experience: "6 years", matchScore: 94, availability: "2 weeks", email: "john@email.com" },
  { id: 2, name: "Aisha Mohammed", role: "Data Scientist", location: "Dubai, UAE", skills: ["Python", "TensorFlow", "PyTorch", "SQL", "MLOps"], experience: "7 years", matchScore: 91, availability: "Immediate", email: "aisha@email.com" },
  { id: 3, name: "David Kim", role: "Product Manager", location: "Nairobi, Kenya", skills: ["Product Strategy", "Agile", "User Research", "Analytics", "Roadmapping"], experience: "6 years", matchScore: 88, availability: "1 month", email: "david@email.com" },
];

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof sampleResults>([]);
  const [searched, setSearched] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);
    setTimeout(() => {
      setResults(sampleResults);
      setSearching(false);
      setSearched(true);
    }, 1500);
  };

  const toggleUnlock = (id: number) => {
    setUnlockedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Candidate Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Describe your ideal candidate and AI finds the best matches</p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Sparkles size={16} className="absolute left-3 top-3 text-purple-500" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your ideal candidate... e.g. &quot;Senior React developer with 5+ years experience, based in Africa, available immediately, with experience in fintech&quot;"
              rows={3}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-purple-500 outline-none resize-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {searching ? "Searching..." : "AI Search"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <Sparkles size={12} className="text-purple-500" />
          <span>AI matches candidates by skills, experience, location, and semantic relevance</span>
        </div>
      </div>

      {/* Results */}
      {searching && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-purple-500" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">AI is analyzing candidate profiles...</span>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
          <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">No matches found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {results.length > 0 && !searching && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Found <strong className="text-gray-900 dark:text-white">{results.length}</strong> matching candidates
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500">AI-powered • Semantic matching</div>
          </div>

          <div className="space-y-4">
            {results.map((c) => (
              <div key={c.id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400 shrink-0">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">{c.matchScore}% match</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {c.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {c.availability}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {c.skills.map((s) => (
                    <span key={s} className="text-[10px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {c.experience}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {c.availability}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    {unlockedIds.includes(c.id) ? (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-purple-600 dark:text-purple-400">{c.email}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 blur-sm select-none">{c.email}</span>
                    )}
                    <button onClick={() => toggleUnlock(c.id)}
                      className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                        unlockedIds.includes(c.id) ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400"
                      }`}>
                      {unlockedIds.includes(c.id) ? "Unlocked" : "Unlock"}
                    </button>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium text-primary dark:text-primary-light hover:underline">
                    <Send size={12} /> Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

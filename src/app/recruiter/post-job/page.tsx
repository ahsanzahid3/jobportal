"use client";

import { useState } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Globe,
  Users,
  Clock,
  Plus,
  X,
  Check,
  Send,
  Save,
  Eye,
} from "lucide-react";

const collarOptions = ["White Collar", "Blue Collar"];
const workplaceOptions = ["Remote", "Hybrid", "On-site", "Field"];
const seniorityOptions = ["Entry Level", "Mid Level", "Senior Level", "No Prior Experience"];
const commitmentOptions = ["Full Time", "Part Time", "Contract", "Internship", "Temporary"];

export default function PostJob() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [collar, setCollar] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [seniority, setSeniority] = useState("");
  const [commitment, setCommitment] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((k) => k !== s));

  const isBasicComplete = title && company && location && collar && workplace && seniority && commitment;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Job</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new job listing</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 text-xs">
        {["Basic Info", "Details", "Review"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(i + 1)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              step === i + 1 ? "bg-primary text-white" : i + 1 < step ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400"
            }`}>
              {i + 1 < step ? <Check size={12} /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < 2 && <span className="text-gray-300 dark:text-gray-600">—</span>}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Job Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company *</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Industry</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Software & Technology"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Job Category *</label>
                <select value={collar} onChange={(e) => setCollar(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 focus:border-primary outline-none">
                  <option value="">Select</option>
                  {collarOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Workplace *</label>
                <select value={workplace} onChange={(e) => setWorkplace(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 focus:border-primary outline-none">
                  <option value="">Select</option>
                  {workplaceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Seniority *</label>
                <select value={seniority} onChange={(e) => setSeniority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 focus:border-primary outline-none">
                  <option value="">Select</option>
                  {seniorityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Commitment *</label>
                <select value={commitment} onChange={(e) => setCommitment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 focus:border-primary outline-none">
                  <option value="">Select</option>
                  {commitmentOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Salary Min</label>
                <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="e.g. 80000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Salary Max</label>
                <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="e.g. 120000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setStep(2)} disabled={!isBasicComplete}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Job Details</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Required Skills</label>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary outline-none" />
                <button onClick={addSkill} className="px-3 py-2 bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="px-6 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                ← Back
              </button>
              <button onClick={() => setStep(3)} disabled={!description}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Review →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Review & Submit</h2>
            <div className="bg-gray-50 dark:bg-dark-hover rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title || "Job Title"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{company || "Company"} • {location || "Location"}</p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Draft</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {collar && <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">{collar}</span>}
                {workplace && <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">{workplace}</span>}
                {seniority && <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">{seniority}</span>}
                {commitment && <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">{commitment}</span>}
              </div>
              {(salaryMin || salaryMax) && (
                <p className="text-sm text-gray-700 dark:text-gray-300">💰 ${salaryMin || "0"} - ${salaryMax || "0"}</p>
              )}
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{description}</p>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => <span key={s} className="text-[10px] bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{s}</span>)}
                </div>
              )}
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(2)} className="px-6 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                ← Edit
              </button>
              <div className="flex gap-2">
                <button className="px-5 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors flex items-center gap-1">
                  <Save size={14} /> Save Draft
                </button>
                <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1">
                  <Send size={14} /> Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

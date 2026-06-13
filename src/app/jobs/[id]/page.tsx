import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";

// ─── Types ────────────────────────────────────────────────────────
interface JobPageProps {
  params: Promise<{ id: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: job } = await supabase
    .from("jobs")
    .select("title, company, location, description, salary_min, salary_max, country")
    .eq("id", id)
    .single();

  if (!job) {
    return { title: "Job Not Found — CareerPortal" };
  }

  const salaryStr =
    job.salary_min || job.salary_max
      ? `$${job.salary_min?.toLocaleString() ?? ""} - $${job.salary_max?.toLocaleString() ?? ""}`
      : "";

  return {
    title: `${job.title}${job.company ? ` at ${job.company}` : ""} — CareerPortal`,
    description: `${job.title}${job.company ? ` at ${job.company}` : ""} — ${job.location}${salaryStr ? ` — ${salaryStr}` : ""}. ${(job.description || "").slice(0, 200)}`,
    openGraph: {
      title: `${job.title}${job.company ? ` at ${job.company}` : ""}`,
      description: `${job.title} in ${job.location}${salaryStr ? ` — ${salaryStr}` : ""}. Apply on CareerPortal.`,
      type: "article",
    },
  };
}

// ─── Server Component ─────────────────────────────────────────────
export default async function JobDetailPage({ params }: JobPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch the job
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Normalize fields to match the frontend Job interface
  const normalizedJob = {
    id: job.id,
    title: job.title,
    company: job.company || null,
    companyLogo: (job.company?.charAt(0)?.toUpperCase() ?? "C") + (job.company?.charAt(1)?.toUpperCase() ?? ""),
    location: job.location || "Remote",
    country: job.country || "",
    region: job.region || "",
    collar: job.collar || "white",
    workplace: job.workplace || "onsite",
    seniority: job.seniority || "mid",
    commitment: job.type || "fulltime",
    salary: job.salary_min || job.salary_max
      ? `$${(job.salary_min || 0).toLocaleString()} - $${(job.salary_max || 0).toLocaleString()}`
      : "Competitive",
    salaryMin: job.salary_min || 0,
    salaryMax: job.salary_max || 0,
    industry: job.industry || "Other",
    type: job.type || "full-time",
    posted: job.created_at
      ? (() => {
          const diff = Date.now() - new Date(job.created_at).getTime();
          const days = Math.floor(diff / 86400000);
          if (days === 0) return "Today";
          if (days === 1) return "Yesterday";
          return `${days} days ago`;
        })()
      : "Recently",
    urgent: job.is_urgent || false,
    featured: job.is_featured || false,
    skills: job.skills || [],
    staffingAgency: false,
    description: job.description || "No description available.",
    external_url: job.external_url || null,
  };

  return (
    <JobDetailClient job={normalizedJob} />
  );
}

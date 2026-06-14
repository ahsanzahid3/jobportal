"use client";

import { useState } from "react";
import {
  CheckCircle,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { LinkedinIcon } from "@/components/LinkedinIcon";

export default function Verification() {
  const [linkedinStatus, setLinkedinStatus] = useState<"pending" | "verified" | "skipped">("pending");
  const [emailStatus, setEmailStatus] = useState<"pending" | "verified" | "skipped">("verified");
  const [verifying, setVerifying] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const verifyLinkedin = () => {
    setVerifying(true);
    setTimeout(() => {
      setLinkedinStatus("verified");
      setVerifying(false);
    }, 2000);
  };

  const verifyEmail = () => {
    if (emailCode === "123456") {
      setEmailStatus("verified");
      setShowCodeInput(false);
    }
  };

  const overallVerified = linkedinStatus === "verified" && emailStatus === "verified";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verify your identity to increase trust with recruiters</p>
      </div>

      {/* Status Banner */}
      {overallVerified ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={24} className="text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Fully Verified</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Your profile is verified via LinkedIn and email</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={24} className="text-amber-500 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Verification Incomplete</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400">Complete both steps to get the verified badge</p>
          </div>
        </div>
      )}

      {/* LinkedIn Verification */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                linkedinStatus === "verified" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-blue-50 dark:bg-blue-900/20"
              }`}>
                <LinkedinIcon size={20} className={linkedinStatus === "verified" ? "text-emerald-500" : "text-blue-600"} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">LinkedIn Verification</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect your LinkedIn profile to verify your professional identity</p>
              </div>
            </div>
            <div>
              {linkedinStatus === "verified" ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                  <Check size={14} /> Verified
                </span>
              ) : linkedinStatus === "skipped" ? (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-hover px-3 py-1 rounded-lg">Skipped</span>
              ) : (
                <button
                  onClick={verifyLinkedin}
                  disabled={verifying}
                  className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={13} className="animate-spin" /> : <LinkedinIcon size={13} />}
                  {verifying ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                emailStatus === "verified" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-50 dark:bg-dark-hover"
              }`}>
                <Mail size={20} className={emailStatus === "verified" ? "text-emerald-500" : "text-gray-400"} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Email Verification</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verify your email address (john.doe@email.com)</p>
                {emailStatus === "verified" && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Check size={12} /> Email verified
                  </p>
                )}
              </div>
            </div>
            <div>
              {emailStatus === "verified" ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                  <Check size={14} /> Verified
                </span>
              ) : (
                <button
                  onClick={() => setShowCodeInput(true)}
                  className="text-xs font-medium bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          {showCodeInput && emailStatus !== "verified" && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Enter the 6-digit code sent to your email (demo: 123456)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-center text-gray-900 dark:text-gray-100 focus:border-primary outline-none"
                />
                <button onClick={verifyEmail} className="text-xs font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-gray-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Why verify?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Verified candidates appear higher in recruiter searches, get a verified badge on their profile,
              and are more likely to be contacted by employers. Your data is kept private and never shared without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

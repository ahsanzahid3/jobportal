"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight visitor tracker.
 * Fires a `page_view` event on every route change.
 * Also exposes window.__trackJobView and window.__trackJobClick
 * for job detail pages and external link clicks.
 */
export default function Tracker() {
  const pathname = usePathname();

  // Stable visitor ID stored in sessionStorage (persists for session)
  const visitorId = useRef<string>("");

  useEffect(() => {
    // Generate or reuse visitor ID
    let vid = sessionStorage.getItem("cv_visitor");
    if (!vid) {
      vid = crypto.randomUUID();
      sessionStorage.setItem("cv_visitor", vid);
    }
    visitorId.current = vid;

    // Expose tracking functions globally
    const track = (eventType: string, path?: string, jobId?: string) => {
      try {
        const body: Record<string, any> = {
          event_type: eventType,
          visitor_id: vid,
          path: path || window.location.pathname,
        };
        if (jobId) body.job_id = jobId;

        navigator.sendBeacon("/api/track", JSON.stringify(body));
      } catch { /* non-blocking */ }
    };

    (window as any).__trackJobView = (jobId: string) => track("job_view", undefined, jobId);
    (window as any).__trackJobClick = (jobId: string) => track("job_click", undefined, jobId);
  }, []);

  // Track page view on route change
  useEffect(() => {
    if (!visitorId.current) return;
    try {
      navigator.sendBeacon("/api/track", JSON.stringify({
        event_type: "page_view",
        visitor_id: visitorId.current,
        path: pathname,
      }));
    } catch { /* non-blocking */ }
  }, [pathname]);

  return null;
}

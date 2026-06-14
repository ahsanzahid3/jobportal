import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET /api/notifications — list unread notifications count + recent ──
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  // Recent 20
  const { data: recent } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get related user names
  const relatedIds = [...new Set((recent || []).map(n => n.related_user_id).filter(Boolean))];
  const { data: relatedProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", relatedIds);

  const profileMap = new Map((relatedProfiles || []).map(p => [p.id, p]));

  const enriched = (recent || []).map(n => ({
    ...n,
    related_user: n.related_user_id ? profileMap.get(n.related_user_id) || null : null,
  }));

  return NextResponse.json({
    unread_count: unreadCount || 0,
    notifications: enriched,
  });
}

// ─── POST /api/notifications — mark as read ────────────────────────
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, notification_id } = body;

  if (action === "mark_read" && notification_id) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notification_id)
      .eq("user_id", user.id);
  } else if (action === "mark_all_read") {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
  }

  return NextResponse.json({ ok: true });
}

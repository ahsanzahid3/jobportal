import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET /api/messages/[id] — get messages in a conversation ──────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is a participant
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .contains("participant_ids", [user.id])
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  // Get messages
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get sender profiles
  const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
  const { data: senders } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", senderIds);

  const senderMap = new Map((senders || []).map(s => [s.id, s]));

  const enriched = (messages || []).map(m => ({
    ...m,
    sender: senderMap.get(m.sender_id) || { full_name: "Unknown", role: null },
    is_mine: m.sender_id === user.id,
  }));

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("receiver_id", user.id)
    .is("read_at", null);

  return NextResponse.json(enriched);
}

// ─── PATCH /api/messages/[id] — mark conversation as read ─────────
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("receiver_id", user.id)
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET /api/messages — list conversations for current user ──────
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch conversations where user is a participant, with last message
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .contains("participant_ids", [user.id])
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get the other participant's profile for each conversation
  const otherIds = conversations?.map(c =>
    c.participant_ids.find((id: string) => id !== user.id)
  ).filter(Boolean) || [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", otherIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  // Count unread messages per conversation
  const { data: unreadData } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("receiver_id", user.id)
    .is("read_at", null);

  const unreadCounts: Record<string, number> = {};
  (unreadData || []).forEach((m: any) => {
    unreadCounts[m.conversation_id] = (unreadCounts[m.conversation_id] || 0) + 1;
  });

  const enriched = (conversations || []).map(c => {
    const otherId = c.participant_ids.find((id: string) => id !== user.id);
    const otherProfile = profileMap.get(otherId);
    return {
      ...c,
      other_user: otherProfile || { id: otherId, full_name: "Unknown", email: null, role: null },
      unread_count: unreadCounts[c.id] || 0,
    };
  });

  return NextResponse.json(enriched);
}

// ─── POST /api/messages — send a message (creates conversation if needed) ──
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { receiver_id, content, conversation_id } = body;

  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: "receiver_id and content required" }, { status: 400 });
  }

  let convId = conversation_id;

  // If no conversation_id, find existing or create new
  if (!convId) {
    const participantIds = [user.id, receiver_id].sort();

    // Check for existing conversation between these two
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .contains("participant_ids", participantIds);

    // Filter to exact match (contains checks both in array)
    const exactMatch = existing?.find((c: any) => {
      const ids = c.participant_ids as string[];
      return ids.length === 2 && ids.includes(user.id) && ids.includes(receiver_id);
    });

    if (exactMatch) {
      convId = exactMatch.id;
    } else {
      // Create new conversation
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({ participant_ids: participantIds })
        .select()
        .single();

      if (convErr || !newConv) return NextResponse.json({ error: convErr?.message || "Failed to create conversation" }, { status: 500 });
      convId = (newConv as any).id;
    }
  }

  // Insert the message
  const { data: message, error: msgErr } = await supabase
    .from("messages")
    .insert({
      conversation_id: convId,
      sender_id: user.id,
      receiver_id,
      content: content.trim(),
    })
    .select()
    .single();

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Update conversation's last_message
  await supabase
    .from("conversations")
    .update({
      last_message: content.trim().slice(0, 200),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", convId);

  // Create notification for receiver
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const senderName = senderProfile?.full_name || "Someone";
  const roleLabel = senderProfile?.role === "admin" ? "Admin" : "Recruiter";

  await supabase.from("notifications").insert({
    user_id: receiver_id,
    type: "new_message",
    title: `New message from ${roleLabel}`,
    message: `${senderName}: ${content.trim().slice(0, 150)}`,
    related_user_id: user.id,
  });

  return NextResponse.json({ message, conversation_id: convId });
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContactBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactBody = await req.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[contact] RESEND_API_KEY not configured, logging instead");
      console.log({ name, email, subject, message });
      return NextResponse.json({ ok: true, note: "logged (no API key)" });
    }

    const html = `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;font-weight:bold;color:#333;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#333;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#333;">Subject</td><td style="padding:8px;">${escapeHtml(subject)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#333;vertical-align:top;">Message</td><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(message)}</td></tr>
      </table>
      <hr style="margin-top:24px;" />
      <p style="color:#999;font-size:12px;">Sent from DulyHired contact form</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DulyHired Contact <contact@dulyhired.com>",
        to: ["support@dulyhired.com"],
        replyTo: email,
        subject: `[DulyHired Contact] ${subject.slice(0, 200)}`,
        html,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[contact] Resend error (${res.status}): ${errBody}`);
      return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Message sent successfully" });
  } catch (e: any) {
    console.error("[contact]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

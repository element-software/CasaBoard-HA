import { NextRequest } from "next/server";

// Lightweight email via Resend (free tier works on Vercel)
// Requires env var RESEND_API_KEY

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailPattern = /^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Could not get RESEND_API_KEY env var");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const from = "CasaBoard <website@casaboard.dev>";
    const to = ["support@casaboard.dev"];
    const emailSubject = `[CASABOARD] New contact form message from ${name}`;
    const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || "(none)"}\n\nMessage:\n${message}`;

    // Call Resend API directly (no SDK to keep it lightweight)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject: emailSubject, text, reply_to: email }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const msg = errorData?.message || "Failed to send email";
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}



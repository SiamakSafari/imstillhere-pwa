import { createServiceSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This endpoint should be called by a cron job every 15 minutes
// e.g., via Vercel Cron, Railway, or external cron service
// Protected by CRON_SECRET

export async function GET(request: Request) {
  // Verify cron secret — supports query param, Bearer token, or Vercel Cron header
  const { searchParams } = new URL(request.url);
  const secret =
    searchParams.get("secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.headers.get("x-vercel-cron-auth");
  
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceSupabase();
    const now = new Date();

    // Get all active users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No active users", processed: 0 });
    }

    let alertsSent = 0;

    for (const profile of profiles) {
      // Calculate the deadline: checkin_time + grace_period in their timezone
      const [hours, minutes] = profile.checkin_time.split(":").map(Number);
      
      // Get current time in user's timezone
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: profile.timezone }));
      
      // Build today's deadline in user's timezone
      const deadline = new Date(userNow);
      deadline.setHours(hours, minutes, 0, 0);
      deadline.setMinutes(deadline.getMinutes() + profile.grace_period_minutes);

      // If we haven't passed the deadline yet, skip
      if (userNow < deadline) continue;

      // Check if they've already checked in today (in their timezone)
      const todayStart = new Date(userNow);
      todayStart.setHours(0, 0, 0, 0);
      
      const { data: checkins } = await supabase
        .from("checkins")
        .select("id")
        .eq("user_id", profile.id)
        .gte("checked_in_at", todayStart.toISOString())
        .limit(1);

      if (checkins && checkins.length > 0) continue; // They checked in, all good

      // Check if we already sent an alert today
      const { data: existingAlerts } = await supabase
        .from("missed_alerts")
        .select("id")
        .eq("user_id", profile.id)
        .gte("alert_sent_at", todayStart.toISOString())
        .limit(1);

      if (existingAlerts && existingAlerts.length > 0) continue; // Already alerted

      // Get their emergency contacts
      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", profile.id)
        .eq("is_active", true);

      if (!contacts || contacts.length === 0) continue; // No one to notify

      // Send emails to each contact
      const notifiedContacts: Array<{ name: string; email: string }> = [];

      for (const contact of contacts) {
        const emailSent = await sendAlertEmail(
          contact.email,
          contact.name,
          profile.display_name
        );
        if (emailSent) {
          notifiedContacts.push({ name: contact.name, email: contact.email });
        }
      }

      if (notifiedContacts.length > 0) {
        // Record the alert
        await supabase.from("missed_alerts").insert({
          user_id: profile.id,
          contacts_notified: notifiedContacts,
        });
        alertsSent++;
      }
    }

    return NextResponse.json({
      message: "Cron check completed",
      processed: profiles.length,
      alertsSent,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendAlertEmail(
  toEmail: string,
  contactName: string,
  userName: string
): Promise<boolean> {
  const emailHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background-color: #0a0a0a; color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px;">💀</span>
      </div>
      <h1 style="font-size: 24px; color: #ffffff; text-align: center; margin-bottom: 8px; font-weight: 800;">
        ${userName} didn&rsquo;t check in today.
      </h1>
      <p style="color: #a1a1aa; line-height: 1.6; text-align: center; margin-bottom: 24px;">
        Hey ${contactName} &mdash; <strong style="color: #ffffff;">${userName}</strong> uses I&rsquo;m Still Here to prove they&rsquo;re alive every day. They missed their window today. You might want to reach out.
      </p>
      <p style="color: #52525b; font-size: 12px; text-align: center;">
        This is an automated alert from <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4ade80;">I&rsquo;m Still Here</a>.
        ${userName} added you as an emergency contact.
      </p>
    </div>
  `;

  // Use Gmail SMTP if configured
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: `${userName} missed their check-in — are they okay?`,
        html: emailHtml,
      });
      return true;
    } catch (err) {
      console.error(`Failed to email ${toEmail} via SMTP:`, err);
      return false;
    }
  }

  // Use Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "I'm Still Here <alerts@imstillhere.app>",
          to: [toEmail],
          subject: `${userName} missed their check-in — are they okay?`,
          html: emailHtml,
        }),
      });

      return res.ok;
    } catch (err) {
      console.error(`Failed to email ${toEmail}:`, err);
      return false;
    }
  }

  // Fallback: log it
  console.log(`[ALERT] Would email ${toEmail}: ${userName} missed check-in`);
  return true;
}

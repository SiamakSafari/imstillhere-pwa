import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("checkins")
      .select("id")
      .eq("user_id", user.id)
      .gte("checked_in_at", today)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "Already alive today. We know.", alreadyDone: true });
    }

    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      method: "api",
    });

    if (error) throw error;

    return NextResponse.json({ message: "I'm still alive ✅", success: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}

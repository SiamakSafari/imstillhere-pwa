import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: todayCheckin } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .gte("checked_in_at", new Date().toISOString().split("T")[0])
    .order("checked_in_at", { ascending: false })
    .limit(1);

  const { data: lastCheckin } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false })
    .limit(1);

  const { count: contactCount } = await supabase
    .from("emergency_contacts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Calculate streak
  let streak = 0;
  const { data: recentCheckins } = await supabase
    .from("checkins")
    .select("checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false })
    .limit(365);

  if (recentCheckins && recentCheckins.length > 0) {
    const checkedDates = new Set(
      recentCheckins.map((c) =>
        new Date(c.checked_in_at).toISOString().split("T")[0]
      )
    );
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (checkedDates.has(todayStr)) {
      streak = 1;
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      while (checkedDates.has(d.toISOString().split("T")[0])) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      if (checkedDates.has(yStr)) {
        streak = 1;
        const d = new Date(yesterday);
        d.setDate(d.getDate() - 1);
        while (checkedDates.has(d.toISOString().split("T")[0])) {
          streak++;
          d.setDate(d.getDate() - 1);
        }
      }
    }
  }

  return (
    <DashboardClient
      profile={profile}
      hasCheckedInToday={!!(todayCheckin && todayCheckin.length > 0)}
      lastCheckinAt={lastCheckin?.[0]?.checked_in_at ?? null}
      streak={streak}
      contactCount={contactCount ?? 0}
    />
  );
}

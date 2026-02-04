import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false })
    .limit(365);

  return <HistoryClient checkins={checkins ?? []} />;
}

import { createServerFn } from "@tanstack/react-start";

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: uc } = await supabaseAdmin
    .from("user_challenges")
    .select("user_id, progress_days, completed");
  if (!uc) return { rows: [] as Array<{ user_id: string; name: string; total_progress: number; completed: number; badges: number }> };

  const agg = new Map<string, { total_progress: number; completed: number }>();
  for (const row of uc) {
    const cur = agg.get(row.user_id) ?? { total_progress: 0, completed: 0 };
    cur.total_progress += Number(row.progress_days ?? 0);
    cur.completed += row.completed ? 1 : 0;
    agg.set(row.user_id, cur);
  }
  const ids = Array.from(agg.keys());
  if (ids.length === 0) return { rows: [] };

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);
  const { data: badges } = await supabaseAdmin
    .from("user_badges")
    .select("user_id")
    .in("user_id", ids);

  const badgeCount = new Map<string, number>();
  for (const b of badges ?? []) badgeCount.set(b.user_id, (badgeCount.get(b.user_id) ?? 0) + 1);

  const rows = ids.map((id) => {
    const a = agg.get(id)!;
    const p = profiles?.find((x) => x.id === id);
    const name = (p?.full_name || "Pengguna").split(" ").slice(0, 2).join(" ");
    return { user_id: id, name, total_progress: a.total_progress, completed: a.completed, badges: badgeCount.get(id) ?? 0 };
  });
  rows.sort((a, b) => (b.completed - a.completed) || (b.total_progress - a.total_progress));
  return { rows: rows.slice(0, 20) };
});

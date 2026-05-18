import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Polls reminders every minute and shows a browser notification + toast
 * when reminder_time matches the current HH:MM (per recurrence rule).
 */
export function useReminderNotifications(userId: string | undefined) {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    // Request permission once
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const check = async () => {
      const { data: rems } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true);
      if (!rems) return;

      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5); // "HH:MM"
      const todayKey = now.toISOString().slice(0, 10);
      const dow = now.getDay(); // 0=Sun

      for (const r of rems) {
        if (!r.reminder_time) continue;
        const t = String(r.reminder_time).slice(0, 5);
        if (t !== hhmm) continue;

        // Recurrence gating
        if (r.recurring === "weekly") {
          const startDow = r.created_at ? new Date(r.created_at).getDay() : dow;
          if (startDow !== dow) continue;
        } else if (r.recurring === "monthly") {
          const startDate = r.created_at ? new Date(r.created_at).getDate() : now.getDate();
          if (startDate !== now.getDate()) continue;
        } else if (r.recurring === "none") {
          if (r.reminder_date && r.reminder_date !== todayKey) continue;
        }

        const key = `${r.id}-${todayKey}-${t}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);

        const title = `🔔 ${r.title}`;
        const body = r.notes || `Pengingat ${r.type}`;
        toast.success(title, { description: body });
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(title, { body }); } catch {/* ignore */}
        }
      }
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [userId]);
}

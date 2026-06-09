import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Polls reminders + medications + checkups every minute.
 * Fires a browser notification + toast when scheduled time matches HH:MM.
 */
export function useReminderNotifications(userId: string | undefined) {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const notify = (title: string, body: string) => {
      toast.success(title, { description: body });
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification(title, { body }); } catch {/* ignore */}
      }
    };

    const check = async () => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5);
      const todayKey = now.toISOString().slice(0, 10);
      const dow = now.getDay();

      // ----- Reminders -----
      const { data: rems } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true);
      for (const r of rems ?? []) {
        if (!r.reminder_time) continue;
        const t = String(r.reminder_time).slice(0, 5);
        if (t !== hhmm) continue;
        if (r.recurring === "weekly") {
          const startDow = r.created_at ? new Date(r.created_at).getDay() : dow;
          if (startDow !== dow) continue;
        } else if (r.recurring === "monthly") {
          const startDate = r.created_at ? new Date(r.created_at).getDate() : now.getDate();
          if (startDate !== now.getDate()) continue;
        } else if (r.recurring === "none") {
          if (r.reminder_date && r.reminder_date !== todayKey) continue;
        }
        const key = `rem-${r.id}-${todayKey}-${t}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);
        notify(`🔔 ${r.title}`, r.notes || `Pengingat ${r.type}`);
      }

      // ----- Medications -----
      const { data: meds } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true);
      for (const m of meds ?? []) {
        const times: string[] = m.schedule_times ?? [];
        for (const raw of times) {
          const t = String(raw).slice(0, 5);
          if (t !== hhmm) continue;
          const key = `med-${m.id}-${todayKey}-${t}`;
          if (firedRef.current.has(key)) continue;
          firedRef.current.add(key);
          notify(`💊 Saatnya minum ${m.name}`, m.dosage ? `Dosis: ${m.dosage}` : "Jangan lupa minum obatmu.");
        }
      }

      // ----- Checkups (notif H-0, jam 08:00) -----
      if (hhmm === "08:00") {
        const { data: chks } = await supabase
          .from("checkups")
          .select("*")
          .eq("user_id", userId)
          .eq("checkup_date", todayKey);
        for (const c of chks ?? []) {
          const key = `chk-${c.id}-${todayKey}`;
          if (firedRef.current.has(key)) continue;
          firedRef.current.add(key);
          notify("🩺 Jadwal Check-up hari ini", `${c.doctor || "Dokter"} · ${c.hospital || "—"}`);
        }
      }
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [userId]);
}

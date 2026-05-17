import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { MonitoringDialog } from "@/components/MonitoringDialog";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsMonitoring, setNeedsMonitoring] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/login" }); return; }
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle();
      if (!profile?.onboarded) {
        setNeedsOnboarding(true);
        nav({ to: "/onboarding" });
        setChecking(false);
        return;
      }
      // Check last monitoring log
      const { data: lastLog } = await supabase
        .from("monitoring_logs")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const fiveHoursMs = 5 * 60 * 60 * 1000;
      const last = lastLog?.created_at ? new Date(lastLog.created_at).getTime() : 0;
      if (Date.now() - last > fiveHoursMs) setNeedsMonitoring(true);
      setChecking(false);
    })();
  }, [user, loading, nav]);

  if (loading || checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || needsOnboarding) return null;

  return (
    <>
      <Outlet />
      <MonitoringDialog open={needsMonitoring} onClose={() => setNeedsMonitoring(false)} />
    </>
  );
}

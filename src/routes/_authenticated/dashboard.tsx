import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Heart, LogOut, Activity, Pill, Bell, Moon, Dumbbell, Stethoscope,
  Brain, Sparkles, Trophy, Users, MapPin, Plus, Loader2, Send, User as UserIcon,
  Calendar, TrendingUp, Pencil, Trash2, BellRing,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { aiChat } from "@/lib/ai.functions";
import { getLeaderboard } from "@/lib/challenges.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HOSPITALS, haversineKm } from "@/lib/hospitals-data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SehatKu" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");

  const logout = async () => { await supabase.auth.signOut(); nav({ to: "/" }); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground flex-col p-4 sticky top-0 h-screen">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <div className="h-9 w-9 rounded-xl gradient-teal grid place-items-center"><Heart className="h-5 w-5 text-white" fill="white" /></div>
          <span className="font-display text-xl font-bold">SehatKu</span>
        </Link>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {[
            ["overview", "Overview", Activity],
            ["history", "Riwayat", Calendar],
            ["meds", "Obat", Pill],
            ["reminders", "Pengingat", Bell],
            ["checkups", "Check-up", Stethoscope],
            ["ai", "AI Konsultasi", Brain],
            ["progress", "Progress", TrendingUp],
            ["challenges", "Challenge", Trophy],
            ["forum", "Forum", Users],
            ["map", "Peta RS", MapPin],
            ["profile", "Profil", UserIcon],
          ].map(([k, label, Icon]: any) => (
            <button key={k} onClick={() => setTab(k)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === k ? "bg-sidebar-accent text-sidebar-primary-foreground" : "hover:bg-sidebar-accent/50"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
        <Button onClick={logout} variant="ghost" className="justify-start text-sidebar-foreground hover:bg-sidebar-accent/50">
          <LogOut className="h-4 w-4 mr-2" /> Keluar
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile tabs */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-teal grid place-items-center"><Heart className="h-4 w-4 text-white" fill="white" /></div>
              <span className="font-display font-bold">SehatKu</span>
            </Link>
            <Button size="sm" variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="lg:hidden flex flex-wrap h-auto mb-6">
              {[["overview","Overview"],["meds","Obat"],["reminders","Pengingat"],["ai","AI"],["progress","Progress"],["challenges","Challenge"],["forum","Forum"],["map","RS"],["profile","Profil"]].map(([k,l]) => (
                <TabsTrigger key={k} value={k}>{l}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="history"><HistoryTab /></TabsContent>
            <TabsContent value="meds"><MedsTab /></TabsContent>
            <TabsContent value="reminders"><RemindersTab /></TabsContent>
            <TabsContent value="checkups"><CheckupsTab /></TabsContent>
            <TabsContent value="ai"><AITab /></TabsContent>
            <TabsContent value="progress"><ProgressTab /></TabsContent>
            <TabsContent value="challenges"><ChallengesTab /></TabsContent>
            <TabsContent value="forum"><ForumTab /></TabsContent>
            <TabsContent value="map"><MapTab /></TabsContent>
            <TabsContent value="profile"><ProfileTab /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {desc && <p className="text-muted-foreground text-sm mt-1">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

// ============== OVERVIEW ==============
function OverviewTab() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const { data: logs } = useQuery({
    queryKey: ["recent-logs", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("monitoring_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(7);
      return data ?? [];
    },
    enabled: !!user,
  });

  const mood = logs?.[0]?.mood ?? "neutral";
  const moodEmoji: Record<string, string> = { "sangat-baik": "😄", baik: "🙂", biasa: "😐", kurang: "😕", buruk: "😣", neutral: "🙂" };
  const bmi = profile?.height_cm && profile?.weight_kg
    ? (Number(profile.weight_kg) / Math.pow(Number(profile.height_cm) / 100, 2)).toFixed(1)
    : "—";

  return (
    <>
      <SectionHeader title={`Halo, ${profile?.full_name?.split(" ")[0] ?? "kamu"} 👋`} desc="Ini ringkasan kesehatanmu hari ini." />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 gradient-hero text-white border-0 shadow-elegant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Avatar Kesehatan</p>
              <p className="text-3xl font-bold mt-1 capitalize">{mood.replace("-", " ")}</p>
            </div>
            <div className="text-6xl">{moodEmoji[mood]}</div>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">BMI</p>
          <p className="text-3xl font-bold mt-1">{bmi}</p>
          <p className="text-xs text-muted-foreground mt-2">{profile?.height_cm}cm · {profile?.weight_kg}kg</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">Check-in 7 hari</p>
          <p className="text-3xl font-bold mt-1">{logs?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-2">monitoring tercatat</p>
        </Card>
      </div>

      {profile?.ai_initial_analysis && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 text-teal" /><h3 className="font-semibold">Analisis AI Awal</h3></div>
          <div className="text-sm whitespace-pre-wrap text-muted-foreground">{profile.ai_initial_analysis}</div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-teal" />Aktivitas Terakhir</h3>
        {logs?.length ? (
          <div className="space-y-3">
            {logs.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{moodEmoji[l.mood] ?? "🙂"} Mood: {l.mood}</p>
                  <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("id-ID")}</p>
                </div>
                <div className="text-xs text-muted-foreground">{l.water_glasses}💧 · {l.sleep_hours}h tidur</div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Belum ada check-in. Tunggu prompt monitoring berikutnya.</p>}
      </Card>
    </>
  );
}

// ============== HISTORY ==============
function HistoryTab() {
  const { user } = useAuth();
  const { data: logs } = useQuery({
    queryKey: ["all-logs", user?.id],
    queryFn: async () => (await supabase.from("monitoring_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  return (
    <>
      <SectionHeader title="Riwayat Kesehatan" desc="Semua check-in monitoring kamu." />
      <div className="space-y-3">
        {logs?.length ? logs.map((l: any) => (
          <Card key={l.id} className="p-4">
            <div className="flex justify-between mb-2">
              <p className="font-medium capitalize">Mood: {l.mood}</p>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("id-ID")}</span>
            </div>
            <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
              <span>💧 {l.water_glasses} gelas</span>
              <span>😴 {l.sleep_hours}h tidur</span>
              <span>🏃 {l.exercised ? "Olahraga" : "Tidak"}</span>
              <span>🍽️ {[l.ate_breakfast && "P", l.ate_lunch && "S", l.ate_dinner && "M"].filter(Boolean).join("·") || "-"}</span>
            </div>
            {l.symptoms && <p className="text-sm mt-2"><b>Gejala:</b> {l.symptoms}</p>}
            {l.ai_feedback && <p className="text-sm mt-2 italic text-muted-foreground whitespace-pre-wrap">💬 {l.ai_feedback}</p>}
          </Card>
        )) : <p className="text-muted-foreground">Belum ada riwayat.</p>}
      </div>
    </>
  );
}

// ============== MEDICATIONS ==============
function MedsTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", dosage: "", times_per_day: 1, schedule_times: "08:00", notes: "" });
  const { data: meds } = useQuery({
    queryKey: ["meds", user?.id],
    queryFn: async () => (await supabase.from("medications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const add = async () => {
    await supabase.from("medications").insert({
      user_id: user!.id, name: f.name, dosage: f.dosage, times_per_day: f.times_per_day,
      schedule_times: f.schedule_times.split(",").map((s) => s.trim()), notes: f.notes,
    });
    toast.success("Obat ditambahkan");
    qc.invalidateQueries({ queryKey: ["meds"] });
    setOpen(false);
    setF({ name: "", dosage: "", times_per_day: 1, schedule_times: "08:00", notes: "" });
  };
  return (
    <>
      <SectionHeader title="Jadwal Obat" desc="Pengingat minum obat harian." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gradient-hero text-white"><Plus className="h-4 w-4 mr-1" /> Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Obat</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Nama obat</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Dosis</Label><Input value={f.dosage} onChange={(e) => setF({ ...f, dosage: e.target.value })} placeholder="500mg, 1 tablet..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Frekuensi/hari</Label><Input type="number" min={1} value={f.times_per_day} onChange={(e) => setF({ ...f, times_per_day: +e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Jam (pisah koma)</Label><Input value={f.schedule_times} onChange={(e) => setF({ ...f, schedule_times: e.target.value })} placeholder="08:00,14:00,20:00" /></div>
              </div>
              <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              <Button onClick={add} className="w-full gradient-hero text-white">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <div className="grid md:grid-cols-2 gap-4">
        {meds?.length ? meds.map((m: any) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Pill className="h-4 w-4 text-teal" />{m.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.dosage}</p>
              </div>
              <Badge variant="secondary">{m.times_per_day}x/hari</Badge>
            </div>
            <div className="mt-3 flex gap-1.5 flex-wrap">{(m.schedule_times ?? []).map((t: string) => <Badge key={t} className="bg-teal/10 text-teal hover:bg-teal/20 border-0">{t}</Badge>)}</div>
            {m.notes && <p className="text-xs text-muted-foreground mt-3">{m.notes}</p>}
          </Card>
        )) : <p className="text-muted-foreground">Belum ada obat. Klik "Tambah".</p>}
      </div>
    </>
  );
}

// ============== REMINDERS ==============
type ReminderForm = { type: string; title: string; reminder_time: string; recurring: string; notes: string };
const EMPTY_REM: ReminderForm = { type: "sleep", title: "", reminder_time: "22:00", recurring: "daily", notes: "" };

function RemindersTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState<ReminderForm>(EMPTY_REM);
  const { data: rems } = useQuery({
    queryKey: ["rems", user?.id],
    queryFn: async () => (await supabase.from("reminders").select("*").eq("user_id", user!.id).order("reminder_time", { ascending: true })).data ?? [],
    enabled: !!user,
  });

  const openNew = () => { setEditId(null); setF(EMPTY_REM); setOpen(true); };
  const openEdit = (r: any) => {
    setEditId(r.id);
    setF({ type: r.type, title: r.title, reminder_time: String(r.reminder_time ?? "08:00").slice(0,5), recurring: r.recurring ?? "daily", notes: r.notes ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!f.title.trim()) { toast.error("Judul wajib diisi"); return; }
    if (editId) {
      await supabase.from("reminders").update(f).eq("id", editId);
      toast.success("Pengingat diperbarui");
    } else {
      await supabase.from("reminders").insert({ ...f, user_id: user!.id });
      toast.success("Pengingat ditambahkan");
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
    qc.invalidateQueries({ queryKey: ["rems"] }); setOpen(false);
  };

  const del = async (id: string) => {
    if (!confirm("Hapus pengingat ini?")) return;
    await supabase.from("reminders").delete().eq("id", id);
    toast.success("Pengingat dihapus");
    qc.invalidateQueries({ queryKey: ["rems"] });
  };

  const toggle = async (r: any) => {
    await supabase.from("reminders").update({ active: !r.active }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["rems"] });
  };

  const testNotif = async () => {
    if (!("Notification" in window)) { toast.error("Browser tidak mendukung notifikasi"); return; }
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") { toast.error("Izin notifikasi ditolak"); return; }
    new Notification("🔔 Notifikasi aktif!", { body: "Pengingatmu akan muncul tepat waktu." });
    toast.success("Notifikasi berhasil dikirim");
  };

  const icons: Record<string, any> = { sleep: Moon, exercise: Dumbbell, checkup: Stethoscope, custom: Bell };
  return (
    <>
      <SectionHeader title="Pengingat" desc="Tidur, olahraga, check-up — semua di sini." action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={testNotif}><BellRing className="h-4 w-4 mr-1" />Aktifkan Notif</Button>
          <Button onClick={openNew} className="gradient-hero text-white"><Plus className="h-4 w-4 mr-1" />Tambah</Button>
        </div>
      } />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Pengingat" : "Pengingat Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Jenis</Label>
              <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sleep">😴 Tidur</SelectItem>
                  <SelectItem value="exercise">🏃 Olahraga</SelectItem>
                  <SelectItem value="checkup">🩺 Check-up</SelectItem>
                  <SelectItem value="custom">🔔 Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Judul</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Misal: Tidur malam" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Waktu</Label><Input type="time" value={f.reminder_time} onChange={(e) => setF({ ...f, reminder_time: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Berulang</Label>
                <Select value={f.recurring} onValueChange={(v) => setF({ ...f, recurring: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="daily">Harian</SelectItem><SelectItem value="weekly">Mingguan</SelectItem><SelectItem value="monthly">Bulanan</SelectItem><SelectItem value="none">Sekali</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} /></div>
            <Button onClick={save} className="w-full gradient-hero text-white">{editId ? "Update" : "Simpan"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-4">
        {rems?.length ? rems.map((r: any) => {
          const Icon = icons[r.type] ?? Bell;
          return (
            <Card key={r.id} className={`p-5 flex items-center gap-4 ${!r.active ? "opacity-50" : ""}`}>
              <div className="h-12 w-12 rounded-xl gradient-teal grid place-items-center text-white shrink-0"><Icon className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{String(r.reminder_time ?? "").slice(0,5)} · {r.recurring}</p>
                {r.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{r.notes}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => toggle(r)} title={r.active ? "Nonaktifkan" : "Aktifkan"}>
                  <Bell className={`h-4 w-4 ${r.active ? "text-teal" : "text-muted-foreground"}`} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          );
        }) : <p className="text-muted-foreground">Belum ada pengingat. Klik "Tambah" untuk membuat.</p>}
      </div>
    </>
  );
}

// ============== CHECKUPS ==============
function CheckupsTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ checkup_date: new Date().toISOString().slice(0, 10), doctor: "", hospital: "", diagnosis: "", notes: "" });
  const { data: chk } = useQuery({
    queryKey: ["chk", user?.id],
    queryFn: async () => (await supabase.from("checkups").select("*").eq("user_id", user!.id).order("checkup_date", { ascending: false })).data ?? [],
    enabled: !!user,
  });
  const add = async () => { await supabase.from("checkups").insert({ ...f, user_id: user!.id }); toast.success("Tersimpan"); qc.invalidateQueries({ queryKey: ["chk"] }); setOpen(false); };
  return (
    <>
      <SectionHeader title="Riwayat Check-up" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gradient-hero text-white"><Plus className="h-4 w-4 mr-1" /> Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Catat Check-up</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={f.checkup_date} onChange={(e) => setF({ ...f, checkup_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Dokter</Label><Input value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Rumah Sakit / Klinik</Label><Input value={f.hospital} onChange={(e) => setF({ ...f, hospital: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Diagnosis</Label><Input value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Catatan</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              <Button onClick={add} className="w-full gradient-hero text-white">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <div className="space-y-3">
        {chk?.length ? chk.map((c: any) => (
          <Card key={c.id} className="p-5">
            <div className="flex justify-between">
              <h3 className="font-semibold">{c.diagnosis || "Check-up rutin"}</h3>
              <span className="text-sm text-muted-foreground">{c.checkup_date}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{c.doctor} · {c.hospital}</p>
            {c.notes && <p className="text-sm mt-2">{c.notes}</p>}
          </Card>
        )) : <p className="text-muted-foreground">Belum ada catatan check-up.</p>}
      </div>
    </>
  );
}

// ============== AI ==============
function AITab() {
  const [type, setType] = useState<"consult" | "symptom" | "lifestyle">("consult");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<string | null>(null);
  const chat = useServerFn(aiChat);
  const send = async () => {
    if (!msg.trim()) return;
    setBusy(true); setResp(null);
    try {
      const r = await chat({ data: { type, message: msg } });
      setResp(r.response);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  };
  const labels = { consult: "Konsultasi Umum", symptom: "Analisis Gejala", lifestyle: "Rekomendasi Pola Hidup" };
  const placeholders = {
    consult: "Tanya seputar kesehatan: 'apakah aman olahraga setelah makan?'",
    symptom: "Jelaskan gejala: 'sakit kepala 3 hari, demam ringan, pusing saat bangun...'",
    lifestyle: "Ceritakan situasi: 'umur 28, kerja kantoran 10 jam, sulit tidur, ingin lebih bugar...'",
  };
  return (
    <>
      <SectionHeader title="AI Kesehatan" desc="Konsultasi, analisis gejala, dan rekomendasi pola hidup." />
      <Tabs value={type} onValueChange={(v) => { setType(v as any); setResp(null); }}>
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="consult"><Brain className="h-4 w-4 mr-1.5" />Konsultasi</TabsTrigger>
          <TabsTrigger value="symptom"><Stethoscope className="h-4 w-4 mr-1.5" />Gejala</TabsTrigger>
          <TabsTrigger value="lifestyle"><Sparkles className="h-4 w-4 mr-1.5" />Pola Hidup</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="p-5 mt-4">
        <Label className="mb-2 block">{labels[type]}</Label>
        <Textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={placeholders[type]} />
        <Button onClick={send} disabled={busy} className="mt-3 gradient-hero text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Kirim ke AI
        </Button>
      </Card>
      {resp && (
        <Card className="p-6 mt-4 border-teal/30">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 text-teal" /><h3 className="font-semibold">Respon AI</h3></div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{resp}</div>
        </Card>
      )}
    </>
  );
}

// ============== PROGRESS ==============
function ProgressTab() {
  const { user } = useAuth();
  const { data: logs } = useQuery({
    queryKey: ["progress-logs", user?.id],
    queryFn: async () => (await supabase.from("monitoring_logs").select("*").eq("user_id", user!.id).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())).data ?? [],
    enabled: !!user,
  });
  const total = logs?.length ?? 0;
  const avgSleep = total ? (logs!.reduce((s: number, l: any) => s + (Number(l.sleep_hours) || 0), 0) / total).toFixed(1) : "—";
  const exerciseDays = logs?.filter((l: any) => l.exercised).length ?? 0;
  const avgWater = total ? Math.round(logs!.reduce((s: number, l: any) => s + (l.water_glasses || 0), 0) / total) : 0;
  return (
    <>
      <SectionHeader title="Progress Mingguan" desc="Ringkasan kesehatan 7 hari terakhir." />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Check-in", value: total, icon: Activity },
          { label: "Rata-rata tidur", value: `${avgSleep}h`, icon: Moon },
          { label: "Hari olahraga", value: exerciseDays, icon: Dumbbell },
          { label: "Rata-rata air", value: `${avgWater}💧`, icon: Heart },
        ].map((s, i) => (
          <Card key={i} className="p-6">
            <div className="h-10 w-10 rounded-lg gradient-teal grid place-items-center text-white mb-3"><s.icon className="h-5 w-5" /></div>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

// ============== CHALLENGES ==============
function ChallengesTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const getLb = useServerFn(getLeaderboard);

  const { data: challenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => (await supabase.from("challenges").select("*").order("created_at")).data ?? [],
  });
  const { data: mine } = useQuery({
    queryKey: ["my-challenges", user?.id],
    queryFn: async () => (await supabase.from("user_challenges").select("*").eq("user_id", user!.id)).data ?? [],
    enabled: !!user,
  });
  const { data: badges } = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: async () => (await supabase.from("user_badges").select("*").eq("user_id", user!.id)).data ?? [],
    enabled: !!user,
  });
  const { data: lb } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => (await getLb()).rows,
  });

  const myMap = new Map((mine ?? []).map((m: any) => [m.challenge_id, m]));

  const join = async (c: any) => {
    await supabase.from("user_challenges").insert({ user_id: user!.id, challenge_id: c.id });
    toast.success(`Bergabung ke ${c.title}`);
    qc.invalidateQueries({ queryKey: ["my-challenges"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  const checkIn = async (c: any) => {
    const uc: any = myMap.get(c.id);
    if (!uc) return;
    const today = new Date().toISOString().slice(0, 10);
    if (uc.last_checkin === today) { toast.info("Sudah check-in hari ini"); return; }
    const newProgress = Math.min((uc.progress_days ?? 0) + 1, c.duration_days);
    const completed = newProgress >= c.duration_days;
    await supabase.from("user_challenges").update({ progress_days: newProgress, completed }).eq("id", uc.id);
    if (completed) {
      await supabase.from("user_badges").insert({
        user_id: user!.id,
        badge_code: `challenge-${c.id}`,
        label: `🏆 ${c.title}`,
      }).then(() => {/* ignore duplicate */});
      toast.success(`🎉 Challenge "${c.title}" selesai! Badge diberikan.`);
    } else {
      toast.success(`Check-in berhasil! Hari ${newProgress}/${c.duration_days}`);
    }
    qc.invalidateQueries({ queryKey: ["my-challenges"] });
    qc.invalidateQueries({ queryKey: ["my-badges"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  const leave = async (c: any) => {
    const uc: any = myMap.get(c.id);
    if (!uc) return;
    if (!confirm(`Keluar dari "${c.title}"?`)) return;
    await supabase.from("user_challenges").delete().eq("id", uc.id);
    toast.success("Keluar dari challenge");
    qc.invalidateQueries({ queryKey: ["my-challenges"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  return (
    <>
      <SectionHeader title="Challenge Kesehatan" desc="Ikuti tantangan, check-in harian, dan raih badge." />

      {badges && badges.length > 0 && (
        <Card className="p-4 mb-6 bg-gradient-to-br from-amber-50 to-teal/5 border-amber-200">
          <p className="text-xs text-muted-foreground mb-2">🏅 Badge kamu</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b: any) => <Badge key={b.id} className="bg-amber-100 text-amber-900 border-amber-300">{b.label}</Badge>)}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {challenges?.map((c: any) => {
          const uc: any = myMap.get(c.id);
          const progress = uc ? Math.round(((uc.progress_days ?? 0) / c.duration_days) * 100) : 0;
          const status = !uc ? "Belum mulai" : uc.completed ? "Selesai 🏆" : "Berjalan";
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-center gap-2"><span className="text-2xl">{c.icon}</span><h3 className="font-semibold">{c.title}</h3></div>
              <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <Badge variant="secondary">🎯 {c.duration_days} hari</Badge>
                <Badge variant="outline">{c.category}</Badge>
                <Badge className={uc?.completed ? "bg-teal text-white" : "bg-muted text-foreground"}>{status}</Badge>
              </div>
              {uc && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress hari {uc.progress_days ?? 0}/{c.duration_days}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {!uc && <Button onClick={() => join(c)} className="flex-1 gradient-hero text-white">Ikut Challenge</Button>}
                {uc && !uc.completed && <Button onClick={() => checkIn(c)} className="flex-1 gradient-hero text-white">Check-in hari ini</Button>}
                {uc && <Button variant="outline" onClick={() => setOpenId(openId === c.id ? null : c.id)}>Detail</Button>}
                {uc && !uc.completed && <Button size="icon" variant="ghost" onClick={() => leave(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
              {openId === c.id && uc && (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
                  <p>📅 Mulai: {new Date(uc.started_at).toLocaleDateString("id-ID")}</p>
                  <p>🎯 Target: {c.duration_days} hari berturut</p>
                  <p>📊 Sisa: {Math.max(c.duration_days - (uc.progress_days ?? 0), 0)} hari</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4"><Trophy className="h-5 w-5 text-amber-500" /><h3 className="font-semibold">Leaderboard</h3></div>
        {lb && lb.length > 0 ? (
          <div className="space-y-2">
            {lb.map((row: any, i: number) => (
              <div key={row.user_id} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${row.user_id === user?.id ? "bg-teal/10" : "bg-muted/50"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-7 w-7 grid place-items-center rounded-full font-bold text-sm ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300" : i === 2 ? "bg-amber-700 text-white" : "bg-background border"}`}>{i + 1}</span>
                  <span className="font-medium truncate">{row.name}{row.user_id === user?.id && " (kamu)"}</span>
                </div>
                <div className="flex gap-1.5 text-xs">
                  <Badge variant="secondary">🏆 {row.completed}</Badge>
                  <Badge variant="outline">{row.total_progress}d</Badge>
                  {row.badges > 0 && <Badge className="bg-amber-100 text-amber-900 border-0">🏅 {row.badges}</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Belum ada peserta. Ikut challenge pertama untuk muncul di sini!</p>}
      </Card>
    </>
  );
}

// ============== FORUM ==============
function ForumTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [f, setF] = useState({ title: "", content: "", category: "umum" });
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await supabase.from("forum_posts").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });
  const post = async () => {
    if (!f.title.trim() || !f.content.trim()) return;
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();
    await supabase.from("forum_posts").insert({ ...f, user_id: user!.id, author_name: profile?.full_name ?? "Anonim" });
    toast.success("Posting terkirim");
    setF({ title: "", content: "", category: "umum" });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };
  return (
    <>
      <SectionHeader title="Forum Kesehatan" desc="Berbagi pengalaman dengan komunitas." />
      <Card className="p-5 mb-6">
        <h3 className="font-semibold mb-3">Buat Posting</h3>
        <div className="space-y-3">
          <Input placeholder="Judul" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Textarea placeholder="Bagikan pengalaman atau pertanyaan..." rows={3} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
          <Button onClick={post} className="gradient-hero text-white">Kirim</Button>
        </div>
      </Card>
      <div className="space-y-3">
        {posts?.length ? posts.map((p: any) => (
          <Card key={p.id} className="p-5">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">{p.title}</h3>
              <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("id-ID")}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">oleh {p.author_name}</p>
            <p className="text-sm whitespace-pre-wrap">{p.content}</p>
          </Card>
        )) : <p className="text-muted-foreground">Belum ada posting. Jadilah yang pertama!</p>}
      </div>
    </>
  );
}

// ============== MAP ==============
function MapTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [bookingFor, setBookingFor] = useState<any>(null);
  const [bf, setBf] = useState({ booking_date: new Date().toISOString().slice(0, 10), booking_time: "09:00", complaint: "" });

  

  const requestLocation = () => {
    if (!("geolocation" in navigator)) { toast.error("Browser tidak mendukung geolokasi"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); toast.success("Lokasi terdeteksi"); },
      () => toast.error("Tidak bisa mengakses lokasi. Izinkan akses lokasi di browser."),
    );
  };

  const filtered = HOSPITALS
    .filter((h) => !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()))
    .map((h) => ({ ...h, distance: userLoc ? haversineKm(userLoc, h) : null }))
    .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

  const { data: bookings } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => (await supabase.from("hospital_bookings").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });

  const submitBooking = async () => {
    if (!bookingFor || !bf.booking_date) return;
    await supabase.from("hospital_bookings").insert({
      user_id: user!.id,
      hospital_name: bookingFor.name,
      hospital_address: bookingFor.address,
      hospital_phone: bookingFor.phone,
      booking_date: bf.booking_date,
      booking_time: bf.booking_time,
      complaint: bf.complaint,
    });
    toast.success(`Permintaan booking ke ${bookingFor.name} terkirim`);
    qc.invalidateQueries({ queryKey: ["bookings"] });
    setBookingFor(null);
    setBf({ booking_date: new Date().toISOString().slice(0, 10), booking_time: "09:00", complaint: "" });
  };

  const mapCenter = userLoc ?? { lat: -2.5, lng: 118 };
  const mapMarkers = filtered.slice(0, 6).map((h) => `${h.lat},${h.lng}`).join("|");
  const mapSrc = userLoc
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 1},${mapCenter.lat - 1},${mapCenter.lng + 1},${mapCenter.lat + 1}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=95,-11,141,6&layer=mapnik`;

  return (
    <>
      <SectionHeader title="Peta & Booking Rumah Sakit" desc="Cari, lihat detail, dan ajukan booking online." action={
        <Button onClick={requestLocation} variant="outline"><MapPin className="h-4 w-4 mr-1" />{userLoc ? "Lokasi aktif" : "Gunakan lokasiku"}</Button>
      } />

      <Card className="overflow-hidden mb-4">
        <iframe title="Peta rumah sakit" src={mapSrc} className="w-full h-[300px] border-0" />
      </Card>

      <Input placeholder="🔍 Cari nama RS atau kota..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((h) => (
          <Card key={h.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-teal shrink-0" />{h.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{h.address}</p>
                <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
                  <Badge variant="secondary">{h.city}</Badge>
                  <Badge variant="outline">🕐 {h.hours}</Badge>
                  <Badge variant="outline">📞 {h.phone}</Badge>
                  {h.distance != null && <Badge className="bg-teal/15 text-teal border-0">{h.distance.toFixed(1)} km</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " " + h.city)}`} target="_blank" rel="noopener noreferrer">Lihat di Maps</a>
              </Button>
              <Button size="sm" onClick={() => setBookingFor(h)} className="flex-1 gradient-hero text-white">Booking</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">Tidak ada RS sesuai pencarian.</p>}
      </div>

      <Dialog open={!!bookingFor} onOpenChange={(o) => !o && setBookingFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking ke {bookingFor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">{bookingFor?.address}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={bf.booking_date} onChange={(e) => setBf({ ...bf, booking_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Jam</Label><Input type="time" value={bf.booking_time} onChange={(e) => setBf({ ...bf, booking_time: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Keluhan / tujuan</Label><Textarea rows={3} value={bf.complaint} onChange={(e) => setBf({ ...bf, complaint: e.target.value })} placeholder="Misal: kontrol rutin, demam 3 hari..." /></div>
            <Button onClick={submitBooking} className="w-full gradient-hero text-white">Kirim Booking</Button>
          </div>
        </DialogContent>
      </Dialog>

      {bookings && bookings.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Booking Saya</h3>
          <div className="space-y-2">
            {bookings.map((b: any) => (
              <Card key={b.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{b.hospital_name}</p>
                  <p className="text-xs text-muted-foreground">{b.booking_date} {b.booking_time} · {b.complaint || "—"}</p>
                </div>
                <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ============== PROFILE ==============
function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile-full", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const [f, setF] = useState<any>(null);
  useEffect(() => { if (profile && !f) setF(profile); }, [profile, f]);
  if (!f) return <Loader2 className="h-6 w-6 animate-spin" />;
  const save = async () => {
    await supabase.from("profiles").update({
      full_name: f.full_name, age: f.age, height_cm: f.height_cm, weight_kg: f.weight_kg,
      blood_type: f.blood_type, chronic_conditions: f.chronic_conditions,
      current_medications: f.current_medications, allergies: f.allergies, emergency_contact: f.emergency_contact,
    }).eq("id", user!.id);
    toast.success("Profil diperbarui");
    qc.invalidateQueries({ queryKey: ["profile-full"] });
  };
  return (
    <>
      <SectionHeader title="Profil" desc="Data pribadi dan riwayat kesehatan." />
      <Card className="p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Nama</Label><Input value={f.full_name ?? ""} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={f.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label>Umur</Label><Input type="number" value={f.age ?? ""} onChange={(e) => setF({ ...f, age: +e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Golongan darah</Label><Input value={f.blood_type ?? ""} onChange={(e) => setF({ ...f, blood_type: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Tinggi (cm)</Label><Input type="number" value={f.height_cm ?? ""} onChange={(e) => setF({ ...f, height_cm: +e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Berat (kg)</Label><Input type="number" value={f.weight_kg ?? ""} onChange={(e) => setF({ ...f, weight_kg: +e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Penyakit kronis</Label><Textarea value={f.chronic_conditions ?? ""} onChange={(e) => setF({ ...f, chronic_conditions: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Obat saat ini</Label><Input value={f.current_medications ?? ""} onChange={(e) => setF({ ...f, current_medications: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Alergi</Label><Input value={f.allergies ?? ""} onChange={(e) => setF({ ...f, allergies: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Kontak darurat</Label><Input value={f.emergency_contact ?? ""} onChange={(e) => setF({ ...f, emergency_contact: e.target.value })} /></div>
        <Button onClick={save} className="gradient-hero text-white">Simpan</Button>
      </Card>
    </>
  );
}

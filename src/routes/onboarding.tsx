import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { analyzeInitialHealth } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Kuesioner Awal — SehatKu" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeInitialHealth);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [f, setF] = useState({
    full_name: "", age: 25, gender: "laki-laki",
    height_cm: 170, weight_kg: 65, blood_type: "O",
    chronic_conditions: "", current_medications: "", allergies: "",
    smoking: "tidak", alcohol: "tidak", exercise_freq: "kadang", sleep_avg: 7,
    current_illness: "", visited_doctor: "tidak", main_concern: "",
  });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("profiles").update({
        full_name: f.full_name, age: f.age, gender: f.gender,
        height_cm: f.height_cm, weight_kg: f.weight_kg, blood_type: f.blood_type,
        chronic_conditions: f.chronic_conditions, current_medications: f.current_medications,
        allergies: f.allergies,
      }).eq("id", user.id);
      await supabase.from("initial_questionnaire").insert({ user_id: user.id, responses: f });
      const { data: ai } = await analyze({ data: { profile: f, responses: f } });
      setResult(ai.analysis);
      toast.success("Profil tersimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl gradient-teal grid place-items-center"><Heart className="h-5 w-5 text-white" fill="white" /></div>
          <span className="font-display text-2xl font-bold">SehatKu</span>
        </div>

        {result ? (
          <div className="rounded-2xl bg-card border shadow-elegant p-8 space-y-5">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-teal" /><h1 className="text-2xl font-bold">Analisis Awal AI</h1></div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
            <Button className="w-full gradient-hero text-white h-11" onClick={() => nav({ to: "/dashboard" })}>Lanjut ke Dashboard</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl bg-card border shadow-elegant p-8 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Kuesioner Kesehatan Awal</h1>
              <p className="text-sm text-muted-foreground mt-1">Data ini akan dianalisis AI untuk memberikan rekomendasi personal.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama Lengkap"><Input required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
              <Field label="Umur"><Input type="number" required value={f.age} onChange={(e) => setF({ ...f, age: +e.target.value })} /></Field>
              <Field label="Jenis Kelamin">
                <Select value={f.gender} onValueChange={(v) => setF({ ...f, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Golongan Darah">
                <Select value={f.blood_type} onValueChange={(v) => setF({ ...f, blood_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["A","B","AB","O"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Tinggi (cm)"><Input type="number" value={f.height_cm} onChange={(e) => setF({ ...f, height_cm: +e.target.value })} /></Field>
              <Field label="Berat (kg)"><Input type="number" value={f.weight_kg} onChange={(e) => setF({ ...f, weight_kg: +e.target.value })} /></Field>
            </div>

            <Field label="Riwayat penyakit kronis"><Textarea rows={2} value={f.chronic_conditions} onChange={(e) => setF({ ...f, chronic_conditions: e.target.value })} placeholder="Diabetes, hipertensi, dll. Isi 'tidak ada' jika tidak ada." /></Field>
            <Field label="Obat yang sedang dikonsumsi"><Input value={f.current_medications} onChange={(e) => setF({ ...f, current_medications: e.target.value })} /></Field>
            <Field label="Alergi"><Input value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} /></Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Merokok?">
                <Select value={f.smoking} onValueChange={(v) => setF({ ...f, smoking: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tidak">Tidak</SelectItem><SelectItem value="kadang">Kadang</SelectItem><SelectItem value="rutin">Rutin</SelectItem></SelectContent></Select>
              </Field>
              <Field label="Konsumsi alkohol?">
                <Select value={f.alcohol} onValueChange={(v) => setF({ ...f, alcohol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tidak">Tidak</SelectItem><SelectItem value="kadang">Kadang</SelectItem><SelectItem value="rutin">Rutin</SelectItem></SelectContent></Select>
              </Field>
              <Field label="Frekuensi olahraga">
                <Select value={f.exercise_freq} onValueChange={(v) => setF({ ...f, exercise_freq: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tidak">Tidak pernah</SelectItem><SelectItem value="kadang">Kadang</SelectItem><SelectItem value="rutin">Rutin (3+/minggu)</SelectItem></SelectContent></Select>
              </Field>
              <Field label="Rata-rata jam tidur"><Input type="number" step={0.5} value={f.sleep_avg} onChange={(e) => setF({ ...f, sleep_avg: +e.target.value })} /></Field>
            </div>

            <Field label="Apakah saat ini sedang sakit? Jika ya, apa keluhannya?"><Textarea rows={2} value={f.current_illness} onChange={(e) => setF({ ...f, current_illness: e.target.value })} /></Field>
            <Field label="Sudah ke dokter?">
              <Select value={f.visited_doctor} onValueChange={(v) => setF({ ...f, visited_doctor: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sudah">Sudah</SelectItem><SelectItem value="belum">Belum</SelectItem><SelectItem value="tidak">Tidak sakit</SelectItem></SelectContent></Select>
            </Field>
            <Field label="Apa fokus kesehatan utamamu sekarang?"><Textarea rows={2} value={f.main_concern} onChange={(e) => setF({ ...f, main_concern: e.target.value })} placeholder="Misal: turun berat badan, tidur lebih baik, mengelola stres..." /></Field>

            <Button type="submit" disabled={busy} className="w-full gradient-hero text-white h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analisis dengan AI"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

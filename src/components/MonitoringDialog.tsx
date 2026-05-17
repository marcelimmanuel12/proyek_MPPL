import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { analyzeMonitoring } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export function MonitoringDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const analyze = useServerFn(analyzeMonitoring);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    mood: "baik",
    ate_breakfast: false, ate_lunch: false, ate_dinner: false,
    exercised: false,
    water_glasses: 0,
    sleep_hours: 7,
    symptoms: "",
    notes: "",
  });

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data: ai } = await analyze({ data: { log: form } });
      setFeedback(ai.feedback);
      await supabase.from("monitoring_logs").insert({ ...form, user_id: user.id, ai_feedback: ai.feedback });
      toast.success("Check-in tersimpan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-teal" /> Check-in Kesehatan</DialogTitle>
          <DialogDescription>Bagaimana kondisimu sekarang? Yuk update progres harianmu.</DialogDescription>
        </DialogHeader>

        {feedback ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/50 p-4 whitespace-pre-wrap text-sm">{feedback}</div>
            <Button className="w-full gradient-hero text-white" onClick={onClose}>Tutup</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bagaimana keadaanmu?</Label>
              <Select value={form.mood} onValueChange={(v) => setForm({ ...form, mood: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sangat-baik">😄 Sangat Baik</SelectItem>
                  <SelectItem value="baik">🙂 Baik</SelectItem>
                  <SelectItem value="biasa">😐 Biasa</SelectItem>
                  <SelectItem value="kurang">😕 Kurang</SelectItem>
                  <SelectItem value="buruk">😣 Buruk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Makan hari ini</Label>
              <div className="flex gap-4 flex-wrap">
                {(["ate_breakfast", "ate_lunch", "ate_dinner"] as const).map((k, i) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form[k]} onCheckedChange={(c) => setForm({ ...form, [k]: !!c })} />
                    {["Pagi", "Siang", "Malam"][i]}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.exercised} onCheckedChange={(c) => setForm({ ...form, exercised: !!c })} />
              Sudah olahraga hari ini
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Gelas air</Label>
                <Input type="number" min={0} value={form.water_glasses} onChange={(e) => setForm({ ...form, water_glasses: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Jam tidur</Label>
                <Input type="number" min={0} step={0.5} value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gejala / keluhan</Label>
              <Input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Misal: pusing, batuk..." />
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <Button onClick={submit} disabled={busy} className="w-full gradient-hero text-white h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim & Analisis AI"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

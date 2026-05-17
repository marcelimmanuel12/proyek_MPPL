import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY tidak terkonfigurasi");
  const res = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (res.status === 429) throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
  if (res.status === 402) throw new Error("Kuota AI habis. Tambahkan kredit di Workspace.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI error: ${res.status} ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "Tidak ada respon.";
}

const DISCLAIMER = "\n\n_⚠️ Ini bukan diagnosis medis. Konsultasikan dengan dokter untuk keluhan serius._";

/** Initial health analysis after onboarding questionnaire */
export const analyzeInitialHealth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ profile: z.record(z.unknown()), responses: z.record(z.unknown()) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sys = "Kamu adalah asisten kesehatan AI berbahasa Indonesia. Berikan analisis singkat (max 200 kata) dan rekomendasi awal berdasarkan data user. Gunakan format markdown dengan bagian: **Ringkasan**, **Hal yang Perlu Diperhatikan**, **Rekomendasi Awal**.";
    const user = `Profil: ${JSON.stringify(data.profile)}\nKuesioner Awal: ${JSON.stringify(data.responses)}`;
    const out = await callLovableAI(sys, user) + DISCLAIMER;
    await context.supabase.from("profiles").update({ ai_initial_analysis: out, onboarded: true }).eq("id", context.userId);
    return { analysis: out };
  });

/** Monitoring feedback for periodic check-ins */
export const analyzeMonitoring = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ log: z.record(z.unknown()) }).parse(input),
  )
  .handler(async ({ data }) => {
    const sys = "Kamu asisten kesehatan AI. Berikan feedback singkat (max 100 kata) dan saran konkret untuk user berdasarkan check-in monitoring harian mereka. Bahasa Indonesia, hangat dan suportif.";
    const out = await callLovableAI(sys, JSON.stringify(data.log));
    return { feedback: out };
  });

/** Generic AI consultation, symptom analysis, lifestyle recommendation */
export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      type: z.enum(["consult", "symptom", "lifestyle"]),
      message: z.string().min(1).max(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const prompts: Record<string, string> = {
      consult: "Kamu adalah konsultan kesehatan AI berbahasa Indonesia. Jawab pertanyaan user dengan ramah, ringkas, dan berbasis bukti. Jangan memberikan diagnosis pasti.",
      symptom: "Kamu adalah AI analisis gejala. User menyebutkan gejala. Berikan: kemungkinan penyebab umum, tingkat urgensi (rendah/sedang/tinggi), tindakan yang disarankan, dan kapan harus ke dokter. Bahasa Indonesia, gunakan markdown.",
      lifestyle: "Kamu adalah AI rekomendasi pola hidup sehat. Berikan rekomendasi konkret (nutrisi, olahraga, tidur, mental) berdasarkan situasi user. Bahasa Indonesia, gunakan bullet markdown.",
    };
    const out = await callLovableAI(prompts[data.type], data.message) + DISCLAIMER;
    await context.supabase.from("ai_consultations").insert({
      user_id: context.userId,
      type: data.type,
      user_input: data.message,
      ai_response: out,
    });
    return { response: out };
  });

// AI helper — memanggil Google Gemini API langsung (server-side only)

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY tidak terkonfigurasi");

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  });

  if (res.status === 429) throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI error: ${res.status} ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Tidak ada respon dari AI."
  );
}

export const DISCLAIMER =
  "\n\n_⚠️ Ini bukan diagnosis medis. Konsultasikan dengan dokter untuk keluhan serius._";

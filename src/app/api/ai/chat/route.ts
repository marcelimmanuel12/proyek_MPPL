import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { callGemini, DISCLAIMER } from "@/lib/ai";

const schema = z.object({
  type: z.enum(["consult", "symptom", "lifestyle"]),
  message: z.string().min(1).max(2000),
});

const OFF_TOPIC_GUARD =
  "\n\nPENTING: Kamu HANYA menjawab topik kesehatan, medis, nutrisi, olahraga, tidur, kesehatan mental, dan pola hidup sehat. Jika pertanyaan di LUAR topik kesehatan, balas persis: 'Maaf, saya hanya bisa membantu pertanyaan seputar kesehatan.' dan berhenti di situ.";

const PROMPTS: Record<string, string> = {
  consult:
    "Kamu adalah konsultan kesehatan AI berbahasa Indonesia. Jawab pertanyaan user dengan ramah, ringkas, dan berbasis bukti. Jangan memberikan diagnosis pasti." +
    OFF_TOPIC_GUARD,
  symptom:
    "Kamu adalah AI analisis gejala. Berikan: kemungkinan penyebab umum, tingkat urgensi (rendah/sedang/tinggi), tindakan yang disarankan, dan kapan harus ke dokter. Bahasa Indonesia, gunakan markdown." +
    OFF_TOPIC_GUARD,
  lifestyle:
    "Kamu adalah AI rekomendasi pola hidup sehat. Berikan rekomendasi konkret (nutrisi, olahraga, tidur, mental). Bahasa Indonesia, gunakan bullet markdown." +
    OFF_TOPIC_GUARD,
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, message } = schema.parse(body);

    const response = (await callGemini(PROMPTS[type], message)) + DISCLAIMER;

    // TODO: Save to DB via Prisma
    // await prisma.aiConsultation.create({
    //   data: { userId: session.userId, type, userInput: message, aiResponse: response },
    // });

    return NextResponse.json({ response });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[ai/chat]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses AI" },
      { status: 500 }
    );
  }
}

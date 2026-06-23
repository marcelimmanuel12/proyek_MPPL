import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { callGemini, DISCLAIMER } from "@/lib/ai";

const schema = z.object({
  profile: z.record(z.unknown()),
  responses: z.record(z.unknown()),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { profile, responses } = schema.parse(body);

    const sys =
      "Kamu adalah asisten kesehatan AI berbahasa Indonesia. Berikan analisis singkat (max 200 kata) dan rekomendasi awal berdasarkan data user. Gunakan format markdown dengan bagian: **Ringkasan**, **Hal yang Perlu Diperhatikan**, **Rekomendasi Awal**.";
    const userMsg = `Profil: ${JSON.stringify(profile)}\nKuesioner Awal: ${JSON.stringify(responses)}`;

    const analysis = (await callGemini(sys, userMsg)) + DISCLAIMER;

    // TODO: Save analysis to DB via Prisma
    // await prisma.profile.update({
    //   where: { userId: session.userId },
    //   data: { aiInitialAnalysis: analysis, onboarded: true },
    // });

    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[ai/analyze-initial]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses AI" },
      { status: 500 }
    );
  }
}

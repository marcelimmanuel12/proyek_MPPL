import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { callGemini } from "@/lib/ai";

const schema = z.object({ log: z.record(z.unknown()) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { log } = schema.parse(body);

    const sys =
      "Kamu asisten kesehatan AI. Berikan feedback singkat (max 100 kata) dan saran konkret untuk user berdasarkan check-in monitoring harian mereka. Bahasa Indonesia, hangat dan suportif.";

    const feedback = await callGemini(sys, JSON.stringify(log));
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("[ai/analyze-monitoring]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses AI" },
      { status: 500 }
    );
  }
}

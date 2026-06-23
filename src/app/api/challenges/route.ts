import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // TODO:
  // const challenges = await prisma.challenge.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json([]);
}

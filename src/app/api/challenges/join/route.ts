import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challenge_id } = await req.json();

  // TODO:
  // await prisma.userChallenge.create({
  //   data: { userId: session.userId, challengeId: challenge_id },
  // });
  console.log("[challenges/join]", session.userId, challenge_id);

  return NextResponse.json({ ok: true }, { status: 201 });
}

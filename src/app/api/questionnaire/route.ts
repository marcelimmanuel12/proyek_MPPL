import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const questionnaire = await prisma.initialQuestionnaire.upsert({
    where: { userId: session.userId },
    update: { responses: body.responses },
    create: { userId: session.userId, responses: body.responses },
  });

  // Mark profile as onboarded
  await prisma.profile.upsert({
    where: { userId: session.userId },
    update: { onboarded: true },
    create: { userId: session.userId, onboarded: true },
  });

  return NextResponse.json(questionnaire, { status: 201 });
}

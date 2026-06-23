import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });

  return NextResponse.json(profile ?? { userId: session.userId, onboarded: false });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const profile = await prisma.profile.upsert({
    where: { userId: session.userId },
    update: {
      fullName: body.full_name,
      age: body.age,
      gender: body.gender,
      heightCm: body.height_cm,
      weightKg: body.weight_kg,
      bloodType: body.blood_type,
      chronicConditions: body.chronic_conditions,
      currentMedications: body.current_medications,
      allergies: body.allergies,
      emergencyContact: body.emergency_contact,
    },
    create: {
      userId: session.userId,
      fullName: body.full_name,
      age: body.age,
      gender: body.gender,
      heightCm: body.height_cm,
      weightKg: body.weight_kg,
      bloodType: body.blood_type,
      chronicConditions: body.chronic_conditions,
      currentMedications: body.current_medications,
      allergies: body.allergies,
      emergencyContact: body.emergency_contact,
    },
  });

  return NextResponse.json(profile);
}

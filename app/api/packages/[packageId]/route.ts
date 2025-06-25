// app/api/packages/[packageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ✅ In Next.js 15, params è asincrono
type RouteContext = {
  params: Promise<{
    packageId: string;
  }>;
};

// ✅ DELETE con params asincrono
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // ⚠️ IMPORTANTE: await params in Next.js 15
    const { packageId } = await context.params;
    const parsedId = parseInt(packageId);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID pacchetto non valido" }, { status: 400 });
    }

    const existingPackage = await prisma.lessonPackage.findUnique({
      where: { id: parsedId },
      include: {
        purchases: { select: { id: true } }
      }
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Pacchetto non trovato" }, { status: 404 });
    }

    if (existingPackage.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Non hai i permessi" }, { status: 403 });
    }

    if (existingPackage.purchases.length > 0) {
      return NextResponse.json(
        { error: "Non puoi eliminare un pacchetto acquistato. Puoi solo disattivarlo." },
        { status: 400 }
      );
    }

    await prisma.lessonPackage.delete({ where: { id: parsedId } });

    return NextResponse.json({ message: "Pacchetto eliminato" }, { status: 200 });
  } catch (error) {
    console.error("Errore DELETE:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

// ✅ PATCH con params asincrono
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // ⚠️ IMPORTANTE: await params in Next.js 15
    const { packageId } = await context.params;
    const parsedId = parseInt(packageId);
    const body = await request.json();

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "ID pacchetto non valido" }, { status: 400 });
    }

    const existingPackage = await prisma.lessonPackage.findUnique({
      where: { id: parsedId }
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Pacchetto non trovato" }, { status: 404 });
    }

    if (existingPackage.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Non hai i permessi" }, { status: 403 });
    }

    const updatedPackage = await prisma.lessonPackage.update({
      where: { id: parsedId },
      data: {
        isActive: body.isActive ?? existingPackage.isActive
      }
    });

    return NextResponse.json(updatedPackage, { status: 200 });
  } catch (error) {
    console.error("Errore PATCH:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}


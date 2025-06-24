// app/api/packages/[packageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Il tuo config di Auth.js v5
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const packageId = parseInt(params.packageId);
    
    if (isNaN(packageId)) {
      return NextResponse.json(
        { error: "ID pacchetto non valido" },
        { status: 400 }
      );
    }

    // Verifica che il pacchetto appartenga all'utente corrente
    const existingPackage = await prisma.lessonPackage.findUnique({
      where: { id: packageId },
      include: {
        purchases: {
          select: { 
            id: true,
            // Potresti aggiungere altri campi se hai bisogno di più dettagli
            // status: true, // se hai un campo status negli acquisti
          }
        }
      }
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: "Pacchetto non trovato" },
        { status: 404 }
      );
    }

    if (existingPackage.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Non hai i permessi per eliminare questo pacchetto" },
        { status: 403 }
      );
    }

    // Controlla se ci sono acquisti attivi
    if (existingPackage.purchases.length > 0) {
      return NextResponse.json(
        { error: "Non puoi eliminare un pacchetto che è stato acquistato. Puoi solo disattivarlo." },
        { status: 400 }
      );
    }

    // Elimina il pacchetto
    await prisma.lessonPackage.delete({
      where: { id: packageId }
    });

    return NextResponse.json(
      { message: "Pacchetto eliminato con successo" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Errore nell'eliminazione del pacchetto:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// API per disattivare invece di eliminare (opzionale)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const packageId = parseInt(params.packageId);
    const body = await request.json();
    
    if (isNaN(packageId)) {
      return NextResponse.json(
        { error: "ID pacchetto non valido" },
        { status: 400 }
      );
    }

    // Verifica che il pacchetto appartenga all'utente corrente
    const existingPackage = await prisma.lessonPackage.findUnique({
      where: { id: packageId }
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: "Pacchetto non trovato" },
        { status: 404 }
      );
    }

    if (existingPackage.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Non hai i permessi per modificare questo pacchetto" },
        { status: 403 }
      );
    }

    // Aggiorna il pacchetto
    const updatedPackage = await prisma.lessonPackage.update({
      where: { id: packageId },
      data: {
        isActive: body.isActive ?? existingPackage.isActive,
        // Aggiungi altri campi che vuoi permettere di modificare
      }
    });

    return NextResponse.json(updatedPackage, { status: 200 });

  } catch (error) {
    console.error("Errore nell'aggiornamento del pacchetto:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
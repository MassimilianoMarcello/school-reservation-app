// lib/package-utils.ts
import { Decimal } from "@prisma/client/runtime/library";

// Tipi basati sul tuo schema Prisma
export interface LessonPackageWithPurchases {
  id: number;
  teacherId: string;
  name: string;
  description: string | null;
  lessonCount: number;
  duration: number;
  price: Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  purchases: Array<{ id: string }>;
}

export interface TeacherWithPackages {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  TeacherPackages: LessonPackageWithPurchases[];
}

// Helper per convertire Decimal a number in modo sicuro
export function decimalToNumber(decimal: Decimal): number {
  return parseFloat(decimal.toString());
}

// Helper per formattare il prezzo
export function formatPrice(price: number | Decimal): string {
  const numPrice = typeof price === 'number' ? price : decimalToNumber(price);
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(numPrice);
}

// Helper per calcolare il prezzo per lezione
export function getPricePerLesson(price: number | Decimal, lessonCount: number): string {
  const numPrice = typeof price === 'number' ? price : decimalToNumber(price);
  const pricePerLesson = numPrice / lessonCount;
  return formatPrice(pricePerLesson);
}

// Helper per formattare la durata
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes}min`;
}

// Helper per calcolare la durata totale del pacchetto
export function getTotalDuration(duration: number, lessonCount: number): string {
  const totalMinutes = duration * lessonCount;
  return formatDuration(totalMinutes);
}

// Validazioni per i pacchetti
export function validatePackageData(data: {
  name: string;
  lessonCount: number;
  duration: number;
  price: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Il nome del pacchetto è obbligatorio");
  }

  if (data.lessonCount <= 0) {
    errors.push("Il numero di lezioni deve essere maggiore di 0");
  }

  if (data.duration < 15) {
    errors.push("La durata minima per lezione è di 15 minuti");
  }

  if (data.price <= 0) {
    errors.push("Il prezzo deve essere maggiore di 0");
  }

  // Durate standard suggerite
  const standardDurations = [15, 30, 45, 60, 75, 90, 120];
  if (!standardDurations.includes(data.duration)) {
    // Non è un errore, ma un warning
    console.warn(`Durata non standard: ${data.duration} minuti. Durate consigliate: ${standardDurations.join(', ')} minuti`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Query helper per ottenere i pacchetti con statistiche
export const getPackagesWithStats = {
  include: {
    purchases: {
      select: {
        id: true,
        createdAt: true,
        // Aggiungi altri campi se necessari per le statistiche
      }
    },
    teacher: {
      select: {
        id: true,
        name: true,
        image: true,
      }
    }
  }
};

// Tipi per le statistiche
export interface PackageStats {
  totalRevenue: number;
  averageRating?: number;
  completionRate?: number;
  popularityScore: number; // Basato su acquisti e data di creazione
}

// Calcola statistiche per un pacchetto
export function calculatePackageStats(
  pkg: LessonPackageWithPurchases,
  allPackages: LessonPackageWithPurchases[]
): PackageStats {
  const totalRevenue = decimalToNumber(pkg.price) * pkg.purchases.length;
  
  // Calcola un punteggio di popolarità basato su:
  // - Numero di acquisti
  // - Quanto è recente il pacchetto
  // - Performance rispetto ad altri pacchetti
  const daysSinceCreation = Math.max(1, Math.floor(
    (Date.now() - pkg.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  const purchasesPerDay = pkg.purchases.length / daysSinceCreation;
  const maxPurchasesPerDay = Math.max(...allPackages.map(p => 
    p.purchases.length / Math.max(1, Math.floor(
      (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    ))
  ));
  
  const popularityScore = maxPurchasesPerDay > 0 
    ? (purchasesPerDay / maxPurchasesPerDay) * 100 
    : 0;

  return {
    totalRevenue,
    popularityScore: Math.round(popularityScore)
  };
}
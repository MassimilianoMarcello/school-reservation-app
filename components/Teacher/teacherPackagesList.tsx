// teacher-packages-client.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 

  BookOpen, 
  Clock, 
  Euro, 
  Mail, 
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice, getPricePerLesson, formatDuration, getTotalDuration } from "@/lib/package-utils";
import { TogglePackageButton } from "./TogglePackageButton";

// Tipi basati sul tuo modello Prisma
interface LessonPackage {
  id: number;
  name: string;
  description: string | null;
  lessonCount: number;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentsEnrolled: number;
}

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  packages: LessonPackage[];
}

interface TeacherPackagesClientProps {
  teacher: Teacher;
  isOwner?: boolean;
}

export function TeacherPackagesClient({ teacher, isOwner = false }: TeacherPackagesClientProps) {
  const router = useRouter();
  const [deletingPackage, setDeletingPackage] = useState<number | null>(null);

  const handleDeletePackage = async (packageId: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo pacchetto?")) {
      return;
    }

    setDeletingPackage(packageId);
    
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Errore nell'eliminazione del pacchetto");
      }
    } catch  {
      alert("Errore nell'eliminazione del pacchetto");
    } finally {
      setDeletingPackage(null);
    }
  };

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalStudents = teacher.packages.reduce((sum, pkg) => sum + pkg.studentsEnrolled, 0);
  const totalRevenue = teacher.packages.reduce((sum, pkg) => sum + (pkg.price * pkg.studentsEnrolled), 0);
  const activePackages = teacher.packages.filter(pkg => pkg.isActive).length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header del profilo insegnante */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={teacher.image || ""} alt={teacher.name || ""} />
              <AvatarFallback className="text-2xl bg-gray-100">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {teacher.name || "Nome non disponibile"}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{teacher.email}</span>
                  </div>
                </div>
                
                {isOwner && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/teacher/packages/new`)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nuovo Pacchetto
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Modifica Profilo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Statistiche migliorate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activePackages}</div>
              <div className="text-sm text-gray-600">Pacchetti Attivi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalStudents}</div>
              <div className="text-sm text-gray-600">Studenti Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatPrice(totalRevenue)}</div>
              <div className="text-sm text-gray-600">Fatturato Totale</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-2xl font-bold text-yellow-600">4.8</span>
              </div>
              <div className="text-sm text-gray-600">Valutazione Media</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Pacchetti */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Pacchetti di Lezioni
          </h2>
          {isOwner && teacher.packages.length > 0 && (
            <Button
              onClick={() => router.push(`/teacher/createPackageLessons`)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create a new Package
            </Button>
          )}
        </div>

        {teacher.packages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Packages Available
              </h3>
              <p className="text-gray-600 mb-6">
                {isOwner
                  ? "Create your first lesson package to start selling."
                  : "This teacher has not created any lesson packages yet."
                }
              </p>
              {isOwner && (
                <Button onClick={() => router.push(`/teacher/packages/new`)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Package
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacher.packages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{pkg.name}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {pkg.description || "Nessuna descrizione disponibile."}
                      </CardDescription>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/teacher/packages/${pkg.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg.id)}
                          disabled={deletingPackage === pkg.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>{pkg.lessonCount} lezioni</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{formatDuration(pkg.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{pkg.studentsEnrolled} studenti</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{formatDate(pkg.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Info aggiuntive */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Durata totale:</span>
                      <span>{getTotalDuration(pkg.duration, pkg.lessonCount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prezzo per lezione:</span>
                      <span>{getPricePerLesson(pkg.price, pkg.lessonCount)}</span>
                    </div>
                    {isOwner && (
                      <div className="flex items-center justify-between">
                        <span>Fatturato:</span>
                        <span className="text-green-600 font-medium">
                          {formatPrice(pkg.price * pkg.studentsEnrolled)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(pkg.price)}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Attivo" : "Inattivo"}
                      </Badge>
                      {isOwner && pkg.studentsEnrolled > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Venduto
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {isOwner ? (
                    <div className="flex gap-2">
           
                       <TogglePackageButton
          packageId={pkg.id}
          isActive={pkg.isActive}
          name={pkg.name}
          variant="switch"
        />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/teacher/packages/${pkg.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                        disabled={deletingPackage === pkg.id || pkg.studentsEnrolled > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full gap-2" disabled={!pkg.isActive}>
                      <Euro className="w-4 h-4" />
                      {pkg.isActive ? "Acquista Pacchetto" : "Non Disponibile"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
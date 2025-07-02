// app/student/profile/page.tsx
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Globe, 
  BookOpen, 
  Target, 
  Clock,
  Edit,
  Languages,
  Calendar,
  User,
  GraduationCap
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"

// Fetch current student's profile from database
async function getCurrentStudentProfile(userId: string) {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    })

    return studentProfile
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return null
  }
}

// Format timezone for display
function formatTimezone(timezone: string) {
  const timezoneMap: { [key: string]: string } = {
    'Europe/Rome': 'Europa/Roma (CET)',
    'Europe/London': 'Europa/Londra (GMT)',
    'America/New_York': 'America/New York (EST)',
    'America/Los_Angeles': 'America/Los Angeles (PST)',
    'Asia/Tokyo': 'Asia/Tokyo (JST)',
    'Australia/Sydney': 'Australia/Sydney (AEST)',
    'Europe/Berlin': 'Europa/Berlino (CET)',
    'Europe/Madrid': 'Europa/Madrid (CET)'
  }
  return timezoneMap[timezone] || timezone
}

// Format level for display
function formatLevel(level: string) {
  const levelMap: { [key: string]: string } = {
    'Beginner': 'Principiante',
    'Elementary': 'Elementare',
    'Intermediate': 'Intermedio',
    'Upper-Intermediate': 'Intermedio Superiore',
    'Advanced': 'Avanzato',
    'Proficient': 'Competente'
  }
  return levelMap[level] || level
}

// Get user initials for avatar fallback
function getUserInitials(username: string | null) {
  if (!username) return "S"
  return username.split('_').map(part => part[0]).join('').toUpperCase().slice(0, 2)
}

export default async function StudentProfilePage() {
  // Get current session
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Check if user has student role
  // if (session.user.role !== "STUDENT") {
  //   redirect("/unauthorized")
  // }

  const userId = session.user.id
  const studentProfile = await getCurrentStudentProfile(userId)

  // If no student profile exists, redirect to create one
  if (!studentProfile) {
    redirect("/student/profile/create")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={studentProfile.user.image || ""} alt={studentProfile.user.username || ""} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(studentProfile.user.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{studentProfile.user.username}</h1>
              </div>
              
              <p className="text-lg text-muted-foreground mb-4 text-center md:text-left">
                Studente di Lingue
              </p>

              {/* Level Badge */}
              <div className="mb-4">
                <Badge variant="default" className="text-sm">
                  {formatLevel(studentProfile.currentLevel ?? "")}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {studentProfile.timezone && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{formatTimezone(studentProfile.timezone)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Button asChild variant="outline">
                  <Link href={`/student/profile/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Profilo
                  </Link>
                </Button>
              </div>

              {/* Languages Section */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Lingua Madre
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.nativeLanguage ? (
                        <Badge variant="default">{studentProfile.nativeLanguage}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Nessuna lingua specificata</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Lingue da Imparare
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.learningLanguages?.length > 0 ? (
                        studentProfile.learningLanguages.map((lang) => (
                          <Badge key={lang} variant="secondary">{lang}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Nessuna lingua specificata</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Goals */}
              {studentProfile.learningGoals?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Obiettivi di Apprendimento
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.learningGoals.map((goal) => (
                      <Badge key={goal} variant="outline">{goal}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="schedule">Orari Preferiti</TabsTrigger>
          <TabsTrigger value="progress">I Miei Progressi</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Native Language Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Lingua Madre
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentProfile.nativeLanguage ? (
                  <div className="text-center py-4">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {studentProfile.nativeLanguage}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Nessuna lingua madre specificata</p>
                    <Button asChild size="sm">
                      <Link href="/student/profile/edit">Aggiungi</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Level Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Livello Attuale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {formatLevel(studentProfile.currentLevel ?? "")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Languages Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Lingue da Imparare
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentProfile.learningLanguages?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {studentProfile.learningLanguages.map((language) => (
                    <Badge key={language} variant="secondary" className="text-sm px-3 py-1">
                      {language}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Nessuna lingua da imparare specificata</p>
                  <Button asChild size="sm">
                    <Link href="/student/profile/edit">Aggiungi Lingue</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Goals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Obiettivi di Apprendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentProfile.learningGoals?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {studentProfile.learningGoals.map((goal) => (
                    <Badge key={goal} variant="outline" className="text-sm px-3 py-1">
                      {goal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Nessun obiettivo specificato</p>
                  <Button asChild size="sm">
                    <Link href="/student/profile/edit">Aggiungi Obiettivi</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Orari Preferiti
              </CardTitle>
              <CardDescription>
                I tuoi orari preferiti per le lezioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentProfile.preferredSchedule ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {studentProfile.preferredSchedule}
                    </p>
                  </div>
                  
                  {studentProfile.timezone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>Fuso orario: {formatTimezone(studentProfile.timezone)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Non hai ancora specificato i tuoi orari preferiti
                  </p>
                  <Button asChild>
                    <Link href="/student/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Aggiungi Orari Preferiti
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                I Miei Progressi
              </CardTitle>
              <CardDescription>
                Traccia i tuoi progressi nell apprendimento delle lingue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Il tracking dei progressi sarà disponibile qui
                </p>
                <p className="text-sm text-muted-foreground">
                  Inizia a prendere lezioni per vedere i tuoi progressi!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
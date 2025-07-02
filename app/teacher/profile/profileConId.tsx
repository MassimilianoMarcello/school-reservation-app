// app/profile/teacher/[id]/page.tsx
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  BookOpen, 
  Award, 
  MessageCircle,
  Video,
  Edit,
  Languages,
  GraduationCap,
  Trophy,
  Verified,
  DollarSign
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"

// Fetch teacher data from database
async function getTeacherProfile(profileId: string) {
  try {
    // First, try to find by profile ID
    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
            role: true
          }
        },
        specialties: true,
        reviews: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    username: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    // If not found by profile ID, try by user ID (for backward compatibility)
    if (!teacherProfile) {
      teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: profileId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              image: true,
              role: true
            }
          },
          specialties: true,
          reviews: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      username: true,
                      image: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      })
    }

    return teacherProfile
  } catch (error) {
    console.error("Error fetching teacher profile:", error)
    return null
  }
}

// Format specialty category for display
function formatSpecialtyCategory(category: string) {
  const categoryMap: { [key: string]: string } = {
    'CONVERSATION': 'Conversazione',
    'BUSINESS': 'Business',
    'EXAM_PREP': 'Preparazione Esami',
    'GRAMMAR': 'Grammatica',
    'PRONUNCIATION': 'Pronuncia',
    'WRITING': 'Scrittura',
    'BEGINNERS': 'Principianti',
    'ADVANCED': 'Avanzati'
  }
  return categoryMap[category] || category
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

// Get user initials for avatar fallback
function getUserInitials(username: string | null) {
  if (!username) return "T"
  return username.split('_').map(part => part[0]).join('').toUpperCase().slice(0, 2)
}

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  // Validate that the ID parameter exists
  if (!params.id) {
    console.error("No ID parameter provided")
    notFound()
  }

  const session = await auth()
  const teacherProfile = await getTeacherProfile(params.id)

  if (!teacherProfile) {
    console.error("Teacher profile not found for ID:", params.id)
    notFound()
  }

  const isOwnProfile = session?.user?.id === teacherProfile.userId
  const avgRatingNumber = teacherProfile.avgRating ? Number(teacherProfile.avgRating) : 0

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={teacherProfile.user.image || ""} alt={teacherProfile.user.username || ""} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(teacherProfile.user.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{teacherProfile.user.username}</h1>
                {teacherProfile.isVerified && (
                  <Verified className="w-6 h-6 text-blue-500" />
                )}
              </div>
              
              {teacherProfile.title && (
                <p className="text-lg text-muted-foreground mb-4 text-center md:text-left">
                  {teacherProfile.title}
                </p>
              )}

              {/* Rating and Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{avgRatingNumber.toFixed(2)}</span>
                  <span className="text-muted-foreground">({teacherProfile.totalReviews} recensioni)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{teacherProfile.totalLessons} lezioni</span>
                </div>
                {teacherProfile.timezone && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{formatTimezone(teacherProfile.timezone)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Status and Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant={teacherProfile.isAvailable ? "default" : "secondary"}>
                  {teacherProfile.isAvailable ? "Disponibile" : "Non disponibile"}
                </Badge>
                
                {isOwnProfile ? (
                  <Button asChild variant="outline">
                    <Link href={`/profile/teacher/edit/${teacherProfile.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifica Profilo
                    </Link>
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Prenota Lezione
                    </Button>
                    <Button variant="outline">
                      <Video className="w-4 h-4 mr-2" />
                      Lezione di Prova
                    </Button>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Lingue Madrelingua
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacherProfile.nativeLanguages?.map((lang) => (
                        <Badge key={lang} variant="default">{lang}</Badge>
                      )) || <span className="text-muted-foreground">Nessuna lingua specificata</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Lingue Insegnate
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacherProfile.teachingLanguages?.map((lang) => (
                        <Badge key={lang} variant="secondary">{lang}</Badge>
                      )) || <span className="text-muted-foreground">Nessuna lingua specificata</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              {(teacherProfile.hourlyRate || teacherProfile.trialLessonRate) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Prezzi
                  </h3>
                  <div className="flex gap-4">
                    {teacherProfile.hourlyRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">€{Number(teacherProfile.hourlyRate)}</div>
                        <div className="text-sm text-muted-foreground">all ora</div>
                      </div>
                    )}
                    {teacherProfile.trialLessonRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">€{Number(teacherProfile.trialLessonRate)}</div>
                        <div className="text-sm text-muted-foreground">lezione di prova</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">Chi Sono</TabsTrigger>
          <TabsTrigger value="specialties">Specializzazioni</TabsTrigger>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          <TabsTrigger value="schedule">Orari</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          {teacherProfile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {teacherProfile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teacherProfile.experience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Esperienza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {teacherProfile.experience}
                  </p>
                </CardContent>
              </Card>
            )}

            {teacherProfile.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Formazione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {teacherProfile.education}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Specialties Tab */}
        <TabsContent value="specialties">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherProfile.specialties?.map((specialty) => (
              <Card key={specialty.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{specialty.name}</CardTitle>
                  <CardDescription>
                    {formatSpecialtyCategory(specialty.category)}
                  </CardDescription>
                </CardHeader>
                {specialty.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{specialty.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {(!teacherProfile.specialties || teacherProfile.specialties.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nessuna specializzazione indicata</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {teacherProfile.reviews?.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.student.user.image || ""} />
                      <AvatarFallback>
                        {getUserInitials(review.student.user.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.student.user.username}</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!teacherProfile.reviews || teacherProfile.reviews.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Nessuna recensione ancora</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Orari Disponibili</CardTitle>
              <CardDescription>
                Visualizza e prenota gli orari disponibili per le lezioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Il calendario degli orari sarà disponibile qui
                </p>
                {!isOwnProfile && (
                  <Button>
                    <Clock className="w-4 h-4 mr-2" />
                    Prenota una lezione
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
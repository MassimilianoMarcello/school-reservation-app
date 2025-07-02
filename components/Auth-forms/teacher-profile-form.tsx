// components/forms/teacher-profile-form.tsx
"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

import { teacherProfileSchema, type TeacherProfileFormData, LANGUAGES, TIMEZONES } from "@/lib/zodSchemas"
// Update the import path below if your actions folder is not at src/actions or app/actions
import { createTeacherProfile } from "@/app/actions/profileActions/profile-actions"
import { toast } from "sonner"

export function TeacherProfileForm() {
  const [isPending, startTransition] = useTransition()
  const [selectedNativeLanguages, setSelectedNativeLanguages] = useState<string[]>([])
  const [selectedTeachingLanguages, setSelectedTeachingLanguages] = useState<string[]>([])

  const form = useForm<TeacherProfileFormData>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      title: "",
      bio: "",
      nativeLanguages: [],
      teachingLanguages: [],
      hourlyRate: 20,
      trialLessonRate: 15,
      timezone: "",
      experience: "",
      education: "",
    },
  })

  const onSubmit = (data: TeacherProfileFormData) => {
    startTransition(async () => {
      const result = await createTeacherProfile(data)
      
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  const handleLanguageSelect = (language: string, type: 'native' | 'teaching') => {
    if (type === 'native') {
      const newSelected = selectedNativeLanguages.includes(language)
        ? selectedNativeLanguages.filter(l => l !== language)
        : [...selectedNativeLanguages, language]
      
      setSelectedNativeLanguages(newSelected)
      form.setValue('nativeLanguages', newSelected)
    } else {
      const newSelected = selectedTeachingLanguages.includes(language)
        ? selectedTeachingLanguages.filter(l => l !== language)
        : [...selectedTeachingLanguages, language]
      
      setSelectedTeachingLanguages(newSelected)
      form.setValue('teachingLanguages', newSelected)
    }
  }

  const removeLanguage = (language: string, type: 'native' | 'teaching') => {
    if (type === 'native') {
      const newSelected = selectedNativeLanguages.filter(l => l !== language)
      setSelectedNativeLanguages(newSelected)
      form.setValue('nativeLanguages', newSelected)
    } else {
      const newSelected = selectedTeachingLanguages.filter(l => l !== language)
      setSelectedTeachingLanguages(newSelected)
      form.setValue('teachingLanguages', newSelected)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crea il tuo Profilo Insegnante</CardTitle>
        <CardDescription>
          Completa le informazioni per creare il tuo profilo pubblico da insegnante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo Professionale</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="es. Insegnante di Italiano certificato"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Un titolo accattivante che descrive la tua specializzazione
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Raccontaci di te, della tua esperienza nell'insegnamento e del tuo metodo..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrivi la tua esperienza e il tuo approccio all insegnamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Native Languages */}
            <FormField
              control={form.control}
              name="nativeLanguages"
              render={() => (
                <FormItem>
                  <FormLabel>Lingue Madrelingua</FormLabel>
                  <FormDescription>
                    Seleziona le tue lingue native
                  </FormDescription>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`native-${language}`}
                          checked={selectedNativeLanguages.includes(language)}
                          onCheckedChange={() => handleLanguageSelect(language, 'native')}
                        />
                        <label
                          htmlFor={`native-${language}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedNativeLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedNativeLanguages.map((language) => (
                        <Badge key={language} variant="default" className="flex items-center gap-1">
                          {language}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeLanguage(language, 'native')}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teaching Languages */}
            <FormField
              control={form.control}
              name="teachingLanguages"
              render={() => (
                <FormItem>
                  <FormLabel>Lingue che Insegni</FormLabel>
                  <FormDescription>
                    Seleziona le lingue che vuoi insegnare
                  </FormDescription>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`teaching-${language}`}
                          checked={selectedTeachingLanguages.includes(language)}
                          onCheckedChange={() => handleLanguageSelect(language, 'teaching')}
                        />
                        <label
                          htmlFor={`teaching-${language}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedTeachingLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTeachingLanguages.map((language) => (
                        <Badge key={language} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeLanguage(language, 'teaching')}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hourly Rate */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tariffa Oraria (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="5"
                        max="200"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Il tuo prezzo per ora di lezione
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trialLessonRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tariffa Lezione di Prova (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="200"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Prezzo per la prima lezione
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuso Orario</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il tuo fuso orario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Aiuta gli studenti a sapere quando sei disponibile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Esperienza (Opzionale)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi la tua esperienza nell'insegnamento, certificazioni, anni di insegnamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formazione (Opzionale)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="La tua formazione accademica, diplomi, certificazioni..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Creazione in corso..." : "Crea Profilo Insegnante"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
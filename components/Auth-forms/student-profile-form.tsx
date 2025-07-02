// components/forms/student-profile-form.tsx
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

import { 
  studentProfileSchema, 
  type StudentProfileFormData, 
  LANGUAGES, 
  LEVELS, 
  LEARNING_GOALS,
  TIMEZONES 
} from "@/lib/zodSchemas"
import { createStudentProfile } from "@/app/actions/profileActions/profile-actions"
import { toast } from "sonner"

export function StudentProfileForm() {
  const [isPending, startTransition] = useTransition()
  const [selectedLearningLanguages, setSelectedLearningLanguages] = useState<string[]>([])
  const [selectedLearningGoals, setSelectedLearningGoals] = useState<string[]>([])

  const form = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      nativeLanguage: "",
      learningLanguages: [],
      currentLevel: "Beginner",
      learningGoals: [],
      timezone: "",
      preferredSchedule: "",
    },
  })

  const onSubmit = (data: StudentProfileFormData) => {
    startTransition(async () => {
      const result = await createStudentProfile(data)
      
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  const handleLearningLanguageSelect = (language: string) => {
    const newSelected = selectedLearningLanguages.includes(language)
      ? selectedLearningLanguages.filter(l => l !== language)
      : [...selectedLearningLanguages, language]
    
    setSelectedLearningLanguages(newSelected)
    form.setValue('learningLanguages', newSelected)
  }

  const handleLearningGoalSelect = (goal: string) => {
    const newSelected = selectedLearningGoals.includes(goal)
      ? selectedLearningGoals.filter(g => g !== goal)
      : [...selectedLearningGoals, goal]
    
    setSelectedLearningGoals(newSelected)
    form.setValue('learningGoals', newSelected)
  }

  const removeLearningLanguage = (language: string) => {
    const newSelected = selectedLearningLanguages.filter(l => l !== language)
    setSelectedLearningLanguages(newSelected)
    form.setValue('learningLanguages', newSelected)
  }

  const removeLearningGoal = (goal: string) => {
    const newSelected = selectedLearningGoals.filter(g => g !== goal)
    setSelectedLearningGoals(newSelected)
    form.setValue('learningGoals', newSelected)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crea il tuo Profilo Studente</CardTitle>
        <CardDescription>
          Completa le informazioni per personalizzare la tua esperienza di apprendimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Native Language */}
            <FormField
              control={form.control}
              name="nativeLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lingua Madre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona la tua lingua madre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    La lingua che parli meglio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Learning Languages */}
            <FormField
              control={form.control}
              name="learningLanguages"
              render={() => (
                <FormItem>
                  <FormLabel>Lingue che Vuoi Imparare</FormLabel>
                  <FormDescription>
                    Seleziona le lingue che stai studiando o vuoi studiare
                  </FormDescription>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`learning-${language}`}
                          checked={selectedLearningLanguages.includes(language)}
                          onCheckedChange={() => handleLearningLanguageSelect(language)}
                        />
                        <label
                          htmlFor={`learning-${language}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedLearningLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLearningLanguages.map((language) => (
                        <Badge key={language} variant="default" className="flex items-center gap-1">
                          {language}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeLearningLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Level */}
            <FormField
              control={form.control}
              name="currentLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livello Attuale</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il tuo livello" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Il tuo livello generale nelle lingue che stai imparando
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Learning Goals */}
            <FormField
              control={form.control}
              name="learningGoals"
              render={() => (
                <FormItem>
                  <FormLabel>Obiettivi di Apprendimento</FormLabel>
                  <FormDescription>
                    Perché vuoi imparare queste lingue?
                  </FormDescription>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {LEARNING_GOALS.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={`goal-${goal}`}
                          checked={selectedLearningGoals.includes(goal)}
                          onCheckedChange={() => handleLearningGoalSelect(goal)}
                        />
                        <label
                          htmlFor={`goal-${goal}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {goal}
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedLearningGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLearningGoals.map((goal) => (
                        <Badge key={goal} variant="secondary" className="flex items-center gap-1">
                          {goal}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeLearningGoal(goal)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuso Orario (Opzionale)</FormLabel>
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
                    Aiuta gli insegnanti a capire i tuoi orari preferiti
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Schedule */}
            <FormField
              control={form.control}
              name="preferredSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orari Preferiti (Opzionale)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Quando preferisci fare lezione? (es. Mattina nei weekend, sera dopo le 18:00...)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrivi quando preferisci fare lezione per aiutare gli insegnanti
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Creazione in corso..." : "Crea Profilo Studente"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
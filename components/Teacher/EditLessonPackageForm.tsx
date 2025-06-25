"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { updateLessonPackage, getPackageById } from "@/app/actions/teacherActions/createPackagesActions";
import { lessonPackageSchema } from "@/lib/zodSchemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as z from "zod";

type LessonPackageForm = z.infer<typeof lessonPackageSchema>;

interface EditLessonPackageFormProps {
  packageId: number;
  teacherId: string;
}

export function EditLessonPackageForm({ packageId, teacherId }: EditLessonPackageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<LessonPackageForm>({
    resolver: zodResolver(lessonPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      lessonCount: undefined,
      duration: undefined,
      price: undefined,
    },
  });

  // Carica i dati del pacchetto esistente
  useEffect(() => {
    const loadPackageData = async () => {
      try {
        const result = await getPackageById(packageId);
        
        if (result.success && result.data) {
          const pkg = result.data;
          form.reset({
            name: pkg.name,
            description: pkg.description || "",
            lessonCount: pkg.lessonCount,
            duration: pkg.duration,
            price: pkg.price,
          });
        } else {
          setMessage({ type: 'error', text: result.error || 'Errore nel caricamento del pacchetto.' });
        }
      } catch  {
        setMessage({ type: 'error', text: 'Errore nel caricamento del pacchetto.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadPackageData();
  }, [packageId, form]);

  // Auto-dismiss del messaggio dopo 5 secondi
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const onSubmit = async (data: LessonPackageForm) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const result = await updateLessonPackage({
        ...data,
        id: packageId,
        teacherId,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Pacchetto aggiornato con successo!' });
        // Redirect dopo successo
        setTimeout(() => {
          router.push('/teacher/packages');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Errore nell\'aggiornamento del pacchetto.' });
      }
    } catch  {
      setMessage({ type: 'error', text: 'Si è verificato un errore imprevisto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Caricamento...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle>Modifica Pacchetto Lezioni</CardTitle>
            <CardDescription>
              Aggiorna i dettagli del tuo pacchetto di lezioni.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-4 rounded-md transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Chiudi messaggio"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full animate-[shrink_5s_linear_forwards] ${
                  message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  animation: 'shrink 5s linear forwards',
                }}
              />
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome del Pacchetto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es: Pacchetto Base Inglese"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi il contenuto e gli obiettivi del pacchetto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lessonCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero di Lezioni</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durata (minuti)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezzo (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            field.onChange("");
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Aggiornamento..." : "Aggiorna Pacchetto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
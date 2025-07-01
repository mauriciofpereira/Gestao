
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres." }),
})

export type AnnouncementFormValues = z.infer<typeof formSchema>

interface AnnouncementFormProps {
  onSubmit: (values: AnnouncementFormValues) => void
  onCancel: () => void
}

export function AnnouncementForm({ onSubmit, onCancel }: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Comunicado</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Festa de Fim de Ano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do comunicado..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Publicar Comunicado</Button>
        </div>
      </form>
    </Form>
  )
}


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Worksite } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  address: z.string().min(5, { message: "O endereço deve ter pelo menos 5 caracteres." }),
  type: z.enum(["Hotel", "Obra", "Outro"], { required_error: "Selecione o tipo de local." }),
})

export type WorksiteFormValues = z.infer<typeof formSchema>

interface WorksiteFormProps {
  onSubmit: (values: WorksiteFormValues) => void
  onCancel: () => void
  editingWorksite: Omit<Worksite, 'id' | 'isActive'> | Worksite | null
}

export function WorksiteForm({ onSubmit, onCancel, editingWorksite }: WorksiteFormProps) {
  const form = useForm<WorksiteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingWorksite?.name || "",
      address: editingWorksite?.address || "",
      type: editingWorksite?.type || undefined,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Local</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Hotel Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Rua da Estação, 123, Bruxelas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Local</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Obra">Obra</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{editingWorksite ? 'Atualizar' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}

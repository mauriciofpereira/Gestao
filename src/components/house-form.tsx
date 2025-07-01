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
import type { House } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  address: z.string().min(5, { message: "O endereço deve ter pelo menos 5 caracteres." }),
  rent: z.coerce.number().min(0, { message: "O valor do aluguel não pode ser negativo." }),
})

export type HouseFormValues = z.infer<typeof formSchema>

interface HouseFormProps {
  onSubmit: (values: HouseFormValues) => void
  onCancel: () => void
  editingHouse: Omit<House, 'id'> | House | null
}

export function HouseForm({ onSubmit, onCancel, editingHouse }: HouseFormProps) {
  const form = useForm<HouseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingHouse?.name || "",
      address: editingHouse?.address || "",
      rent: editingHouse?.rent || undefined,
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
              <FormLabel>Nome da Casa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Casa Deerlijk" {...field} />
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
                <Input placeholder="Ex: Rua das Flores, 1, Deerlijk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Aluguel (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{editingHouse ? 'Atualizar' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}

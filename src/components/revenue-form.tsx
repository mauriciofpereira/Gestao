
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

const formSchema = z.object({
  description: z.string().min(2, { message: "A descrição é obrigatória." }),
  client: z.string().min(2, { message: "O cliente é obrigatório." }),
  date: z.string().min(1, { message: "A data é obrigatória." }),
  amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
})

export type RevenueFormValues = z.infer<typeof formSchema>

interface RevenueFormProps {
  onSubmit: (values: RevenueFormValues) => void
  onCancel: () => void
}

export function RevenueForm({ onSubmit, onCancel }: RevenueFormProps) {
  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      client: "",
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pagamento Projeto X" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Empresa Y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="10000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Receita</Button>
        </div>
      </form>
    </Form>
  )
}


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
  category: z.string().min(2, { message: "A categoria é obrigatória." }),
  date: z.string().min(1, { message: "A data é obrigatória." }),
  amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
})

export type ExpenseFormValues = z.infer<typeof formSchema>

interface ExpenseFormProps {
  onSubmit: (values: ExpenseFormValues) => void
  onCancel: () => void
}

export function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      category: "",
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
                <Input placeholder="Ex: Material de escritório" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Suprimentos" {...field} />
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
                <Input type="number" step="0.01" placeholder="150.50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Despesa</Button>
        </div>
      </form>
    </Form>
  )
}

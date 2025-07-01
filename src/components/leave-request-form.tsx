
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/types"
import { format, differenceInBusinessDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from "react"
import type { DateRange } from "react-day-picker"

const formSchema = z.object({
  employeeId: z.string().min(1, { message: "Selecione um funcionário." }),
  dateRange: z.object({
    from: z.date({ required_error: "A data de início é obrigatória." }),
    to: z.date({ required_error: "A data de término é obrigatória." }),
  }),
  reason: z.string().optional(),
})

export type LeaveRequestFormValues = z.infer<typeof formSchema>

interface LeaveRequestFormProps {
  onSubmit: (values: LeaveRequestFormValues) => void
  onCancel: () => void
  users: User[]
}

export function LeaveRequestForm({ onSubmit, onCancel, users }: LeaveRequestFormProps) {
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      reason: "",
    },
  })

  const watchDateRange = form.watch("dateRange");
  const businessDays = watchDateRange?.from && watchDateRange?.to 
    ? differenceInBusinessDays(watchDateRange.to, watchDateRange.from) + 1
    : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funcionário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Período de Férias</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value?.from && "text-muted-foreground"
                        )}
                      >
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y", { locale: ptBR })} -{" "}
                              {format(field.value.to, "LLL dd, y", { locale: ptBR })}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y", { locale: ptBR })
                          )
                        ) : (
                          <span>Escolha um período</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Total de dias úteis solicitados: <span className="font-bold text-primary">{businessDays > 0 ? businessDays : 0}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Viagem em família, descanso..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Enviar Solicitação</Button>
        </div>
      </form>
    </Form>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
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
import type { User, WorkLog } from "@/lib/types"
import { formatMinutesToHours } from "@/contexts/data-context"

const formSchema = z.object({
  userId: z.string().min(1, { message: "Selecione um funcionário." }),
  date: z.string().min(1, { message: "A data é obrigatória." }),
  start: z.string().optional(),
  end: z.string().optional(),
  vertrekker: z.coerce.number().optional(),
  blijver: z.coerce.number().optional(),
  extraBed: z.coerce.number().optional(),
  extraUur: z.coerce.number().optional(),
}).refine(data => {
    return true;
});

export type TimeLogFormValues = z.infer<typeof formSchema>

interface TimeLogFormProps {
  onSubmit: (values: TimeLogFormValues, totalMinutes: number) => void
  onCancel: () => void
  editingLog: WorkLog | null
  users: User[]
}

export function TimeLogForm({ onSubmit, onCancel, editingLog, users }: TimeLogFormProps) {
  const employeeList = users.filter(u => u.role === 'employee');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(editingLog?.totalMinutes || 0);

  const form = useForm<TimeLogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: editingLog?.userId || "",
      date: editingLog?.date || "",
      start: editingLog?.details.start || "",
      end: editingLog?.details.end || "",
      vertrekker: editingLog?.details.vertrekker || 0,
      blijver: editingLog?.details.blijver || 0,
      extraBed: editingLog?.details.extraBed || 0,
      extraUur: editingLog?.details.extraUur || 0,
    },
  })
  
  useEffect(() => {
    if (!editingLog?.date) {
        form.setValue('date', format(new Date(), 'yyyy-MM-dd'));
    }
  }, [editingLog, form]);

  const watchAllFields = form.watch();

  useEffect(() => {
    const user = employeeList.find(u => u.id === watchAllFields.userId);
    setSelectedUser(user || null);
  }, [watchAllFields.userId, employeeList]);


  useEffect(() => {
    if (selectedUser?.jobType === 'byTime') {
      const { start, end } = watchAllFields;
      if (start && end) {
        const total = (new Date(`1970-01-01T${end}:00`) - new Date(`1970-01-01T${start}:00`)) / 60000;
        const breakTime = total > 360 ? 30 : 0;
        setTotalMinutes(total > 0 ? Math.round(total - breakTime) : 0);
      } else {
        setTotalMinutes(0);
      }
    } else if (selectedUser?.jobType === 'byProduction') {
      const { vertrekker = 0, blijver = 0, extraBed = 0, extraUur = 0 } = watchAllFields;
      setTotalMinutes((vertrekker * 30) + (blijver * 20) + (extraBed * 5) + extraUur);
    } else {
        setTotalMinutes(0);
    }
  }, [watchAllFields, selectedUser]);


  const handleSubmit = (values: TimeLogFormValues) => {
    onSubmit(values, totalMinutes);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Funcionário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingLog}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o funcionário..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {employeeList.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
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
        </div>
        
        {selectedUser && (
            <div className="mt-4 pt-4 border-t">
                {selectedUser.jobType === 'byTime' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <FormField control={form.control} name="start" render={({ field }) => (
                            <FormItem><FormLabel>Entrada</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="end" render={({ field }) => (
                            <FormItem><FormLabel>Saída</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                )}
                 {selectedUser.jobType === 'byProduction' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                        <FormField control={form.control} name="vertrekker" render={({ field }) => (
                            <FormItem><FormLabel>Vertrekker</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="blijver" render={({ field }) => (
                            <FormItem><FormLabel>Blijver</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="extraBed" render={({ field }) => (
                            <FormItem><FormLabel>Extra Bed</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="extraUur" render={({ field }) => (
                            <FormItem><FormLabel>Extra Uur (min)</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                )}
            </div>
        )}

        {selectedUser && (
            <div className="mt-4 text-center bg-muted p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Total de Horas Calculado</p>
                <p className="text-2xl font-bold text-primary font-headline">{formatMinutesToHours(totalMinutes)}</p>
            </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={!selectedUser}>{editingLog ? 'Atualizar' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}

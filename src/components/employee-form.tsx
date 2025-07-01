
"use client"

import { useState } from "react"
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
import type { House, User } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().optional(),
  startDate: z.string().min(1, { message: "A data de início é obrigatória." }),
  hourlyRate: z.coerce.number().optional(),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  houseId: z.coerce.number().min(1, { message: "Selecione uma casa." }),
  jobType: z.enum(["byTime", "byProduction"], { required_error: "Selecione o tipo de contrato." }),
})

export type EmployeeFormValues = z.infer<typeof formSchema>

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => void
  onCancel: () => void
  onRateChange: (userId: string, rate: number, date: string) => void
  editingUser: User | null
  houses: House[]
}

export function EmployeeForm({ onSubmit, onCancel, editingUser, houses, onRateChange }: EmployeeFormProps) {
  const [newRateValue, setNewRateValue] = useState("");
  const [newRateDate, setNewRateDate] = useState("");

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      password: "",
      startDate: editingUser?.startDate || "",
      phone: editingUser?.phone || "",
      houseId: editingUser?.houseId || undefined,
      jobType: editingUser?.jobType || undefined,
    },
  })

  const handleRateSubmit = () => {
    if (!editingUser || !newRateValue || !newRateDate) return;
    onRateChange(editingUser.id, parseFloat(newRateValue), newRateDate);
    setNewRateValue("");
    setNewRateDate("");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ana Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Login)</FormLabel>
                <FormControl>
                  <Input placeholder="ana.silva@paralelo.com" {...field} readOnly={!!editingUser} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={editingUser ? "Deixar em branco para manter" : "••••••••"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Início Contrato</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!editingUser && (
             <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor/Hora Inicial (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="912345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            
          <FormField
            control={form.control}
            name="houseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Casa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a casa..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {houses.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contrato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="byTime">Por Hora (Entrada/Saída)</SelectItem>
                    <SelectItem value="byProduction">Por Produção (Quartos)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {editingUser && (
            <div className="md:col-span-2 mt-4 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Histórico de Valor/Hora</h3>
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">
                    {editingUser.hourlyRates.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()).map((hr, i) => ( 
                        <div key={i} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <span className="text-sm text-muted-foreground">Desde {new Date(hr.effectiveDate + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                            <span className="font-bold text-sm">€ {hr.rate.toFixed(2)}</span>
                        </div> 
                    ))}
                </div>
                <h4 className="mt-4 mb-2 font-semibold text-sm">Programar Aumento</h4>
                <div className="flex gap-2">
                    <Input type="date" value={newRateDate} onChange={(e) => setNewRateDate(e.target.value)} className="bg-muted"/>
                    <Input type="number" step="0.01" value={newRateValue} onChange={(e) => setNewRateValue(e.target.value)} placeholder="Novo Valor" className="bg-muted"/>
                    <Button type="button" onClick={handleRateSubmit}>Adicionar</Button>
                </div>
            </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">{editingUser ? 'Atualizar' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}

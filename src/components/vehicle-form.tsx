
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
import type { Vehicle } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  plate: z.string().min(5, { message: "A placa é obrigatória." }),
  insurance: z.string().min(1, { message: "Data do seguro é obrigatória." }),
  inspection: z.string().min(1, { message: "Data da inspeção é obrigatória." }),
  status: z.enum(["Disponível", "Em uso", "Manutenção"], { required_error: "Selecione um status." }),
  hint: z.string().optional(),
})

export type VehicleFormValues = z.infer<typeof formSchema>

interface VehicleFormProps {
  onSubmit: (values: VehicleFormValues) => void
  onCancel: () => void
  editingVehicle: Vehicle | null
}

export function VehicleForm({ onSubmit, onCancel, editingVehicle }: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingVehicle?.name || "",
      plate: editingVehicle?.plate || "",
      insurance: editingVehicle?.insurance || "",
      inspection: editingVehicle?.inspection || "",
      status: editingVehicle?.status || "Disponível",
      hint: editingVehicle?.hint || "",
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
              <FormLabel>Nome/Modelo do Veículo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fiat Toro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ABC-1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Seguro Válido Até</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="inspection"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Inspeção Válida Até</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em uso">Em uso</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="hint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dica para Imagem (AI Hint)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: white pickup truck" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{editingVehicle ? 'Atualizar Veículo' : 'Salvar Veículo'}</Button>
        </div>
      </form>
    </Form>
  )
}

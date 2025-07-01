
"use client"

import { useState } from "react";
import Image from "next/image"
import { useData } from "@/contexts/data-context"
import { format } from "date-fns";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VehicleForm, VehicleFormValues } from "@/components/vehicle-form";
import type { Vehicle } from "@/lib/types";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useHasPermission } from "@/hooks/use-has-permission";

export default function FrotaPage() {
  const isAuthorized = useRequireAuth('Gerenciar Locais, Casas e Frota');
  const canManage = useHasPermission('Gerenciar Locais, Casas e Frota');

  const { vehicles, setVehicles } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSave = (values: VehicleFormValues) => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...values } : v));
    } else {
      const newVehicle: Vehicle = {
        id: Math.max(0, ...vehicles.map(v => v.id)) + 1,
        image: "https://placehold.co/600x400.png",
        ...values,
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    handleCloseModal();
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
      setVehicleToDelete(null);
    }
  };

  const handleStatusChange = (vehicleId: number, status: Vehicle['status']) => {
    setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, status } : v
    ));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString + 'T00:00:00'), 'dd/MM/yyyy');
  }

  if (!isAuthorized) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Gestão de Frota</h1>
            <p className="text-muted-foreground">Controle os veículos da empresa.</p>
          </div>
          {canManage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Veículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</DialogTitle>
                </DialogHeader>
                <VehicleForm 
                  key={editingVehicle?.id}
                  editingVehicle={editingVehicle} 
                  onSubmit={handleSave} 
                  onCancel={handleCloseModal} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="flex flex-col">
              <CardHeader className="p-0">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  width={600}
                  height={400}
                  data-ai-hint={vehicle.hint}
                  className="rounded-t-lg aspect-[3/2] object-cover"
                />
              </CardHeader>
              <CardContent className="p-4 grid gap-1 flex-grow">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-headline">{vehicle.name}</CardTitle>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Badge
                        variant={vehicle.status === 'Disponível' ? 'default' : vehicle.status === 'Manutenção' ? 'destructive' : 'secondary'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {vehicle.status}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={!canManage} onClick={() => handleStatusChange(vehicle.id, 'Disponível')}>
                        Disponível
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!canManage} onClick={() => handleStatusChange(vehicle.id, 'Em uso')}>
                        Em uso
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!canManage} onClick={() => handleStatusChange(vehicle.id, 'Manutenção')}>
                        Manutenção
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>Placa: {vehicle.plate}</CardDescription>
                <p className="text-xs text-muted-foreground">Seguro até: {formatDate(vehicle.insurance)}</p>
                <p className="text-xs text-muted-foreground">Inspeção até: {formatDate(vehicle.inspection)}</p>
              </CardContent>
              {canManage && (
                <CardFooter className="flex gap-2 p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenModal(vehicle)}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => setVehicleToDelete(vehicle)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o veículo "{vehicleToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVehicleToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

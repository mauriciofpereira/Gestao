
"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"; // Import useData
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { HouseForm, HouseFormValues } from "@/components/house-form"
import type { House } from "@/lib/types"
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useHasPermission } from "@/hooks/use-has-permission";

export default function CasasPage() {
  const isAuthorized = useRequireAuth('Gerenciar Locais, Casas e Frota');
  const canManage = useHasPermission('Gerenciar Locais, Casas e Frota');

  const { houses, setHouses, users, setUsers } = useData(); // Use data from context
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null)

  const handleOpenModal = (house: House | null = null) => {
    setEditingHouse(house)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHouse(null)
  }

  const handleSave = (values: HouseFormValues) => {
    if (editingHouse) {
      setHouses(prev => prev.map(h => h.id === editingHouse.id ? { ...h, ...values } : h));
    } else {
      const newHouse: House = {
        id: Math.max(0, ...houses.map(h => h.id)) + 1,
        ...values,
      }
      setHouses(prev => [...prev, newHouse]);
    }
    handleCloseModal()
  }

  const handleDeleteConfirm = () => {
    if (houseToDelete) {
      // Un-assign users from the house that is being deleted
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.houseId === houseToDelete.id ? { ...user, houseId: null } : user
        )
      );
      
      // Delete the house
      setHouses(prev => prev.filter(h => h.id !== houseToDelete.id));
      
      toast({
        title: "Casa Excluída",
        description: `A casa "${houseToDelete.name}" foi excluída e os funcionários foram desassociados.`,
      });

      setHouseToDelete(null);
    }
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
            <h1 className="text-3xl font-headline font-bold tracking-tight">Gestão de Casas</h1>
            <p className="text-muted-foreground">Gerencie as moradas da equipe.</p>
          </div>
          {canManage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Casa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingHouse ? "Editar Casa" : "Adicionar Nova Casa"}
                  </DialogTitle>
                </DialogHeader>
                <HouseForm
                  key={editingHouse?.id}
                  editingHouse={editingHouse}
                  onSubmit={handleSave}
                  onCancel={handleCloseModal}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Casas Registradas</CardTitle>
            <CardDescription>Lista de todas as moradas disponíveis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Aluguel (€)</TableHead>
                  {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {houses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="h-24 text-center">
                      Nenhuma casa registrada.
                    </TableCell>
                  </TableRow>
                )}
                {houses.map((house) => (
                  <TableRow key={house.id}>
                    <TableCell className="font-medium">{house.name}</TableCell>
                    <TableCell>{house.address}</TableCell>
                    <TableCell>€ {house.rent.toFixed(2)}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(house)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setHouseToDelete(house)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!houseToDelete} onOpenChange={(open) => !open && setHouseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a casa "{houseToDelete?.name}" e desassociará todos os funcionários que moram nela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHouseToDelete(null)}>Cancelar</AlertDialogCancel>
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

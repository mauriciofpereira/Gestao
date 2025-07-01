
"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, ArchiveRestore, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
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
import { WorksiteForm, WorksiteFormValues } from "@/components/worksite-form"
import type { Worksite } from "@/lib/types"
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useHasPermission } from "@/hooks/use-has-permission";

export default function LocaisPage() {
  const isAuthorized = useRequireAuth('Gerenciar Locais, Casas e Frota');
  const canManage = useHasPermission('Gerenciar Locais, Casas e Frota');

  const { worksites, setWorksites, planning, setPlanning } = useData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorksite, setEditingWorksite] = useState<Worksite | null>(null)
  const [worksiteToDeactivate, setWorksiteToDeactivate] = useState<Worksite | null>(null)

  const handleOpenModal = (worksite: Worksite | null = null) => {
    setEditingWorksite(worksite)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWorksite(null)
  }

  const handleSave = (values: WorksiteFormValues) => {
    if (editingWorksite) {
        // If name changed, update all planning entries to maintain data integrity
        if (editingWorksite.name !== values.name) {
          const oldName = editingWorksite.name;
          const newName = values.name;
          setPlanning(prevPlanning => {
            const newPlanningData = { ...prevPlanning };
            Object.keys(newPlanningData).forEach(date => {
              Object.keys(newPlanningData[date]).forEach(userId => {
                if (newPlanningData[date][userId] === oldName) {
                  newPlanningData[date][userId] = newName;
                }
              });
            });
            return newPlanningData;
          });
          toast({
            title: "Escala Sincronizada",
            description: `O nome do local foi atualizado nas escalas futuras.`,
          });
        }
        setWorksites(prev => prev.map(w => w.id === editingWorksite.id ? { ...w, ...values } : w));
    } else {
        const newWorksite: Worksite = {
            id: Math.max(0, ...worksites.map(w => w.id)) + 1,
            isActive: true, // Default to active on creation
            ...values,
        }
        setWorksites(prev => [...prev, newWorksite]);
    }
    handleCloseModal()
  }
  
  const handleToggleActive = (worksite: Worksite) => {
    if (worksite.isActive) {
      // Show confirmation dialog before deactivating
      setWorksiteToDeactivate(worksite);
    } else {
      // Directly reactivate
      setWorksites(prev => prev.map(w => w.id === worksite.id ? { ...w, isActive: true } : w));
      toast({
        title: "Local Reativado",
        description: `O local "${worksite.name}" está ativo novamente.`,
      })
    }
  }

  const handleDeactivateConfirm = () => {
    if (worksiteToDeactivate) {
      const worksiteName = worksiteToDeactivate.name;
      
      // Deactivate the worksite
      setWorksites(prev => prev.map(w => w.id === worksiteToDeactivate.id ? { ...w, isActive: false } : w));
      
      // Remove from any planning entries
      setPlanning(prevPlanning => {
        const newPlanning = { ...prevPlanning };
        for (const dateKey in newPlanning) {
          for (const userId in newPlanning[dateKey]) {
            if (newPlanning[dateKey][userId] === worksiteName) {
              // Set to 'Not Defined' instead of deleting to keep the user row
              newPlanning[dateKey][userId] = 'nao_definido';
            }
          }
        }
        return newPlanning;
      });

      toast({
        title: "Local Desativado",
        description: `O local "${worksiteToDeactivate.name}" foi desativado e removido das futuras escalas.`,
      })
      setWorksiteToDeactivate(null);
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
            <h1 className="text-3xl font-headline font-bold tracking-tight">Locais de Trabalho</h1>
            <p className="text-muted-foreground">Gerencie os locais de trabalho (hotéis, obras, etc.).</p>
          </div>
          {canManage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Local
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingWorksite ? "Editar Local" : "Adicionar Novo Local"}
                  </DialogTitle>
                </DialogHeader>
                <WorksiteForm
                  key={editingWorksite?.id}
                  editingWorksite={editingWorksite}
                  onSubmit={handleSave}
                  onCancel={handleCloseModal}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Locais Registrados</CardTitle>
            <CardDescription>Lista de todos os locais de trabalho disponíveis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {worksites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5: 4} className="h-24 text-center">
                      Nenhum local de trabalho registrado.
                    </TableCell>
                  </TableRow>
                )}
                {worksites.map((worksite) => (
                  <TableRow key={worksite.id} className={cn(!worksite.isActive && 'text-muted-foreground')}>
                    <TableCell className="font-medium">{worksite.name}</TableCell>
                    <TableCell>{worksite.address}</TableCell>
                    <TableCell>{worksite.type}</TableCell>
                     <TableCell>
                        <Badge variant={worksite.isActive ? "default" : "secondary"}>
                          {worksite.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(worksite)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(worksite.isActive ? 'text-destructive hover:text-destructive' : 'text-primary hover:text-primary')} 
                          onClick={() => handleToggleActive(worksite)}
                        >
                          {worksite.isActive ? <Trash2 className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                          <span className="sr-only">{worksite.isActive ? 'Desativar' : 'Reativar'}</span>
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

      <AlertDialog open={!!worksiteToDeactivate} onOpenChange={(open) => !open && setWorksiteToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não excluirá o local, mas irá **desativá-lo**. O local "{worksiteToDeactivate?.name}" não poderá mais ser selecionado em novas escalas de trabalho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorksiteToDeactivate(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeactivateConfirm}
            >
              Confirmar Desativação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

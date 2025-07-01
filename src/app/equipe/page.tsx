
"use client"

import { useState, useMemo, useEffect } from "react"
import { useData, getRateForDate } from "@/contexts/data-context"
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
import { EmployeeForm, EmployeeFormValues } from "@/components/employee-form"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequireAuth } from "@/hooks/use-require-auth"

export default function EquipePage() {
  const isAuthorized = useRequireAuth('Gerenciar Equipe (CRUD)');
  const { users, setUsers, houses, leaveRequests, setPlanning, setWorkLogs, setLeaveRequests } = useData()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [currentRates, setCurrentRates] = useState<Record<string, number> | null>(null)

  const employeeList = useMemo(() => users.filter((u) => u.role === "employee"), [users])
  const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users]);
  
  useEffect(() => {
      const rates: Record<string, number> = {};
      employeeList.forEach(user => {
          rates[user.id] = getRateForDate(user, new Date());
      });
      setCurrentRates(rates);
  }, [employeeList]);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSave = (values: EmployeeFormValues) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...values, password: values.password || u.password, email: u.email } : u));
    } else {
      const newUser: User = {
        id: values.email,
        role: 'employee',
        hourlyRates: [{ rate: values.hourlyRate || 0, effectiveDate: values.startDate }],
        ...values,
      }
      setUsers(prev => [...prev, newUser]);
    }
    handleCloseModal()
  }

  const handleRateChange = (userId: string, rate: number, date: string) => {
    if (!rate || !date) return
    
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId) {
          const newRate = { rate: parseFloat(rate.toString()), effectiveDate: date }
          const otherRates = user.hourlyRates.filter(r => r.effectiveDate !== date)
          const updatedRates = [...otherRates, newRate].sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
          const updatedUser = {...user, hourlyRates: updatedRates};
          
          if (editingUser?.id === userId) {
            setEditingUser(updatedUser);
          }

          return updatedUser;
        }
        return user;
      });
    });
  };
  
  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    
    if (userToDelete.role === 'admin' && adminCount <= 1) {
       toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Não é possível excluir o último administrador do sistema.",
      });
      setUserToDelete(null);
      return;
    }

    const hasPendingLeave = leaveRequests.some(
      (req) => req.employeeId === userToDelete.id && req.status === "Pendente"
    );

    if (hasPendingLeave) {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: `Não é possível excluir "${userToDelete.name}" pois há pedidos de férias pendentes.`,
      });
      setUserToDelete(null);
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    setWorkLogs(prev => prev.filter(log => log.userId !== userToDelete.id));
    setLeaveRequests(prev => prev.filter(req => req.employeeId !== userToDelete.id));
    setPlanning(prevPlanning => {
      const newPlanning = { ...prevPlanning };
      for (const dateKey in newPlanning) {
        if (newPlanning[dateKey][userToDelete.id]) {
          delete newPlanning[dateKey][userToDelete.id];
        }
      }
      return newPlanning;
    });

    toast({
        title: "Usuário Excluído",
        description: `O usuário "${userToDelete.name}" e todos os seus dados associados foram excluídos com sucesso.`,
    });
    setUserToDelete(null);
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
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Gestão de Equipe
            </h1>
            <p className="text-muted-foreground">
              Adicione, edite e visualize os dados dos funcionários.
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Funcionário" : "Adicionar Novo Funcionário"}
                </DialogTitle>
              </DialogHeader>
              <EmployeeForm
                key={editingUser?.id}
                houses={houses}
                editingUser={editingUser}
                onSubmit={handleSave}
                onCancel={handleCloseModal}
                onRateChange={handleRateChange}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Funcionários</CardTitle>
            <CardDescription>
              Lista de todos os funcionários registrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Valor/Hora Atual</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {currentRates ? (
                        `€ ${(currentRates[user.id] ?? 0).toFixed(2)}`
                      ) : (
                        <Skeleton className="h-5 w-20" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setUserToDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o usuário "{userToDelete?.name}" e todos os seus dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
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

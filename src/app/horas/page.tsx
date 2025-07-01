
"use client"

import { useState, useMemo } from "react"
import { useData, formatMinutesToHours } from "@/contexts/data-context"
import { format } from "date-fns";
import type { WorkLog, User } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeLogForm, TimeLogFormValues } from "@/components/time-log-form"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useHasPermission } from "@/hooks/use-has-permission"

export default function HorasPage() {
  const isAuthorized = useRequireAuth('Registrar Horas Próprias');
  const canApprove = useHasPermission('Aprovar Horas da Equipe');

  const { workLogs, setWorkLogs, users } = useData()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null)
  const [logToDelete, setLogToDelete] = useState<WorkLog | null>(null)

  const employeeMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, User>)
  }, [users])

  const filteredLogs = useMemo(() => {
    return workLogs
      .filter((log) => {
        if (statusFilter === "todos") return true
        return log.status.toLowerCase() === statusFilter
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [workLogs, statusFilter])

  const handleOpenModal = (log: WorkLog | null = null) => {
    setEditingLog(log)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLog(null)
  }

  const handleSaveLog = (values: TimeLogFormValues, totalMinutes: number) => {
    const details = {
        start: values.start,
        end: values.end,
        vertrekker: values.vertrekker,
        blijver: values.blijver,
        extraBed: values.extraBed,
        extraUur: values.extraUur,
    }

    if (editingLog) {
      setWorkLogs(prev => prev.map(log => log.id === editingLog.id ? { ...log, ...values, totalMinutes, details, status: 'Pendente' } : log));
    } else {
      const newLog: WorkLog = {
        id: Math.max(0, ...workLogs.map(l => l.id)) + 1,
        userId: values.userId,
        date: values.date,
        totalMinutes,
        status: 'Pendente',
        details,
      }
      setWorkLogs(prev => [...prev, newLog]);
    }
    handleCloseModal()
  }

  const handleSetStatus = (
    logId: number,
    status: "Aprovado" | "Rejeitado"
  ) => {
    setWorkLogs((prevLogs) =>
      prevLogs.map((log) => (log.id === logId ? { ...log, status } : log))
    )
  }
  
  const handleDeleteConfirm = () => {
    if (logToDelete) {
      setWorkLogs((prevLogs) => prevLogs.filter((log) => log.id !== logToDelete.id));
      setLogToDelete(null);
      toast({
        title: "Registro Excluído",
        description: "O registro de ponto foi excluído com sucesso.",
      });
    }
  };

  const getStatusVariant = (status: WorkLog["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Aprovado":
        return "default"
      case "Pendente":
        return "secondary"
      case "Rejeitado":
        return "destructive"
      default:
        return "outline"
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
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              Controle de Horas
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as horas trabalhadas pela equipe.
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLog ? "Editar Registro" : "Adicionar Novo Registro"}
                </DialogTitle>
              </DialogHeader>
              <TimeLogForm
                  key={editingLog?.id}
                  users={users}
                  editingLog={editingLog}
                  onSubmit={handleSaveLog}
                  onCancel={handleCloseModal}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline">Registros Recentes</CardTitle>
                <CardDescription>
                  Listagem dos registros de ponto dos funcionários.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {employeeMap[log.userId]?.name || log.userId}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.date + "T00:00:00"), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {employeeMap[log.userId]?.jobType === 'byTime'
                            ? `${log.details.start || '--:--'} - ${log.details.end || '--:--'}`
                            : `V:${log.details.vertrekker || 0} | B:${log.details.blijver || 0} | EB:${log.details.extraBed || 0} | EU:${log.details.extraUur || 0}`}
                        </TableCell>
                        <TableCell>{formatMinutesToHours(log.totalMinutes)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.status === "Pendente" && canApprove && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:text-primary"
                                onClick={() => handleSetStatus(log.id, "Aprovado")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="sr-only">Aprovar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleSetStatus(log.id, "Rejeitado")}
                              >
                                <ThumbsDown className="h-4 w-4" />
                                <span className="sr-only">Rejeitar</span>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(log)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setLogToDelete(log)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente este registro de ponto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogToDelete(null)}>Cancelar</AlertDialogCancel>
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

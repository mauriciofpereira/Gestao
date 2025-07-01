
"use client"

import { useState, useMemo } from "react"
import { useData } from "@/contexts/data-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ThumbsUp, ThumbsDown, CalendarDays, Loader2 } from "lucide-react"
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
import type { LeaveRequest, User } from "@/lib/types"
import { LeaveRequestForm, LeaveRequestFormValues } from "@/components/leave-request-form"
import { differenceInBusinessDays, format } from "date-fns"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useHasPermission } from "@/hooks/use-has-permission"

export default function FeriasPage() {
  const isAuthorized = useRequireAuth('Solicitar Férias Próprias');
  const canManage = useHasPermission('Gerenciar Pedidos de Férias');

  const { users, leaveRequests, setLeaveRequests } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const employeeMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, User>)
  }, [users])

  const sortedRequests = useMemo(() => {
    return [...leaveRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [leaveRequests])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSaveRequest = (values: LeaveRequestFormValues) => {
    const { employeeId, dateRange, reason } = values

    if (!dateRange.from || !dateRange.to) {
        return;
    }

    const daysRequested = differenceInBusinessDays(dateRange.to, dateRange.from) + 1;

    const newRequest: LeaveRequest = {
        id: Math.max(0, ...leaveRequests.map(r => r.id)) + 1,
        employeeId,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        daysRequested,
        reason: reason || "",
        status: 'Pendente',
        createdAt: new Date().toISOString().split('T')[0],
    }

    setLeaveRequests(prev => [newRequest, ...prev]);
    handleCloseModal();
  }

  const handleSetStatus = (requestId: number, status: "Aprovado" | "Rejeitado") => {
    setLeaveRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status } : req)
    )
  }

  const getStatusVariant = (status: LeaveRequest["status"]): "default" | "secondary" | "destructive" | "outline" => {
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString + 'T00:00:00'), 'dd/MM/yy');
  }

  if (!isAuthorized) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Pedidos de Férias</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de férias dos funcionários.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleOpenModal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Solicitar Férias
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Nova Solicitação de Férias</DialogTitle>
                </DialogHeader>
                <LeaveRequestForm 
                    users={users.filter(u => u.role === 'employee')}
                    onSubmit={handleSaveRequest}
                    onCancel={handleCloseModal}
                />
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Solicitações Registradas</CardTitle>
          <CardDescription>
            Aprove ou rejeite os pedidos de férias pendentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedRequests.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <CalendarDays className="h-8 w-8" />
                            <span>Nenhum pedido de férias encontrado.</span>
                          </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    sortedRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{employeeMap[req.employeeId]?.name || 'Desconhecido'}</TableCell>
                            <TableCell>{formatDate(req.startDate)} - {formatDate(req.endDate)}</TableCell>
                            <TableCell>{req.daysRequested}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(req.status)}>
                                    {req.status}
                                </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell className="text-right">
                                  {req.status === 'Pendente' && (
                                      <>
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-primary hover:text-primary"
                                              onClick={() => handleSetStatus(req.id, 'Aprovado')}
                                          >
                                              <ThumbsUp className="h-4 w-4" />
                                              <span className="sr-only">Aprovar</span>
                                          </Button>
                                           <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => handleSetStatus(req.id, 'Rejeitado')}
                                          >
                                              <ThumbsDown className="h-4 w-4" />
                                              <span className="sr-only">Rejeitar</span>
                                          </Button>
                                      </>
                                  )}
                              </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

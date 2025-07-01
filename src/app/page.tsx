
"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useData, formatMinutesToHours } from "@/contexts/data-context"
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Car, Clock, Euro, Users, CalendarDays, Loader2 } from "lucide-react"
import type { Announcement } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequireAuth } from "@/hooks/use-require-auth"

const chartConfig = {
  hours: {
    label: "Horas",
    color: "hsl(var(--primary))",
  },
}

interface DashboardData {
  monthlyRevenue: number;
  activeEmployees: number;
  newEmployeesThisMonth: number;
  monthlyHours: number;
  availableVehicles: number;
  totalVehicles: number;
  pendingLeaveRequests: number;
  chartData: { day: string; date: string; hours: number; }[];
  recentAnnouncements: Announcement[];
}

export default function Dashboard() {
  const isAuthorized = useRequireAuth('Visualizar Dashboard');
  const { users, workLogs, vehicles, revenue, announcements, leaveRequests } = useData();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const employeeList = users.filter(u => u.role === 'employee');

    const currentMonthRevenue = revenue
      .filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.getMonth() === currentMonth && revDate.getFullYear() === currentYear;
      })
      .reduce((sum, rev) => sum + rev.amount, 0);

    const newEmployeesCount = employeeList.filter(emp => {
      const startDate = new Date(emp.startDate);
      return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    }).length;
    
    const currentMonthHours = workLogs
      .filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
      })
      .reduce((sum, log) => sum + log.totalMinutes, 0);

    const availableVehiclesCount = vehicles.filter(v => v.status === "Disponível").length;

    const pendingRequestsCount = leaveRequests.filter(r => r.status === 'Pendente').length;

    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const totalMinutes = workLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.totalMinutes, 0);
        
      return {
        day: format(date, 'E', { locale: ptBR }),
        date: dateStr,
        hours: totalMinutes > 0 ? parseFloat((totalMinutes / 60).toFixed(1)) : 0,
      };
    });

    const sortedAnnouncements = [...announcements]
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    setData({
      monthlyRevenue: currentMonthRevenue,
      activeEmployees: employeeList.length,
      newEmployeesThisMonth: newEmployeesCount,
      monthlyHours: currentMonthHours,
      availableVehicles: availableVehiclesCount,
      totalVehicles: vehicles.length,
      pendingLeaveRequests: pendingRequestsCount,
      chartData: dailyData,
      recentAnnouncements: sortedAnnouncements
    });
  }, [users, workLogs, vehicles, revenue, announcements, leaveRequests]);


  const getPriorityVariant = (priority: Announcement['priority']): BadgeProps['variant'] => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityText = (priority: Announcement['priority']): string => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      default: return 'Baixa';
    }
  }

  if (!isAuthorized || !data) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral da sua empresa.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-5 w-2/3" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-7 w-1/2 mb-2" />
                           <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader><CardTitle><Skeleton className="h-7 w-3/4" /></CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle><Skeleton className="h-7 w-1/2" /></CardTitle>
                      <CardDescription><Skeleton className="h-5 w-full" /></CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[240px]">
                         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua empresa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Receita do Mês</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Acumulado para o mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">+{data.newEmployeesThisMonth} novos este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Horas Registradas (Mês)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutesToHours(data.monthlyHours)}</div>
            <p className="text-xs text-muted-foreground">Total de horas aprovadas/pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Frota Disponível</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.availableVehicles} / {data.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Veículos disponíveis para uso</p>
          </CardContent>
        </Card>
         <Link href="/ferias" className="block">
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-headline">Férias Pendentes</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">Pedidos aguardando aprovação</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Horas Trabalhadas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={data.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    formatter={(value, name, props) => (
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{props.payload.day}</span>
                        <span className="text-xs">{new Date(props.payload.date + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                        <span className="mt-2">{`Horas: ${value}h`}</span>
                      </div>
                    )}
                  />}
                />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Comunicados Recentes</CardTitle>
            <CardDescription>
              Fique por dentro das últimas novidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-3 pb-3">
             {data.recentAnnouncements.length > 0 ? (
                data.recentAnnouncements.map((item) => (
                  <Link href="/comunicados" key={item.id} className="block p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold leading-tight truncate">{item.title}</p>
                        <Badge variant={getPriorityVariant(item.priority)} className="capitalize flex-shrink-0">
                          {getPriorityText(item.priority)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.content.substring(0, 100)}...
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum comunicado recente.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

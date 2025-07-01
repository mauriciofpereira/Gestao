
"use client"

import { useState, useMemo, useEffect } from "react"
import { useData, getRateForDate } from "@/contexts/data-context";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Download, Euro, Users, Wallet, Check, Loader2 } from "lucide-react"
import { RevenueForm, RevenueFormValues } from "@/components/revenue-form";
import { ExpenseForm, ExpenseFormValues } from "@/components/expense-form";
import type { Revenue, MiscExpense, User } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-require-auth";


const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
  },
  despesas: {
    label: "Despesas",
    color: "hsl(var(--destructive))",
  },
}

interface FinancialData {
    firstDayOfMonth: Date;
    lastDayOfMonth: Date;
    payroll: { id: string, name: string, salary: number, jobType: User['jobType'] }[];
    totalPayroll: number;
    totalHouseRent: number;
    totalMiscExpenses: number;
    totalExpenses: number;
    totalRevenue: number;
}


export default function FinanceiroPage() {
  const isAuthorized = useRequireAuth('Acessar Módulo Financeiro');
  const { users, houses, workLogs, revenue, setRevenue, miscExpenses, setMiscExpenses } = useData();
  
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  
  const employeeList = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthWorkLogs = workLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= firstDayOfMonth && logDate <= lastDayOfMonth;
    });

    const payroll = employeeList.map(user => {
      const userLogs = monthWorkLogs.filter(log => log.userId === user.id);
      const totalMinutes = userLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
      const hourlyRate = getRateForDate(user, today);
      const salary = (totalMinutes / 60) * hourlyRate;

      return {
          id: user.id,
          name: user.name,
          salary,
          jobType: user.jobType,
      }
    });

    const totalPayroll = payroll.reduce((sum, emp) => sum + emp.salary, 0);
    const totalHouseRent = houses.reduce((sum, house) => sum + house.rent, 0);
    const totalMiscExpenses = miscExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = totalPayroll + totalHouseRent + totalMiscExpenses;
    const totalRevenue = revenue.reduce((sum, rev) => sum + rev.amount, 0);
    
    setFinancialData({
        firstDayOfMonth,
        lastDayOfMonth,
        payroll,
        totalPayroll,
        totalHouseRent,
        totalMiscExpenses,
        totalExpenses,
        totalRevenue
    });
  }, [workLogs, employeeList, houses, miscExpenses, revenue]);


  const chartData = financialData ? [
    { month: "Mês Atual", receitas: financialData.totalRevenue, despesas: financialData.totalExpenses },
  ] : [];

  const cashFlowItems = useMemo(() => {
    if (!financialData) return [];

    const today = new Date();
    const lastDayOfMonthStr = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const allItems: any[] = [
      ...revenue.map(r => ({ ...r, type: 'Receita', source: 'revenue' as const })),
      ...miscExpenses.map(e => ({ ...e, type: 'Despesa', source: 'expense' as const })),
    ];
    
    financialData.payroll.forEach(p => {
        if (p.salary > 0) {
            allItems.push({
                id: `payroll-${p.id}`,
                date: lastDayOfMonthStr,
                description: `Folha de Pagamento - ${p.name}`,
                amount: p.salary,
                type: 'Despesa',
                status: 'Calculado',
                source: 'payroll' as const,
                category: 'Folha de Pagamento',
            });
        }
    });

    houses.forEach(h => {
        if (h.rent > 0) {
            allItems.push({
                id: `rent-${h.id}`,
                date: lastDayOfMonthStr,
                description: `Aluguel - ${h.name}`,
                amount: h.rent,
                type: 'Despesa',
                status: 'Calculado',
                source: 'rent' as const,
                category: 'Aluguel',
            });
        }
    });


    return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenue, miscExpenses, houses, financialData]);

  const totalAPagar = useMemo(() => {
    if (!financialData) return 0;
    const pendingMisc = miscExpenses
        .filter(e => e.status === 'Pendente')
        .reduce((sum, e) => sum + e.amount, 0);
    return pendingMisc + financialData.totalPayroll + financialData.totalHouseRent;
  }, [miscExpenses, financialData]);

  const totalAReceber = useMemo(() =>
      revenue
          .filter(r => r.status === 'Pendente')
          .reduce((sum, r) => sum + r.amount, 0),
  [revenue]);

  const handleToggleStatus = (id: string, source: 'revenue' | 'expense') => {
    if (source === 'revenue') {
        setRevenue(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Pendente' ? 'Recebido' : 'Pendente' } : r));
    } else {
        setMiscExpenses(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Pendente' ? 'Pago' : 'Pendente' } : e));
    }
  };

  const getStatusVariant = (status: string) => {
      switch (status) {
          case 'Recebido':
          case 'Pago':
              return 'default';
          case 'Pendente':
              return 'secondary';
          case 'Calculado':
              return 'outline';
          default:
              return 'outline';
      }
  };


  const handleSaveRevenue = (values: RevenueFormValues) => {
    const newRevenue: Revenue = {
      id: `REV${Date.now()}`,
      status: 'Pendente',
      ...values,
    };
    setRevenue(prev => [...prev, newRevenue]);
    setIsRevenueModalOpen(false);
  }

  const handleSaveExpense = (values: ExpenseFormValues) => {
    const newExpense: MiscExpense = {
       id: `EXP${Date.now()}`,
       status: 'Pendente',
       ...values,
    }
    setMiscExpenses(prev => [...prev, newExpense]);
    setIsExpenseModalOpen(false);
  }

  const handleExport = () => {
    if (!financialData) return;

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Por favor, habilite pop-ups para gerar o relatório.");
        return;
    }

    const monthName = new Date(financialData.firstDayOfMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const reportHTML = `
        <!DOCTYPE html>
        <html lang="pt-br" class="dark">
        <head>
            <meta charset="UTF-8" />
            <title>Relatório Financeiro - ${monthName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                @media print {
                    body { background-color: white !important; color: black !important; }
                    .printable-bg-primary { background-color: #4ade80 !important; }
                    .printable-bg-destructive { background-color: #f87171 !important; }
                    .printable-text-primary { color: #16a34a !important; }
                    .printable-text-destructive { color: #dc2626 !important; }
                    .print-bg-gray-800 { background-color: #f3f4f6 !important; }
                    .print-border-gray-700 { border-color: #d1d5db !important; }
                }
            </style>
        </head>
        <body class="bg-gray-900 text-gray-100 p-8">
            <div class="max-w-4xl mx-auto">
                <header class="mb-8 text-center">
                    <h1 class="text-3xl font-bold">ERP Paralelo Esclarecido</h1>
                    <h2 class="text-xl font-semibold text-gray-300">Relatório Financeiro</h2>
                    <p class="text-gray-400">Período: ${monthName}</p>
                </header>
                
                <section class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-800 print-bg-gray-800 p-4 rounded-lg text-center">
                        <h3 class="text-sm font-medium text-gray-400">Receita Total</h3>
                        <p class="text-2xl font-bold text-green-400 printable-text-primary">€ ${financialData.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div class="bg-gray-800 print-bg-gray-800 p-4 rounded-lg text-center">
                        <h3 class="text-sm font-medium text-gray-400">Despesa Total</h3>
                        <p class="text-2xl font-bold text-red-400 printable-text-destructive">€ ${financialData.totalExpenses.toFixed(2)}</p>
                    </div>
                    <div class="bg-gray-800 print-bg-gray-800 p-4 rounded-lg text-center">
                        <h3 class="text-sm font-medium text-gray-400">Balanço Final</h3>
                        <p class="text-2xl font-bold ${financialData.totalRevenue - financialData.totalExpenses >= 0 ? 'text-green-400 printable-text-primary' : 'text-red-400 printable-text-destructive'}">€ ${(financialData.totalRevenue - financialData.totalExpenses).toFixed(2)}</p>
                    </div>
                </section>

                <section class="mb-8">
                    <h3 class="text-lg font-semibold mb-2 border-b border-gray-700 print-border-gray-700 pb-1">Folha de Pagamento (€ ${financialData.totalPayroll.toFixed(2)})</h3>
                    <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-700 print-border-gray-700"><th class="py-2">Funcionário</th><th class="py-2 text-right">Salário Bruto</th></tr></thead>
                        <tbody>
                            ${financialData.payroll.map(p => `<tr><td class="py-2 border-b border-gray-800 print-border-gray-700">${p.name}</td><td class="py-2 border-b border-gray-800 print-border-gray-700 text-right">€ ${p.salary.toFixed(2)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </section>
                
                <section class="mb-8">
                    <h3 class="text-lg font-semibold mb-2 border-b border-gray-700 print-border-gray-700 pb-1">Despesas de Casas (€ ${financialData.totalHouseRent.toFixed(2)})</h3>
                    <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-700 print-border-gray-700"><th class="py-2">Casa</th><th class="py-2 text-right">Aluguel</th></tr></thead>
                        <tbody>
                            ${houses.map(h => `<tr><td class="py-2 border-b border-gray-800 print-border-gray-700">${h.name}</td><td class="py-2 border-b border-gray-800 print-border-gray-700 text-right">€ ${h.rent.toFixed(2)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </section>
                
                 <section>
                    <h3 class="text-lg font-semibold mb-2 border-b border-gray-700 print-border-gray-700 pb-1">Despesas Diversas (€ ${financialData.totalMiscExpenses.toFixed(2)})</h3>
                     <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-700 print-border-gray-700"><th class="py-2">Descrição</th><th class="py-2">Categoria</th><th class="py-2 text-right">Valor</th></tr></thead>
                        <tbody>
                            ${miscExpenses.map(e => `<tr><td class="py-2 border-b border-gray-800 print-border-gray-700">${e.description}</td><td class="py-2 border-b border-gray-800 print-border-gray-700">${e.category}</td><td class="py-2 border-b border-gray-800 print-border-gray-700 text-right">€ ${e.amount.toFixed(2)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </section>
            </div>
        </body>
        </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    setTimeout(() => {
         reportWindow.print();
    }, 500);
  };

  if (!isAuthorized || !financialData) {
      return (
          <div className="flex flex-col gap-8">
               <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Gestão Financeira</h1>
                <p className="text-muted-foreground">Controle suas receitas, despesas e folha de pagamento.</p>
              </div>
              <div className="space-y-6">
                  <Skeleton className="h-10 w-full max-w-2xl" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                  </div>
                   <Skeleton className="h-[400px] rounded-lg" />
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Gestão Financeira</h1>
        <p className="text-muted-foreground">Controle suas receitas, despesas e folha de pagamento.</p>
      </div>

      <Tabs defaultValue="overview">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="whitespace-nowrap">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="caixa">Caixa</TabsTrigger>
              <TabsTrigger value="revenue">Receitas</TabsTrigger>
              <TabsTrigger value="expenses">Despesas Diversas</TabsTrigger>
              <TabsTrigger value="house_expenses">Despesas de Casas</TabsTrigger>
              <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
            </TabsList>
          </div>
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto flex-shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-headline">Receita do Mês</CardTitle>
                <Euro className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ {financialData.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Baseado nos registros atuais</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-headline">Despesas do Mês</CardTitle>
                 <Euro className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ {financialData.totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Folha + Casas + Diversas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-headline">Folha de Pagamento</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ {financialData.totalPayroll.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Calculado para {employeeList.length} funcionários</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Balanço Mensal</CardTitle>
                <CardDescription>
                    Comparativo visual entre as receitas e despesas totais do mês.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={() => ""}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `€${Number(value) / 1000}k`}
                        />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value, name) => (
                                    <div className="flex items-center">
                                        <div className={`h-2 w-2 rounded-full mr-2`} style={{backgroundColor: name === 'receitas' ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))'}} />
                                        <span className="capitalize">{name}: €{Number(value).toFixed(2)}</span>
                                    </div>
                                )}
                            />}
                        />
                        <Bar dataKey="receitas" fill="var(--color-receitas)" radius={8} />
                        <Bar dataKey="despesas" fill="var(--color-despesas)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="caixa" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium font-headline text-destructive">Total a Pagar</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">€ {totalAPagar.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Folha, aluguéis e despesas pendentes</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium font-headline text-primary">Total a Receber</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">€ {totalAReceber.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Soma de receitas pendentes</p>
                  </CardContent>
              </Card>
          </div>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Extrato de Contas</CardTitle>
                  <CardDescription>Lista de todas as receitas e despesas. Marque as contas pendentes como pagas/recebidas.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {cashFlowItems.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center">
                                      Nenhum lançamento encontrado.
                                  </TableCell>
                              </TableRow>
                          )}
                          {cashFlowItems.map((item) => (
                              <TableRow key={`${item.source}-${item.id}`}>
                                  <TableCell>{new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                                  <TableCell className="font-medium">{item.description}</TableCell>
                                  <TableCell>
                                      <Badge variant={item.type === 'Receita' ? 'outline' : 'secondary'}>{item.type}</Badge>
                                  </TableCell>
                                  <TableCell>
                                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                  </TableCell>
                                  <TableCell className={cn(
                                      "text-right font-semibold",
                                      item.type === 'Receita' ? 'text-primary' : 'text-destructive'
                                  )}>
                                      {item.type === 'Receita' ? '+' : '-'} € {item.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                      {item.status === 'Pendente' && (
                                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(item.id, item.source)}>
                                              <Check className="h-4 w-4 text-primary" />
                                              <span className="sr-only">Marcar como Pago/Recebido</span>
                                          </Button>
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader className="flex-row flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">Receitas</CardTitle>
                <CardDescription>Entradas de caixa registradas.</CardDescription>
              </div>
               <Dialog open={isRevenueModalOpen} onOpenChange={setIsRevenueModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Receita</DialogTitle>
                    </DialogHeader>
                    <RevenueForm onSubmit={handleSaveRevenue} onCancel={() => setIsRevenueModalOpen(false)} />
                  </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(item.status)}>{item.status}</Badge></TableCell>
                      <TableCell className="text-right text-primary font-semibold">€ {item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-headline">Despesas Diversas</CardTitle>
                  <CardDescription>Saídas de caixa registradas (materiais, etc.).</CardDescription>
                </div>
                <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                      </DialogHeader>
                      <ExpenseForm onSubmit={handleSaveExpense} onCancel={() => setIsExpenseModalOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {miscExpenses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(item.status)}>{item.status}</Badge></TableCell>
                      <TableCell className="text-right text-destructive font-semibold">€ {item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="house_expenses" className="mt-6">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Despesas de Casas</CardTitle>
                <CardDescription>Despesas fixas de aluguel das moradias da equipe.</CardDescription>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Casa</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead className="text-right">Aluguel Mensal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {houses.map(house => (
                            <TableRow key={house.id}>
                                <TableCell className="font-medium">{house.name}</TableCell>
                                <TableCell>{house.address}</TableCell>
                                <TableCell className="text-right text-destructive font-semibold">€ {house.rent.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-muted/20">
                            <TableCell colSpan={2}>Total de Aluguéis</TableCell>
                            <TableCell className="text-right text-destructive font-semibold">€ {financialData.totalHouseRent.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="payroll" className="mt-6">
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Folha de Pagamento</CardTitle>
                <CardDescription>Calculado com base nas horas registradas e no valor/hora de cada funcionário.</CardDescription>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Tipo de Contrato</TableHead>
                            <TableHead className="text-right">Salário Mensal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {financialData.payroll.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-muted-foreground">{p.jobType === 'byTime' ? 'Por Hora' : 'Por Produção'}</TableCell>
                                <TableCell className="text-right font-semibold">€ {p.salary.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-muted/20">
                            <TableCell colSpan={2}>Total da Folha</TableCell>
                            <TableCell className="text-right text-destructive font-semibold">€ {financialData.totalPayroll.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

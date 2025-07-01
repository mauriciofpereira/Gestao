
"use client"

import { useState, useMemo, useEffect } from "react";
import { useData, getRateForDate, formatMinutesToHours } from "@/contexts/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function RelatoriosPage() {
  const isAuthorized = useRequireAuth('Gerar Relatórios');
  const { users, workLogs } = useData();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Set initial dates on client-side to avoid hydration mismatch
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDayOfMonth);
    setEndDate(lastDayOfMonth);
  }, []);


  const employeeList = useMemo(() => users.filter(u => u.role === 'employee'), [users]);

  const reportData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const filteredLogs = workLogs.filter(log => log.date >= startDate && log.date <= endDate && log.status === 'Aprovado');

    const userTotals = employeeList.map(user => {
      const userLogs = filteredLogs.filter(log => log.userId === user.id);
      const totalMinutes = userLogs.reduce((sum, log) => sum + log.totalMinutes, 0);
      const hourlyRate = getRateForDate(user, new Date(endDate)); // Use rate at the end of the period
      const salary = (totalMinutes / 60) * hourlyRate;
      
      return {
        userId: user.id,
        name: user.name,
        totalMinutes,
        hourlyRate,
        salary,
      };
    }).filter(item => item.totalMinutes > 0); // Only include employees with hours in the period

    return userTotals;
  }, [startDate, endDate, workLogs, employeeList]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, item) => {
        acc.totalMinutes += item.totalMinutes;
        acc.totalSalary += item.salary;
        return acc;
    }, { totalMinutes: 0, totalSalary: 0 });
  }, [reportData]);

  const handleExport = () => {
    if (!startDate || !endDate) return;

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Por favor, habilite pop-ups para gerar o relatório.");
        return;
    }

    const reportHTML = `
        <!DOCTYPE html>
        <html lang="pt-br" class="dark">
        <head>
            <meta charset="UTF-8" />
            <title>Relatório de Horas e Salários</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                @media print {
                    body { background-color: white !important; color: black !important; }
                    .printable-bg-primary { background-color: #4ade80 !important; }
                    .printable-bg-destructive { background-color: #f87171 !important; }
                    .printable-text-primary { color: #16a34a !important; }
                    .print-bg-gray-800 { background-color: #f3f4f6 !important; }
                    .print-border-gray-700 { border-color: #d1d5db !important; }
                }
            </style>
        </head>
        <body class="bg-gray-900 text-gray-100 p-8">
            <div class="max-w-4xl mx-auto">
                <header class="mb-8 text-center">
                    <h1 class="text-3xl font-bold">ERP Paralelo Esclarecido</h1>
                    <h2 class="text-xl font-semibold text-gray-300">Relatório de Horas e Salários</h2>
                    <p class="text-gray-400">Período: ${new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                </header>
                
                <section>
                    <table class="w-full text-left">
                        <thead>
                           <tr class="border-b border-gray-700 print-border-gray-700">
                                <th class="py-2">Funcionário</th>
                                <th class="py-2 text-center">Total de Horas</th>
                                <th class="py-2 text-center">Valor/Hora (€)</th>
                                <th class="py-2 text-right">Salário Bruto (€)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.map(item => `
                                <tr>
                                    <td class="py-2 border-b border-gray-800 print-border-gray-700">${item.name}</td>
                                    <td class="py-2 border-b border-gray-800 print-border-gray-700 text-center">${formatMinutesToHours(item.totalMinutes)}</td>
                                    <td class="py-2 border-b border-gray-800 print-border-gray-700 text-center">${item.hourlyRate.toFixed(2)}</td>
                                    <td class="py-2 border-b border-gray-800 print-border-gray-700 text-right">${item.salary.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="font-bold border-t-2 border-gray-600 print-border-gray-700">
                                <td class="py-3">Total</td>
                                <td class="py-3 text-center">${formatMinutesToHours(totals.totalMinutes)}</td>
                                <td class="py-3 text-center">--</td>
                                <td class="py-3 text-right">${totals.totalSalary.toFixed(2)}</td>
                            </tr>
                        </tfoot>
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

  if (!isAuthorized) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios sobre horas e pagamentos da equipe.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Relatório de Horas e Salários</CardTitle>
                <CardDescription>
                    Selecione um período para gerar um relatório detalhado por funcionário. Apenas horas aprovadas são incluídas.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={reportData.length === 0} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
            </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg border">
            <div className="grid gap-2 w-full sm:w-auto">
                <Label htmlFor="start-date" className="text-sm font-medium">Data de Início</Label>
                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
             <div className="grid gap-2 w-full sm:w-auto">
                <Label htmlFor="end-date" className="text-sm font-medium">Data Final</Label>
                <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead className="text-center">Total de Horas</TableHead>
                    <TableHead className="text-center">Valor/Hora (€)</TableHead>
                    <TableHead className="text-right">Salário Bruto (Estimado)</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {reportData.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8" />
                        <span>{!startDate || !endDate ? "Carregando..." : "Nenhum dado encontrado para o período selecionado."}</span>
                        </div>
                    </TableCell>
                    </TableRow>
                ) : (
                    reportData.map(item => (
                    <TableRow key={item.userId}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center font-mono">{formatMinutesToHours(item.totalMinutes)}</TableCell>
                        <TableCell className="text-center font-mono">€ {item.hourlyRate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold font-mono text-primary">€ {item.salary.toFixed(2)}</TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
                {reportData.length > 0 && (
                    <TableFooter>
                        <TableRow className="font-bold text-base">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-center font-mono">{formatMinutesToHours(totals.totalMinutes)}</TableCell>
                            <TableCell className="text-center font-mono">--</TableCell>
                            <TableCell className="text-right font-mono text-primary">€ {totals.totalSalary.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useHasPermission } from "@/hooks/use-has-permission"

export default function EscalaPage() {
    const isAuthorized = useRequireAuth('Gerenciar Escala de Trabalho');
    const canManageSites = useHasPermission('Gerenciar Locais, Casas e Frota');

    const { users, worksites, planning, setPlanning } = useData();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    useEffect(() => {
        if(!selectedDate) {
            setSelectedDate(new Date());
        }
    }, [selectedDate]);

    const employeeList = users.filter(u => u.role === 'employee');
    const activeWorksites = worksites.filter(site => site.isActive);

    const handlePlanChange = (employeeId: string, location: string) => {
        if (!selectedDate) return;
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        
        setPlanning(prev => {
            const newPlanning = { ...prev };
            if (!newPlanning[dateKey]) {
                newPlanning[dateKey] = {};
            }
            if (location === "nao_definido") {
                 delete newPlanning[dateKey][employeeId];
            } else {
                newPlanning[dateKey][employeeId] = location;
            }
            return newPlanning;
        });
    };

    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const displayDate = selectedDate ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Nenhuma data selecionada"

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
                    <h1 className="text-3xl font-headline font-bold tracking-tight">Escala de Trabalho</h1>
                    <p className="text-muted-foreground">Visualize e gerencie a escala diária de trabalho da equipe.</p>
                </div>
                {canManageSites && (
                  <Button asChild>
                    <Link href="/locais">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Gerir Locais
                    </Link>
                  </Button>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-[380px_1fr]">
                <div className="lg:col-span-1">
                   <Card>
                        <CardContent className="p-0">
                           <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="w-full"
                                locale={ptBR}
                                disabled={(date) => date < new Date("1900-01-01")}
                           />
                        </CardContent>
                   </Card>
                </div>
                <div className="lg:col-span-2 xl:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Escala para {displayDate}</CardTitle>
                            <CardDescription>Selecione um local de trabalho para cada funcionário.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Funcionário</TableHead>
                                        <TableHead>Local de Trabalho / Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employeeList.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                            Nenhum funcionário encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {employeeList.map(emp => {
                                        const location = planning[formattedDate]?.[emp.id] || 'nao_definido';
                                        return (
                                            <TableRow key={emp.id}>
                                                <TableCell className="font-medium">{emp.name}</TableCell>
                                                <TableCell>
                                                    <Select value={location} onValueChange={(value) => handlePlanChange(emp.id, value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Definir escala..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="nao_definido">Não Definido</SelectItem>
                                                            <SelectItem value="Folga">Folga</SelectItem>
                                                            {activeWorksites.map(site => (
                                                                <SelectItem key={site.id} value={site.name}>
                                                                    {site.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

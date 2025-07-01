
"use client"

import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { Loader2 } from "lucide-react"

export default function PermissoesPage() {
  const isAuthorized = useRequireAuth('Gerenciar Permissões de Usuários');
  const { users, setUsers, permissions, setPermissions } = useData()
  const { toast } = useToast()

  // In a real app, this would come from an auth context.
  const adminCount = users.filter(u => u.role === 'admin').length

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    const userToChange = users.find(u => u.id === userId);

    if (!userToChange) return;

    // Prevent the last admin from being demoted
    if (userToChange.role === 'admin' && adminCount <= 1 && newRole === 'employee') {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Não é possível remover a permissão do último administrador.",
      })
      return
    }

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    )

    toast({
      title: "Permissão Alterada",
      description: `O usuário "${userToChange.name}" agora é um ${newRole === 'admin' ? 'Administrador' : 'Funcionário'}.`,
    })
  }
  
  const handlePermissionChange = (featureName: string, role: 'employee' | 'admin', isChecked: boolean) => {
    setPermissions(prevPermissions => 
        prevPermissions.map(perm => 
            perm.feature === featureName ? { ...perm, [role]: isChecked } : perm
        )
    );
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
        <h1 className="text-3xl font-headline font-bold tracking-tight">Gerenciamento de Permissões</h1>
        <p className="text-muted-foreground">Defina os níveis de acesso de cada usuário no sistema.</p>
      </div>

       <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-lg">
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="roles">Detalhes das Funções</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Usuários do Sistema</CardTitle>
              <CardDescription>
                Atribua as permissões de 'Administrador' ou 'Funcionário' para cada usuário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[180px]">Permissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole: User['role']) => handleRoleChange(user.id, newRole)}
                          disabled={user.role === 'admin' && adminCount <= 1}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Definir permissão..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="employee">Funcionário</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="roles">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Matriz de Permissões</CardTitle>
                    <CardDescription>
                        O que cada função pode fazer no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Funcionalidade</TableHead>
                                <TableHead className="w-[50%]">Descrição</TableHead>
                                <TableHead className="text-center w-[12.5%]">Funcionário</TableHead>
                                <TableHead className="text-center w-[12.5%]">Administrador</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((perm) => (
                                <TableRow key={perm.feature}>
                                    <TableCell className="font-medium">{perm.feature}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{perm.description}</TableCell>
                                    <TableCell className="text-center">
                                       <Switch
                                            checked={perm.employee}
                                            onCheckedChange={(isChecked) => handlePermissionChange(perm.feature, 'employee', isChecked)}
                                            aria-label={`Permissão para Funcionário: ${perm.feature}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={perm.admin}
                                            onCheckedChange={(isChecked) => handlePermissionChange(perm.feature, 'admin', isChecked)}
                                            aria-label={`Permissão para Administrador: ${perm.feature}`}
                                            disabled={perm.feature === 'Gerenciar Permissões de Usuários'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

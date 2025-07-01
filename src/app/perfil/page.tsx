
"use client"

import { useData } from "@/contexts/data-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useRequireAuth } from "@/hooks/use-require-auth"

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
})

const passwordFormSchema = z.object({
  password: z.string().min(6, { message: "A nova senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function PerfilPage() {
  const isAuthorized = useRequireAuth('Editar Próprio Perfil');
  const { currentUser, setUsers } = useData()
  const { toast } = useToast()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (currentUser) {
        profileForm.reset({
            name: currentUser.name || ""
        })
    }
  }, [currentUser, profileForm])

  function onProfileSubmit(data: ProfileFormValues) {
    if (!currentUser) return;
    setUsers(users => users.map(u => u.id === currentUser.id ? { ...u, ...data } : u))
    toast({
      title: "Perfil Atualizado",
      description: "Seu nome foi atualizado com sucesso.",
    })
  }

  function onPasswordSubmit(data: PasswordFormValues) {
    if (!currentUser) return;
    setUsers(users => users.map(u => u.id === currentUser.id ? { ...u, password: data.password } : u))
    toast({
      title: "Senha Alterada",
      description: "Sua senha foi alterada com sucesso.",
    })
    passwordForm.reset();
  }
  
  if (!isAuthorized || !currentUser) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e de segurança.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                     <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src="https://placehold.co/100x100.png" alt={currentUser.name} data-ai-hint="person portrait" />
                        <AvatarFallback className="text-3xl">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline">{currentUser.name}</CardTitle>
                    <CardDescription>{currentUser.email}</CardDescription>
                </CardHeader>
            </Card>
        </div>
        <div className="md:col-span-2 flex flex-col gap-8">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Informações Pessoais</CardTitle>
                <CardDescription>Atualize seu nome de exibição.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
                </Form>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Segurança</CardTitle>
                <CardDescription>Altere sua senha de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <div className="flex justify-end">
                        <Button type="submit">Alterar Senha</Button>
                    </div>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

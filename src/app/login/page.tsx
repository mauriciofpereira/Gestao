
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { users, setCurrentUser } = useData()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate network delay for better UX
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password)

      if (user) {
        setCurrentUser(user)
        toast({
          title: "Login bem-sucedido!",
          description: `Bem-vindo(a) de volta, ${user.name}.`,
        })
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: "Falha no Login",
          description: "Email ou senha incorretos. Por favor, tente novamente.",
        })
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <h1 className="text-2xl font-headline font-bold text-foreground">ERP Paralelo Esclarecido</h1>
            </div>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Acesse a plataforma com suas credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@erpparalelo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

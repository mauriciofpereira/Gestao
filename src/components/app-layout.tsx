
"use client"

import { usePathname, useRouter } from 'next/navigation'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar'
import { SidebarNav } from './sidebar-nav'
import { Header } from './header'
import { LogOut, Settings, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import Link from 'next/link'
import { useData } from '@/contexts/data-context'
import { useState, useEffect } from 'react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setCurrentUser } = useData()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (isClient && !currentUser && pathname !== '/login') {
      router.push('/login')
    }
  }, [isClient, currentUser, pathname, router])


  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || ''
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  if (pathname === '/login') {
    return <>{children}</>
  }
  
  if (!isClient || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const userDisplaySkeleton = (
    <Button variant="ghost" disabled className="w-full justify-start items-center p-2 h-auto text-left">
      <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full mr-2">
        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted animate-pulse"></span>
      </span>
      <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
      </div>
    </Button>
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <h1 className="text-lg font-headline font-bold text-foreground">ERP Paralelo Esclarecido</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {!isClient ? (
            userDisplaySkeleton
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center p-2 h-auto text-left">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarImage src="https://placehold.co/100x100.png" alt={currentUser.name} data-ai-hint="person portrait" />
                    <AvatarFallback>
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-semibold">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/perfil">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

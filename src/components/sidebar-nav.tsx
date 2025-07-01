
'use client'

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Clock,
  DollarSign,
  Megaphone,
  Users,
  Building2,
  Home,
  Car,
  FileText,
  CalendarDays,
  CalendarCheck,
  User,
  KeyRound,
} from 'lucide-react'
import Link from 'next/link'
import { useHasPermission } from '@/hooks/use-has-permission'

const allLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, feature: 'Visualizar Dashboard' },
  { href: '/escala', label: 'Escala de Trabalho', icon: CalendarCheck, feature: 'Gerenciar Escala de Trabalho' },
  { href: '/horas', label: 'Controle de Horas', icon: Clock, feature: 'Registrar Horas Próprias' },
  { href: '/ferias', label: 'Pedidos de Férias', icon: CalendarDays, feature: 'Solicitar Férias Próprias' },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign, feature: 'Acessar Módulo Financeiro' },
  { href: '/relatorios', label: 'Relatórios', icon: FileText, feature: 'Gerar Relatórios' },
  { href: '/comunicados', label: 'Comunicação', icon: Megaphone, feature: 'Ver Comunicados' },
  { href: '/equipe', label: 'Equipe', icon: Users, feature: 'Gerenciar Equipe (CRUD)' },
  { href: '/locais', label: 'Locais de Trabalho', icon: Building2, feature: 'Gerenciar Locais, Casas e Frota' },
  { href: '/casas', label: 'Casas', icon: Home, feature: 'Gerenciar Locais, Casas e Frota' },
  { href: '/frota', label: 'Frota', icon: Car, feature: 'Gerenciar Locais, Casas e Frota' },
  { href: '/perfil', label: 'Meu Perfil', icon: User, feature: 'Editar Próprio Perfil' },
  { href: '/permissoes', label: 'Permissões', icon: KeyRound, feature: 'Gerenciar Permissões de Usuários' },
]

export function SidebarNav() {
  const pathname = usePathname()
  
  // Custom hook to check permission for a feature
  const useLinkPermission = (feature: string) => useHasPermission(feature);

  // Filter links based on user permissions
  const links = allLinks.filter(link => useLinkPermission(link.feature));

  return (
    <SidebarMenu className="p-2">
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href}>
            <SidebarMenuButton
              isActive={pathname === link.href}
              tooltip={link.label}
              className="font-medium"
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

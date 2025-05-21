'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { 
  Home, 
  Users, 
  Settings, 
  CreditCard, 
  Calendar, 
  Building, 
  FileText,
  QrCode 
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home
  },
  {
    title: 'Usuários',
    href: '/admin/usuarios',
    icon: Users
  },
  {
    title: 'Espaços',
    href: '/admin/espacos',
    icon: Building
  },
  {
    title: 'Reservas',
    href: '/admin/reservas',
    icon: Calendar
  },
  {
    title: 'Pagamentos',
    href: '/admin/gerenciar-pagamentos',
    icon: CreditCard
  },
  {
    title: 'Dashboard OpenPix',
    href: '/admin/dashboard-openpix',
    icon: QrCode
  },
  {
    title: 'Webhooks OpenPix',
    href: '/admin/webhooks-openpix',
    icon: FileText
  },
  {
    title: 'Relatórios',
    href: '/admin/relatorios',
    icon: FileText
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings
  }
]

export function AdminNav() {
  const pathname = usePathname()
  
  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800",
              pathname === item.href ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

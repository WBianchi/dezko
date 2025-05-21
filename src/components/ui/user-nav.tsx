'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, User, CreditCard, LogOut, Building2, Shield } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface UserNavProps {
  userType: 'admin' | 'espaco' | 'usuario'
}

export function UserNav({ userType }: UserNavProps) {
  const getUserInfo = () => {
    switch (userType) {
      case 'admin':
        return {
          name: 'Administrador',
          email: 'admin@dezko.com.br',
          role: 'Super Admin',
          icon: Shield
        }
      case 'espaco':
        return {
          name: 'Espaço Coworking',
          email: 'espaco@dezko.com.br',
          role: 'Gestor de Espaço',
          icon: Building2
        }
      default:
        return {
          name: 'João Silva',
          email: 'joao@email.com',
          role: 'Usuário',
          icon: User
        }
    }
  }

  const userInfo = getUserInfo()
  const RoleIcon = userInfo.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt={userInfo.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {userInfo.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name}</p>
            <p className="text-xs leading-none text-gray-500">{userInfo.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Pagamentos</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500 focus:text-red-500 focus:bg-red-50"
          onClick={() => signOut({ redirect: true })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

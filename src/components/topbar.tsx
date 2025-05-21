'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Notifications } from '@/components/ui/notifications'
import { UserNav } from '@/components/ui/user-nav'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { LogOut, Settings, Shield, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface TopbarProps {
  userType: 'admin' | 'espaco' | 'usuario'
}

export function Topbar({ userType }: TopbarProps) {
  const { data: session } = useSession()
  const role = session?.user?.role?.toLowerCase() || userType

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <header className="fixed top-0 w-full h-16 border-b bg-white dark:bg-gray-950 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
        <Link href="/" className="mr-6 flex-none">
          <Image 
            src="/logo.png" 
            alt="Dezxko" 
            width={100} 
            height={40} 
            className="object-contain" 
          />
        </Link>   
        </div>
        
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-blue-50 dark:hover:bg-blue-900"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <ThemeToggle />
          <Notifications />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={`/dashboard/${role}/perfil`}>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" /> Perfil
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/${role}/configuracoes`}>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/${role}/seguranca`}>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" /> Segurança
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

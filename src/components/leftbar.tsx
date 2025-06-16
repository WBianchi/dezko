'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  BarChart3,
  MessageSquare,
  Star,
  FileText,
  Shield,
  LogOut,
  Receipt,
  Store,
  Wallet,
  ArrowLeftRight,
  File,
  Tags,
  BookOpen,
  FolderTree,
  ChevronRight,
  Menu,
  Sparkles,
  Package,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSession } from 'next-auth/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface LeftbarProps {
  userType: 'admin' | 'espaco' | 'usuario'
}

interface MenuItem {
  title: string
  href: string
  icon: any
  badge?: number | string
  badgeColor?: string
  submenu?: { title: string, href: string }[]
}

const adminMenuItems: MenuItem[] = [
  {
    title: 'Visão Geral',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  
  {
    title: 'Espaços',
    href: '/dashboard/admin/espacos',
    icon: Building2,
  },
  {
    title: 'Reservas',
    href: '/dashboard/admin/reservas',
    icon: Calendar,
    badge: 'Novo',
    badgeColor: 'blue',
  },
  {
    title: 'Pagamentos',
    href: '/dashboard/admin/pagamentos',
    icon: CreditCard,
    badge: 3,
    badgeColor: 'emerald',
  },
  {
    title: 'Assinaturas',
    href: '/dashboard/admin/assinaturas',
    icon: Receipt,
    badge: 'Novo',
    badgeColor: 'purple',
  },
  {
    title: 'Planos',
    href: '/dashboard/admin/planos',
    icon: Package,
    badge: 3,
    badgeColor: 'emerald',
  },
  {
    title: 'Relatórios',
    href: '/dashboard/admin/relatorios',
    icon: BarChart3,
  },
  {
    title: 'Avaliações',
    href: '/dashboard/admin/avaliacoes',
    icon: Star,
  },

  {
    title: 'Splits',
    href: '/dashboard/admin/split',
    icon: ArrowLeftRight,
  },
  {
    title: 'Blog',
    href: '/dashboard/admin/blog',
    icon: BookOpen,
  },
  {
    title: 'Tags',
    href: '/dashboard/admin/tags',
    icon: Tags,
  },
  {
    title: 'Páginas',
    href: '/dashboard/admin/paginas',
    icon: File,
  },

  {
    title: 'Usuários',
    href: '/dashboard/admin/usuarios',
    icon: Users,
  },

  {
    title: 'Categorias',
    href: '/dashboard/admin/categorias',
    icon: FolderTree,
  },
  
  {
    title: 'Configurações',
    href: '/dashboard/admin/configuracoes',
    icon: Settings,
  },
]

const espacoMenuItems: MenuItem[] = [
  {
    title: 'Visão Geral',
    href: '/dashboard/espaco',
    icon: LayoutDashboard,
  },
  {
    title: 'Espaços',
    href: '/dashboard/espaco/agenda',
    icon: Calendar,
  },
  {
    title: 'Reservas',
    href: '/dashboard/espaco/reservas',
    icon: FileText,
  },
  {
    title: 'Pagamentos',
    href: '/dashboard/espaco/pagamentos',
    icon: CreditCard,
  },


  {
    title: 'Meu plano',
    href: '/dashboard/espaco/meu-plano',
    icon: Sparkles,
    badge: 'Ativo',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-amber-600',
  },
  {
    title: 'Avaliações',
    href: '/dashboard/espaco/avaliacoes',
    icon: Star,
  },
  {
    title: 'Mensagens',
    href: '/dashboard/espaco/mensagens',
    icon: MessageSquare,
  },
  {
    title: 'Configurações',
    href: '/dashboard/espaco/configuracoes',
    icon: Settings,
  },
  {
    title: 'Config. Pagamentos',
    href: '/dashboard/espaco/config-pagamentos',
    icon: ArrowLeftRight,
    badge: 'Novo',
    badgeColor: 'bg-gradient-to-r from-blue-400 to-blue-600',
  },
]

const usuarioMenuItems: MenuItem[] = [
  {
    title: 'Visão Geral',
    href: '/dashboard/usuario',
    icon: LayoutDashboard,
  },
  {
    title: 'Minhas Reservas',
    href: '/dashboard/usuario/reservas',
    icon: Calendar,
  },
  {
    title: 'Pagamentos',
    href: '/dashboard/usuario/pagamentos',
    icon: CreditCard,
  },
  {
    title: 'Mensagens',
    href: '/dashboard/usuario/mensagens',
    icon: MessageSquare,
    badge: 5,
    badgeColor: 'red',
  },
  {
    title: 'Avaliações',
    href: '/dashboard/usuario/avaliacoes',
    icon: Star,
  },
 
]

export function Leftbar({ userType }: LeftbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [menuHovered, setMenuHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Verificar no carregamento inicial
    checkMobile()
    
    // Adicionar event listener para mudanças de tamanho de tela
    window.addEventListener('resize', checkMobile)
    
    // Limpar event listener
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getMenuItems = () => {
    switch (userType) {
      case 'admin':
        return adminMenuItems
      case 'espaco':
        return espacoMenuItems
      default:
        return usuarioMenuItems
    }
  }

  const menuItems = getMenuItems()
  
  // Efeito para expandir a barra ao hover quando colapsada (apenas em desktop)
  useEffect(() => {
    if (!isMobile && collapsed && menuHovered) {
      const timer = setTimeout(() => {
        setCollapsed(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [collapsed, menuHovered, isMobile])

  const sidebarVariants = {
    expanded: {
      width: '16rem',
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: '5rem',
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  const textVariants = {
    expanded: { opacity: 1, x: 0, display: "block", transition: { duration: 0.3, delay: 0.1 } },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: "none" }, transition: { duration: 0.2 } }
  }

  const badgeVariants = {
    expanded: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.2 } },
    collapsed: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
  }

  const profileVariants = {
    expanded: { opacity: 1, height: "auto", transition: { duration: 0.3, delay: 0.2 } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  }

  // Mapeia as cores dos badges
  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500'
      case 'red': return 'bg-red-500'
      case 'green': return 'bg-green-500'
      case 'emerald': return 'bg-emerald-500'
      case 'amber': return 'bg-amber-500'
      case 'purple': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside 
        className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white/80 backdrop-blur-md dark:bg-gray-950/80 flex flex-col overflow-hidden shadow-sm"
        initial="expanded"
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        onMouseEnter={() => !isMobile && setMenuHovered(true)}
        onMouseLeave={() => !isMobile && setMenuHovered(false)}
      >
       

        {/* Menu de navegação */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            <AnimatePresence>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <div key={item.href} className="relative">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center justify-center p-3 rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                            )}
                          >
                            <Icon className={cn("h-5 w-5", isActive ? 'text-blue-600 dark:text-blue-400' : '')} />
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white
                                animate-pulse
                                shadow-sm
                                shadow-blue-200 dark:shadow-blue-900
                                border border-white dark:border-gray-900
                                ">
                                <span className={cn(
                                  'absolute inset-0 rounded-full',
                                  getBadgeColor(item.badgeColor)
                                )}></span>
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                          {item.badge && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded
                              shadow-sm
                              text-white
                              ">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded',
                                getBadgeColor(item.badgeColor)
                              )}>{item.badge}</span>
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-all duration-200',
                            isActive
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              'flex items-center justify-center h-8 w-8 rounded-lg',
                              isActive 
                                ? 'bg-blue-100 dark:bg-blue-900/50'
                                : 'bg-gray-100 dark:bg-gray-800'
                            )}>
                              <Icon className={cn("h-5 w-5", isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400')} />
                            </div>
                            <motion.span variants={textVariants}>{item.title}</motion.span>
                          </div>
                          
                          {item.badge && (
                            <motion.span 
                              className={cn(
                                'px-1.5 py-0.5 rounded text-xs font-medium text-white',
                                getBadgeColor(item.badgeColor)
                              )}
                              variants={badgeVariants}
                              layout
                            >
                              {item.badge}
                            </motion.span>
                          )}
                          
                          {item.submenu && (
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform",
                              activeSubmenu === item.href ? 'rotate-90' : ''
                            )} />
                          )}
                        </Link>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </AnimatePresence>
          </nav>
        </div>

        {/* Botão de sair */}
        <div className={cn(
          "px-4 pb-6", 
          collapsed ? "flex justify-center" : ""
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg h-12 w-12 shadow-md"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Sair
              </TooltipContent>
            </Tooltip>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3 shadow-md"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}

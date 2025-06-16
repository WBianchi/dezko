'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MegaMenu } from '@/components/mega-menu'
import { 
  Bell, 
  Briefcase, 
  Building2, 
  Calendar,
  Camera, 
  ChevronDown, 
  Coffee, 
  CreditCard,
  Grid, 
  Laptop,
  Loader2, 
  Lock, 
  LogOut,
  Mail, 
  MapPin, 
  Moon, 
  PartyPopper, 
  Phone, 
  Presentation, 
  Search, 
  Sparkles, 
  Star, 
  Sun, 
  User, 
  Users,
  X,
  MapPinIcon
} from "lucide-react"
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useTheme } from 'next-themes'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { cn } from '@/lib/utils'
import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileSidebar } from "@/components/profile-sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const departamentos = [
  {
    titulo: 'Corporativo',
    icon: Building2,
    descricao: 'Espaços profissionais para sua empresa',
    destaque: true,
    items: [
      { 
        nome: 'Escritórios Privativos', 
        link: '/espacos?categoria=escritorios-privativos',
        descricao: 'Ambientes exclusivos e personalizáveis',
        icon: Lock
      },
      { 
        nome: 'Salas de Reunião', 
        link: '/espacos?categoria=salas-de-reuniao',
        descricao: 'Espaços equipados para encontros produtivos',
        icon: Users
      },
      { 
        nome: 'Coworking', 
        link: '/espacos?categoria=coworking',
        descricao: 'Ambiente compartilhado e colaborativo',
        icon: Coffee
      },
    ]
  },
  {
    titulo: 'Eventos',
    icon: PartyPopper,
    descricao: 'Locais perfeitos para seus eventos',
    destaque: true,
    items: [
      { 
        nome: 'Auditórios', 
        link: '/espacos?categoria=auditorios',
        descricao: 'Ideais para palestras e apresentações',
        icon: Presentation
      },
      { 
        nome: 'Salas de Treinamento', 
        link: '/espacos?categoria=salas-de-treinamento',
        descricao: 'Equipadas para workshops e cursos',
        icon: Users
      },
      { 
        nome: 'Espaços para Eventos', 
        link: '/espacos?categoria=espacos-para-eventos',
        descricao: 'Versáteis para diferentes ocasiões',
        icon: Sparkles
      },
    ]
  },
  {
    titulo: 'Estúdios',
    icon: Camera,
    descricao: 'Espaços para produções criativas',
    destaque: true,
    items: [
      { 
        nome: 'Estúdio Fotográfico', 
        link: '/espacos?categoria=estudio-fotografico',
        descricao: 'Equipado para ensaios profissionais',
        icon: Camera
      },
      { 
        nome: 'Estúdio de Gravação', 
        link: '/espacos?categoria=estudio-de-gravacao',
        descricao: 'Para podcasts e vídeos',
        icon: Presentation
      },
      { 
        nome: 'Estúdio Multimídia', 
        link: '/espacos?categoria=estudio-multimidia',
        descricao: 'Versátil para diferentes produções',
        icon: Star
      },
    ]
  },
  {
    titulo: 'Serviços',
    icon: Briefcase,
    descricao: 'Soluções complementares',
    destaque: false,
    items: [
      { 
        nome: 'Endereço Fiscal', 
        link: '/espacos?categoria=endereco-fiscal',
        descricao: 'Endereço comercial para sua empresa',
        icon: MapPin
      },
      { 
        nome: 'Recepção Virtual', 
        link: '/espacos?categoria=recepcao-virtual',
        descricao: 'Atendimento profissional remoto',
        icon: Phone
      },
      { 
        nome: 'Gestão de Correspondências', 
        link: '/espacos?categoria=gestao-de-correspondencias',
        descricao: 'Recebimento e gestão de suas correspondências',
        icon: Mail
      },
    ]
  }
]

// Interface para os resultados de busca
interface SearchResult {
  id: string;
  nome: string;
  descricao: string;
  cidade: string;
  estado: string;
  fotoPrincipal?: string;
  categoria?: {
    nome: string;
  };
  preco?: number;
}

export function Nav() {
  const [isSearching, setIsSearching] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const { setTheme, theme } = useTheme()
  const [selectedDep, setSelectedDep] = useState(departamentos[0])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false)
  
  // Estados para a busca
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Estado da sessão do usuário
  const { data: session, status } = useSession()
  
  // Estado para informações de agenda/plano
  const [disponibilidade, setDisponibilidade] = useState<{
    limiteAgendas: number;
    totalDisponivel: number;
    temAgendaDisponivel: boolean;
  } | null>(null)
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(false)
  
  // Buscar informações da disponibilidade de agendas se o usuário estiver logado como espaço
  useEffect(() => {
    async function buscarDisponibilidade() {
      if (status !== 'authenticated' || session?.user?.role !== 'espaco') return
      
      setCarregandoDisponibilidade(true)
      try {
        const response = await fetch('/api/espacos/disponibilidade')
        
        if (response.ok) {
          const data = await response.json()
          setDisponibilidade(data)
        }
      } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error)
      } finally {
        setCarregandoDisponibilidade(false)
      }
    }
    
    buscarDisponibilidade()
  }, [status, session])

  // Função para fazer debounce da busca
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return function(...args: any[]) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
      }, delay)
    }
  }

  // Função para buscar espaços
  const handleSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) return
      
      setLoading(true)
      try {
        console.log('Buscando espaços com o termo:', term)
        const response = await fetch(`/api/espacos/search?term=${encodeURIComponent(term)}`)
        
        // Tratando a resposta mesmo com erro para ver o conteúdo
        const data = await response.json()
        
        if (!response.ok) {
          console.error('Erro na API:', data)
          throw new Error(data.error || 'Erro ao buscar espaços')
        }
        
        console.log('Resultados encontrados:', data.length)
        setSearchResults(data)
      } catch (error) {
        console.error('Erro na busca:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchRef])
  
  return (
    <>
      {status === 'authenticated' && session && (
        <ProfileSidebar 
          mobile={true} 
          open={profileSidebarOpen}
          onOpenChange={setProfileSidebarOpen}
        />
      )}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 max-w-[1400px]">
        {/* Logo */}
        <Link href="/" className="flex-none">
          <Image 
            src="/logo.png" 
            alt="Dezko" 
            width={100} 
            height={40} 
            className="object-contain" 
          />
        </Link>

        {/* Botão do menu mobile */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Grid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </Button>

        {/* Searchbar - escondido no mobile */}
        <div className="relative hidden md:block w-[320px] flex-none" ref={searchRef}>
          <Input
            ref={inputRef}
            placeholder="Procurar espaços..."
            className="pl-10 pr-4 h-10 rounded-full bg-muted"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (e.target.value.length >= 2) {
                setShowResults(true)
                handleSearch(e.target.value)
              } else {
                setShowResults(false)
                setSearchResults([])
              }
            }}
            onFocus={() => {
              setIsSearching(true)
              if (searchTerm.length >= 2) {
                setShowResults(true)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute inset-y-0 left-3 flex items-center">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          {/* Modal de resultados da busca */}
          <AnimatePresence>
            {showResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[110%] left-0 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
                  <h3 className="text-sm font-medium">Resultados para "{searchTerm}"</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowResults(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-16 w-16 rounded-md" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[70%]" />
                            <Skeleton className="h-3 w-[90%]" />
                            <Skeleton className="h-3 w-[40%]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <Link 
                          href={`/espacos/${result.id}`} 
                          key={result.id}
                          onClick={() => setShowResults(false)}
                          className="flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                        >
                          <div className="h-16 w-16 relative rounded-md overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            {result.fotoPrincipal ? (
                              <Image 
                                src={result.fotoPrincipal} 
                                alt={result.nome}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Building2 className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {result.nome}
                              </h4>
                              {result.preco && (
                                <Badge variant="outline" className="ml-auto">
                                  A partir de R$ {result.preco}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                              {result.descricao || 'Sem descrição'}
                            </p>
                            
                            <div className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {result.cidade}, {result.estado}
                              </span>
                              
                              {result.categoria && (
                                <Badge variant="secondary" className="ml-2 py-0 h-4 text-[10px]">
                                  {result.categoria.nome}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum resultado encontrado</p>
                      <p className="text-xs text-gray-400 mt-1">Tente buscar por outro termo</p>
                    </div>
                  )}
                </div>
                
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => {
                      window.location.href = `/espacos?q=${encodeURIComponent(searchTerm)}`
                      setShowResults(false)
                    }}
                  >
                    Ver todos os resultados
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="group">
                Espaços
                <Grid className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[80vh] pt-12">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl text-center">Conheça Nossos Departamentos</SheetTitle>
                <p className="text-muted-foreground text-center">
                  Descubra o espaço perfeito para o seu negócio
                </p>
              </SheetHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mt-8 px-4">
                {departamentos.map((dep) => {
                  const Icon = dep.icon
                  return (
                    <motion.div 
                      key={dep.titulo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${dep.destaque ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-lg">{dep.titulo}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{dep.descricao}</p>
                      <ul className="space-y-4">
                        {dep.items.map((item) => (
                          <motion.li 
                            key={item.nome}
                            whileHover={{ x: 4 }}
                            className="group"
                          >
                            <Link 
                              href={item.link}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted"
                            >
                              {item.icon && <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />}
                              <div>
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {item.nome}
                                </span>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {item.descricao}
                                </p>
                              </div>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>

        
          
          <Link href="/sobre-nos">
            <Button variant="ghost">Sobre Nós</Button>
          </Link>
       
        </nav>

        {/* MegaMenu */}
        <MegaMenu open={showCategorias} onOpenChange={setShowCategorias} />

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center gap-4">
       

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {status === 'authenticated' && session ? (
            <Button 
              variant="outline" 
              className="gap-2 px-3 border-2 border-blue-200 dark:border-blue-800"
              onClick={() => setProfileSidebarOpen(true)}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs dark:bg-blue-900 dark:text-blue-300">
                  {session.user.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs">
                <span className="font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{session.user.role}</span>
              </div>
            </Button>
          ) : (
            <Link href="/entrar">
              <Button className="gap-2">
                <User className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
          <Link href="/dashboard/espaco">
            <Button className="gap-2">
              <Building2 className="h-4 w-4" />
              Anunciar 
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Image 
                src="/logo.png" 
                alt="Dezko" 
                width={100} 
                height={40} 
                className="object-contain" 
              />
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
          
          {/* Busca Mobile */}
          <div className="mb-6">
            <div className="relative">
              <Input
                placeholder="Procurar espaços..."
                className="pl-10 pr-4 h-10 bg-muted/80 border-blue-100 dark:border-blue-900/30 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-500/60" />
              </div>
            </div>
            <Button 
              className="w-full mt-2" 
              variant="default"
              onClick={() => {
                if (searchTerm.trim()) {
                  window.location.href = `/espacos?q=${encodeURIComponent(searchTerm)}`
                  setIsMobileMenuOpen(false)
                }
              }}
            >
              Buscar
            </Button>
          </div>
          
          {/* Links do Menu Mobile */}
          <div className="space-y-2">
            <h3 className="font-medium text-xs uppercase text-blue-600 dark:text-blue-400 mb-3 mt-4">Menu Principal</h3>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" 
              onClick={() => {
                setShowCategorias(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                <Grid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">Espaços</span>
            </Button>
            <Link href="/sobre-nos" onClick={() => setIsMobileMenuOpen(false)} className="block">
              <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Sobre Nós</span>
              </Button>
            </Link>
            <Link href="/central-de-ajuda" onClick={() => setIsMobileMenuOpen(false)} className="block">
              <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Contato</span>
              </Button>
            </Link>
            {status === 'authenticated' && session ? (
              <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Meu Perfil</span>
                </Button>
              </Link>
            ) : (
              <Link href="/entrar" onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Entrar</span>
                </Button>
              </Link>
            )}
            {status === 'authenticated' && session ? (
              <Link href={session.user.role === 'espaco' ? '/dashboard/espaco/agenda' : '/minhas-reservas'} onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">{session.user.role === 'espaco' ? 'Minhas Agendas' : 'Minhas Reservas'}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/entrar" onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Minhas Reservas</span>
                </Button>
              </Link>
            )}
            {status === 'authenticated' && session ? (
              <Link href={`/dashboard/${session.user.role}`} onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Dashboard</span>
                </Button>
              </Link>
            ) : (
              <Link href="/entrar" onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start h-10 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md mr-3">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Dashboard</span>
                </Button>
              </Link>
            )}
          </div>
          
          {/* Categorias no Menu Mobile */}
          <div className="mt-8">
            <h3 className="font-medium text-xs uppercase text-blue-600 dark:text-blue-400 mb-3">Categorias</h3>
            <div className="space-y-2">
              {departamentos.map((dep) => {
                const Icon = dep.icon
                return (
                  <div key={dep.titulo} className="mb-5">
                    <div className="flex items-center gap-2 mb-2 px-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded">
                        {Icon && <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">{dep.titulo}</h4>
                    </div>
                    <div className="ml-9 space-y-1">
                      {dep.items.map((item) => (
                        <Link 
                          key={item.nome} 
                          href={item.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block"
                        >
                          <Button variant="ghost" className="w-full justify-start h-9 py-2 px-3 text-sm rounded hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                            {item.nome}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Tema e Logout */}
          <div className="absolute bottom-8 w-full pr-8">
            <div className="flex justify-between items-center gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-blue-100 dark:border-blue-900/40 bg-white/80 dark:bg-gray-900/80 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="font-medium">Tema Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="font-medium">Tema Escuro</span>
                  </>
                )}
              </Button>
              {status === 'authenticated' && session ? (
                <div className="flex gap-2 flex-1">
                  <Button 
                    variant="outline" 
                    className="h-10 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 shadow-sm flex-1"
                    onClick={() => {
                      setProfileSidebarOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="font-medium">Meu Perfil</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/entrar" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                  <Button 
                    variant="default" 
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
                  >
                    <span className="font-medium">Entrar</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
    </>
  );
}

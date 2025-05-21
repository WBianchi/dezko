'use client'

import React from "react"
import { motion } from "framer-motion"
import { Building2, Camera, Briefcase, PartyPopper, Users, VideoIcon, Star, Coffee, CalendarDays, Wallet, Presentation } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const categorias = [
  {
    titulo: 'Escritórios',
    icon: Building2,
    descricao: 'Espaços profissionais',
    subcategorias: [
      { nome: 'Escritórios Privativos', descricao: 'Espaços exclusivos e personalizados para sua empresa', destaque: true },
      { nome: 'Coworking', descricao: 'Ambiente compartilhado com infraestrutura completa', destaque: false },
      { nome: 'Escritório Virtual', descricao: 'Endereço comercial e serviços administrativos', destaque: false },
      { nome: 'Hot Desks', descricao: 'Estações flexíveis por hora ou diária', destaque: false },
    ]
  },
  {
    titulo: 'Eventos',
    icon: PartyPopper,
    descricao: 'Para ocasiões especiais',
    subcategorias: [
      { nome: 'Auditórios', descricao: 'Ideal para palestras e apresentações corporativas', destaque: true },
      { nome: 'Salas de Treinamento', descricao: 'Equipadas para workshops e cursos', destaque: false },
      { nome: 'Espaços para Festas', descricao: 'Ambientes para eventos e confraternizações', destaque: false },
      { nome: 'Espaços ao Ar Livre', descricao: 'Opções externas para eventos diferenciados', destaque: false },
    ]
  },
  {
    titulo: 'Reuniões',
    icon: Users,
    descricao: 'Encontros produtivos',
    subcategorias: [
      { nome: 'Salas de Reunião', descricao: 'Ambientes profissionais para encontros de negócios', destaque: true },
      { nome: 'Salas de Videoconferência', descricao: 'Tecnologia avançada para reuniões híbridas', destaque: false },
      { nome: 'Salas VIP', descricao: 'Ambientes executivos com privacidade e conforto', destaque: false },
      { nome: 'Salas de Brainstorming', descricao: 'Espaços criativos para geração de ideias', destaque: false },
    ]
  },
  {
    titulo: 'Estúdios',
    icon: Camera,
    descricao: 'Criação de conteúdo',
    subcategorias: [
      { nome: 'Estúdio Fotográfico', descricao: 'Equipado com iluminação profissional e backgrounds', destaque: true },
      { nome: 'Estúdio de Gravação', descricao: 'Tratamento acústico para podcasts e vídeos', destaque: false },
      { nome: 'Estúdio Multimídia', descricao: 'Versátil para diferentes formatos de produção', destaque: false },
      { nome: 'Estúdio de Live', descricao: 'Preparado para transmissões ao vivo de alta qualidade', destaque: false },
    ]
  },
  {
    titulo: 'Tecnologia',
    icon: Presentation,
    descricao: 'Recursos avançados',
    subcategorias: [
      { nome: 'Lab de Inovação', descricao: 'Espaço equipado para desenvolvimento de projetos', destaque: true },
      { nome: 'Sala de Realidade Virtual', descricao: 'Ambiente imersivo para experiências e treinamentos', destaque: false },
      { nome: 'Espaço Maker', descricao: 'Ferramentas e recursos para prototipagem', destaque: false },
    ]
  },
  {
    titulo: 'Área de Lazer',
    icon: Coffee,
    descricao: 'Relaxamento e networking',
    subcategorias: [
      { nome: 'Lounge', descricao: 'Áreas confortáveis para descanso e socialização', destaque: true },
      { nome: 'Espaço Gourmet', descricao: 'Cozinha equipada para reuniões informais e coffee breaks', destaque: false },
      { nome: 'Espaço Fitness', descricao: 'Academia compacta para momentos de atividade física', destaque: false },
    ]
  }
]

interface MegaMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MegaMenu({ open, onOpenChange }: MegaMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="grid grid-cols-4 h-full">
          {/* Menu Lateral */}
          <div className="col-span-1 border-r border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6 space-y-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Categorias
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Encontre o espaço ideal para você
              </p>
            </div>
            
            {categorias.map((categoria) => {
              const IconComponent = categoria.icon
              return (
                <motion.button
                  key={categoria.titulo}
                  whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="flex items-center gap-3 w-full p-4 rounded-xl hover:shadow-sm transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 transition-colors">
                    {IconComponent && <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {categoria.titulo}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {categoria.descricao}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">{categoria.subcategorias.length}</div>
                </motion.button>
              )
            })}
            
            <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900">
              <motion.button
                whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                className="flex items-center gap-3 w-full p-4 rounded-xl hover:shadow-sm transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Promoções
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Ofertas especiais
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  Novo
                </Badge>
              </motion.button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="col-span-3 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Espaços
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {' '}Disponíveis
                </span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mt-1">
                Encontre o espaço perfeito para suas necessidades, desde escritórios privativos até salas para eventos especiais.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {categorias.flatMap(categoria => 
                categoria.subcategorias.map((sub) => (
                  <Link
                    key={sub.nome}
                    href={`/espacos?categoria=${sub.nome.toLowerCase().replace(/\s/g, '-')}`}
                    className="group"
                    onClick={() => onOpenChange(false)}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      className={`p-6 rounded-xl border bg-white dark:bg-zinc-900 ${sub.destaque ? 'border-blue-300 dark:border-blue-700' : 'border-blue-100 dark:border-blue-900'} hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-950/50 transition-all relative overflow-hidden`}
                    >
                      {/* Efeito de gradiente no canto superior direito */}
                      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-60 ${sub.destaque ? 'bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700' : 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900'}`} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${sub.destaque ? 'bg-blue-100 dark:bg-blue-900' : 'bg-blue-50 dark:bg-blue-950'}`}>
                            {categoria.icon && React.createElement(categoria.icon, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" })}
                          </div>
                          <h3 className="font-medium text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {sub.nome}
                          </h3>
                          {sub.destaque && <Badge className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 border-0">Destaque</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sub.descricao}
                        </p>
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-4 font-medium">
                          Explorar opções
                          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>

            {/* Destaques */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                  Ofertas em Destaque
                </h3>
                <Link 
                  href="/promocoes" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  onClick={() => onOpenChange(false)}
                >
                  Ver todas
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative h-44 rounded-xl overflow-hidden group border border-blue-100 dark:border-blue-900"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
                    <div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                        <CalendarDays className="mr-1 h-3 w-3" /> Tempo limitado
                      </Badge>
                      <h3 className="text-xl font-semibold mt-2">Oferta Especial</h3>
                      <p className="mt-1 text-sm text-white/80 max-w-[90%]">
                        Desconto de 20% em escritórios privativos por tempo limitado
                      </p>
                    </div>
                    <div className="flex items-center text-sm font-medium mt-2">
                      Ver detalhes
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative h-44 rounded-xl overflow-hidden group border border-indigo-100 dark:border-indigo-900"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-800 opacity-90 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
                    <div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                        <VideoIcon className="mr-1 h-3 w-3" /> Novidade
                      </Badge>
                      <h3 className="text-xl font-semibold mt-2">Salas de Vídeo</h3>
                      <p className="mt-1 text-sm text-white/80 max-w-[90%]">
                        Novas salas equipadas com tecnologia para videoconferências
                      </p>
                    </div>
                    <div className="flex items-center text-sm font-medium mt-2">
                      Conhecer agora
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative h-44 rounded-xl overflow-hidden group border border-amber-100 dark:border-amber-900"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-800 opacity-90 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
                    <div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                        <Wallet className="mr-1 h-3 w-3" /> Economia
                      </Badge>
                      <h3 className="text-xl font-semibold mt-2">Planos Mensais</h3>
                      <p className="mt-1 text-sm text-white/80 max-w-[90%]">
                        Economize até 30% com nossos planos de assinatura mensal
                      </p>
                    </div>
                    <div className="flex items-center text-sm font-medium mt-2">
                      Consultar valores
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

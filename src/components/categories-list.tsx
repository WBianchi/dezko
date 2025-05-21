'use client'

import * as LucideIcons from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoriaEspaco {
  id: string
  nome: string
  descricao: string | null
  icone: string | null
  slug: string
}

interface CategoriesListProps {
  categorias: CategoriaEspaco[]
}

export function CategoriesList({ categorias }: CategoriesListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollAmount = 400
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })

    // Atualiza a visibilidade das setas após a rolagem
    setTimeout(() => {
      if (!containerRef.current) return
      setShowLeftArrow(containerRef.current.scrollLeft > 0)
      setShowRightArrow(
        containerRef.current.scrollLeft < 
        containerRef.current.scrollWidth - containerRef.current.clientWidth
      )
    }, 300)
  }

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground max-w-lg">
              Encontre o espaço ideal para suas necessidades, com diversas opções para cada tipo de uso
            </p>
          </div>
        </div>

        <div className="relative group">
          {showLeftArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div 
            ref={containerRef}
            className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 px-4 -mx-4 snap-x snap-mandatory"
          >
            {categorias.map((categoria, index) => {
              // Seleciona o ícone dinamicamente do Lucide ou usa Building2 como fallback
              const IconName = categoria.icone ? (categoria.icone.charAt(0).toUpperCase() + categoria.icone.slice(1)) : 'Building2'
              const Icon = LucideIcons[IconName as keyof typeof LucideIcons] || LucideIcons.Building2

              return (
                <motion.div
                  key={categoria.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-none w-[280px] snap-start"
                >
                  <Link
                    href={`/espacos?categoria=${categoria.slug}`}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all h-full"
                  >
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-medium">{categoria.nome}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {categoria.descricao}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {showRightArrow && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

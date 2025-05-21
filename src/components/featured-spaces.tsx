'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EspacoCard } from './espaco-card'

interface Agenda {
  id: string
  titulo: string
  valorHora?: number | null
  valorTurno?: number | null
  valorDia?: number | null
}

interface Espaco {
  id: string
  nome: string
  descricao: string
  cidade: string
  estado: string
  fotoPrincipal: string
  imagens: string[]
  capacidade: number
  avaliacao: number
  categoriaEspaco: {
    nome: string
  }
  agendas: Agenda[]
}

export function FeaturedSpaces() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/espacos')
      .then(res => res.json())
      .then(data => {
        setEspacos(data)
        setLoading(false)
      })
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340 // card width + gap
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Espaços em Destaque</h2>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="w-80 h-[360px] animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Espaços em Destaque</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full hover:bg-blue-50 hover:text-blue-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full hover:bg-blue-50 hover:text-blue-600"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative -mx-4 px-4">
          <motion.div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {espacos.map((espaco) => (
              <div key={espaco.id} className="flex-none w-80">
                <EspacoCard espaco={espaco} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

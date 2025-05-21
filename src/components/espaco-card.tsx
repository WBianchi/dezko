'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface EspacoCardProps {
  espaco: {
    id: string
    nome: string
    descricao: string
    fotoPrincipal: string
    imagens: string[]
    cidade: string
    estado: string
    capacidade: number
    avaliacao: number
    categoriaEspaco: {
      nome: string
    }
    agendas: {
      valorHora: number | null
      valorTurno: number | null
      valorDia: number | null
    }[]
  }
}

export function EspacoCard({ espaco }: EspacoCardProps) {
  const agenda = espaco.agendas[0] // Pega a primeira agenda como referência

  return (
    <Link href={`/espaco/${encodeURIComponent(espaco.nome.toLowerCase().replace(/ /g, '-'))}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group">
          {/* Imagem Principal */}
          <div className="relative aspect-[16/9]">
            <Image
              src={espaco.fotoPrincipal || (espaco.imagens && espaco.imagens[0]) || '/placeholder-espaco.jpg'}
              alt={espaco.nome}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                {espaco.categoriaEspaco?.nome}
              </Badge>
              {espaco.avaliacao > 0 && (
                <Badge variant="secondary" className="bg-yellow-500/90 text-white backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                  {espaco.avaliacao}
                </Badge>
              )}
            </div>
            
            {/* Preços */}
            {agenda && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 text-white text-sm">
                {agenda.valorHora && (
                  <Badge variant="secondary" className="bg-blue-500/90 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    R$ {agenda.valorHora}/hora
                  </Badge>
                )}
                {agenda.valorTurno && (
                  <Badge variant="secondary" className="bg-blue-500/90 backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    R$ {agenda.valorTurno}/turno
                  </Badge>
                )}
                {agenda.valorDia && (
                  <Badge variant="secondary" className="bg-blue-500/90 backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    R$ {agenda.valorDia}/dia
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <h3 className="font-semibold text-xl mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {espaco.nome}
            </h3>
            
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">
                {espaco.cidade}, {espaco.estado}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {espaco.descricao}
            </p>

            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <Users className="w-4 h-4 mr-1" />
              <span>Até {espaco.capacidade} pessoas</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}

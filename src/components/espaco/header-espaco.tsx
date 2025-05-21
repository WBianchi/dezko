'use client'

import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderEspacoProps {
  fotoCapa: string
  fotoPrincipal: string
  nome: string
  cidade: string
  estado: string
  categoria?: string
  avaliacao?: number
}

export function HeaderEspaco({
  fotoCapa,
  fotoPrincipal,
  nome,
  cidade,
  estado,
  categoria,
  avaliacao
}: HeaderEspacoProps) {
  // Log para debug
  console.log('Dados do cabeçalho:', { fotoCapa, fotoPrincipal, nome })
  
  // Verifica se as fotos são dados base64 ou URLs
  const isBase64 = (str: string) => str.startsWith('data:image')
  
  // Normaliza as URLs das imagens
  const fotoCapaUrl = fotoCapa && typeof fotoCapa === 'string' && fotoCapa.trim() !== '' 
    ? (isBase64(fotoCapa) ? fotoCapa : (fotoCapa.startsWith('/') ? fotoCapa : `/${fotoCapa}`)) 
    : null
    
  const fotoPrincipalUrl = fotoPrincipal && typeof fotoPrincipal === 'string' && fotoPrincipal.trim() !== '' 
    ? (isBase64(fotoPrincipal) ? fotoPrincipal : (fotoPrincipal.startsWith('/') ? fotoPrincipal : `/${fotoPrincipal}`)) 
    : null

  return (
    <div className="relative h-[500px]">
      {/* Foto de Capa */}
      <div className="absolute inset-0">
        {fotoCapaUrl ? (
          <Image
            src={fotoCapaUrl}
            alt="Foto de capa"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="absolute inset-0">
        <div className="container mx-auto h-full px-4">
          <div className="flex items-end h-full pb-12">
            <div className="flex items-end gap-8">
              {/* Foto Principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-48 h-48 rounded-xl overflow-hidden border-4 border-white shadow-xl"
              >
                {fotoPrincipalUrl ? (
                  <Image
                    src={fotoPrincipalUrl}
                    alt={nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800" />
                )}
              </motion.div>

              {/* Informações */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  {categoria && (
                    <span className="text-sm px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      {categoria}
                    </span>
                  )}
                  {avaliacao && avaliacao > 0 && (
                    <span className="flex items-center gap-1 text-sm px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {avaliacao}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">{nome}</h1>
                <div className="flex items-center text-white/80">
                  <MapPin className="w-4 h-4 mr-1" />
                  {cidade}, {estado}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { HeaderEspaco } from "@/components/espaco/header-espaco"
import { TabsEspaco } from "@/components/espaco/tabs-espaco"
import { AgendamentoEspaco } from "@/components/espaco/agendamento-espaco"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Share2 } from "lucide-react"
import { useState } from "react"

interface Espaco {
  id: string
  nome: string
  descricao: string
  fotoCapa: string | null
  fotoPrincipal: string | null
  cidade: string
  estado: string
  categoriaEspaco: {
    id: string
    nome: string
  } | null
  avaliacao: number
  capacidade: number
  horarioAbertura: string
  horarioFechamento: string
  endereco: string
  numero: string
  complemento: string | null
  bairro: string
  cep: string
  adicionais: string[]
  vantagens: string[]
  beneficios: string[]
  galeria: string[]
  agendas: {
    id: string
    titulo: string
    valorHora: number | null
    valorTurno: number | null
    valorDia: number | null
    tipoReserva: string
    turno: string | null
    horaInicio: string | null
    horaFim: string | null
    dataInicio: Date | null
    dataFim: Date | null
  }[]
  avaliacoes: {
    nota: number
    comentario: string
    usuario: {
      nome: string
      avatar: string | null
    }
  }[]
}

interface EspacoViewProps {
  espaco: Espaco
}

export function EspacoView({ espaco }: EspacoViewProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: espaco.nome,
        text: espaco.descricao,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      <main>
        {/* Header com foto de capa, foto principal e informações básicas */}
        <HeaderEspaco
          fotoCapa={espaco.fotoCapa || ""}
          fotoPrincipal={espaco.fotoPrincipal || ""}
          nome={espaco.nome}
          cidade={espaco.cidade || ""}
          estado={espaco.estado || ""}
          categoria={espaco.categoriaEspaco?.nome}
          avaliacao={espaco.avaliacao}
        />

        {/* Ações Rápidas */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {espaco.categoriaEspaco?.nome}
                </Badge>
                {espaco.avaliacao > 0 && (
                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                    ★ {espaco.avaliacao}
                  </Badge>
                )}
                <Badge variant="outline">
                  Até {espaco.capacidade} pessoas
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button 
                  variant={isFavorite ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Favoritado" : "Favoritar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Conteúdo Principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TabsEspaco
                espacoId={espaco.id}
                descricao={espaco.descricao || ""}
                adicionais={espaco.adicionais || []}
                vantagens={espaco.vantagens || []}
                beneficios={espaco.beneficios || []}
                galeria={espaco.galeria || []}
                horarioAbertura={espaco.horarioAbertura || ""}
                horarioFechamento={espaco.horarioFechamento || ""}
                capacidade={espaco.capacidade || 0}
                endereco={espaco.endereco || ""}
                numero={espaco.numero || ""}
                complemento={espaco.complemento}
                bairro={espaco.bairro || ""}
                cidade={espaco.cidade || ""}
                estado={espaco.estado || ""}
                cep={espaco.cep || ""}
                avaliacoes={espaco.avaliacoes}
              />
            </motion.div>

            {/* Coluna da Direita - Agendamento */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="sticky top-24">
                <Card className="p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Agendamento</h2>
                  <AgendamentoEspaco agendas={espaco.agendas} espacoId={espaco.id} />
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

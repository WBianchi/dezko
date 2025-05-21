'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, Clock, Users, Coffee, Wifi, Check, Tv, Phone, Projector, AirVent, Lock, Car } from 'lucide-react'
import { motion } from 'framer-motion'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { AgendamentoEspaco } from '@/components/espaco/agendamento-espaco'

const fotos = [
  { src: '/salas/sala-1.jpg', alt: 'Vista principal da sala' },
  { src: '/salas/sala-2.jpg', alt: 'Área de apresentação' },
  { src: '/salas/sala-3.jpg', alt: 'Mesa de reunião' },
  { src: '/salas/sala-4.jpg', alt: 'Lounge' },
  { src: '/salas/sala-5.jpg', alt: 'Área de café' },
  { src: '/salas/sala-5.jpg', alt: 'Área de café' },
]

const comodidades = [
  { icon: Wifi, text: 'Wi-Fi de alta velocidade' },
  { icon: Coffee, text: 'Café premium e água' },
  { icon: Tv, text: 'Smart TV 75"' },
  { icon: Phone, text: 'Sistema de audioconferência' },
  { icon: Projector, text: 'Projetor 4K' },
  { icon: AirVent, text: 'Ar condicionado' },
  { icon: Lock, text: 'Acesso com senha' },
  { icon: Car, text: 'Estacionamento' },
]

const salasRelacionadas = [
  {
    id: 2,
    titulo: 'Sala Premium Gold',
    local: 'Jardins, São Paulo',
    preco: 'R$ 89/hora',
    imagem: '/salas/sala-7.jpg',
    avaliacao: 4.8,
  },
  {
    id: 3,
    titulo: 'Sala Diamond Plus',
    local: 'Vila Olímpia, São Paulo',
    preco: 'R$ 129/hora',
    imagem: '/salas/sala-8.jpg',
    avaliacao: 4.9,
  },
  {
    id: 4,
    titulo: 'Sala Platinum Elite',
    local: 'Itaim, São Paulo',
    preco: 'R$ 159/hora',
    imagem: '/salas/sala-9.jpg',
    avaliacao: 5.0,
  },
]

const avaliacoes = [
  {
    id: 1,
    nome: 'João Silva',
    foto: '/avatars/avatar-1.jpg',
    data: '10/02/2024',
    nota: 5,
    comentario: 'Espaço incrível! A sala é muito bem equipada e o atendimento foi excepcional. Perfeito para reuniões importantes.',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    foto: '/avatars/avatar-2.jpg',
    data: '08/02/2024',
    nota: 5,
    comentario: 'Ambiente sofisticado e profissional. O café é delicioso e o Wi-Fi é muito rápido. Voltarei mais vezes!',
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    foto: '/avatars/avatar-3.jpg',
    data: '05/02/2024',
    nota: 5,
    comentario: 'Melhor sala de reunião que já utilizei. O sistema de videoconferência é excelente e o ambiente é muito agradável.',
  },
]

export default function SalaPage({ params }: { params: { id: string } }) {
  const [mainPhoto, setMainPhoto] = useState(fotos[0])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-50 pt-24">
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Coluna da Esquerda */}
            <div className="lg:col-span-2 space-y-8">
              {/* Galeria */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-[500px] rounded-2xl overflow-hidden"
                >
                  <Image
                    src={mainPhoto.src}
                    alt={mainPhoto.alt}
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <div className="grid grid-cols-6 gap-4">
                  {fotos.map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => setMainPhoto(foto)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        mainPhoto.src === foto.src ? 'border-blue-500 scale-105' : 'border-transparent hover:border-blue-300'
                      }`}
                    >
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start justify-between"
                >
                  <div>
                    <h1 className="text-4xl font-bold mb-3">Sala Executive Plus</h1>
                    <div className="flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>Pinheiros, São Paulo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Até 12 pessoas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>24/7</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg">4.9</span>
                    <span className="text-gray-600">(128)</span>
                  </div>
                </motion.div>

                {/* Tabs de Informações */}
                <Tabs defaultValue="sobre" className="w-full">
                  <TabsList className="w-full justify-start border-b">
                    <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                    <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sobre" className="mt-6">
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                      <p>
                        Bem-vindo à nossa Sala Executive Plus, um espaço premium projetado para 
                        proporcionar a melhor experiência em reuniões e apresentações corporativas. 
                        Com acabamento sofisticado e tecnologia de ponta, esta sala oferece o ambiente 
                        perfeito para suas reuniões mais importantes.
                      </p>
                      <p>
                        O espaço conta com isolamento acústico profissional, iluminação inteligente 
                        ajustável e um sistema de videoconferência state-of-the-art, garantindo que 
                        suas reuniões híbridas sejam tão eficientes quanto as presenciais.
                      </p>
                      <p>
                        Nossa equipe de suporte está disponível 24/7 para garantir que sua experiência 
                        seja impecável, desde a reserva até o término do seu evento.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="comodidades" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {comodidades.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm"
                        >
                          <item.icon className="w-6 h-6 text-blue-600" />
                          <span className="text-gray-600">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="avaliacoes" className="mt-6">
                    <div className="space-y-6">
                      {avaliacoes.map((avaliacao) => (
                        <motion.div
                          key={avaliacao.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: avaliacao.id * 0.1 }}
                          className="border-b pb-6"
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <Image
                              src={avaliacao.foto}
                              alt={avaliacao.nome}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                            <div>
                              <h4 className="font-semibold">{avaliacao.nome}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array.from({ length: avaliacao.nota }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{avaliacao.data}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600">{avaliacao.comentario}</p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Coluna da Direita - Formulário de Reserva */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AgendamentoEspaco 
                  agendas={[
                    {
                      id: '1',
                      titulo: 'Mesa Individual',
                      valorHora: 25
                    }
                  ]} 
                  espacoId={params.id}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Salas Relacionadas */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-8">Salas Relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {salasRelacionadas.map((sala) => (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sala.id * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={sala.imagem}
                      alt={sala.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{sala.titulo}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">{sala.avaliacao}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{sala.local}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600">{sala.preco}</span>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}

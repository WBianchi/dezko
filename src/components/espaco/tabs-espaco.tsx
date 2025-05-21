'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Star, Users, Send } from "lucide-react"
import { motion } from "framer-motion"
import { GaleriaEspaco } from "./galeria-espaco"

interface Avaliacao {
  id?: string
  nota: number
  comentario: string
  usuario: {
    nome: string
    avatar: string | null
  }
  dataCriacao?: Date
}

function AvaliacaoForm({ espacoId, onAvaliacaoCriada }: { espacoId: string, onAvaliacaoCriada: (avaliacao: Avaliacao) => void }) {
  const [nota, setNota] = useState<number>(5)
  const [comentario, setComentario] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast.error("Faça login para avaliar este espaço", {
        description: "Você precisa estar logado para deixar sua avaliação"
      })
      return
    }
    
    if (nota === 0) {
      toast.error("Avaliação inválida", {
        description: "Selecione uma nota de 1 a 5 estrelas"
      })
      return
    }
    
    if (!comentario.trim()) {
      toast.error("Comentário vazio", {
        description: "Escreva um comentário sobre a sua experiência"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Chamada à API para salvar a avaliação
      const response = await fetch(`/api/espacos/${espacoId}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota, comentario })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar avaliação')
      }
      
      const data = await response.json()
      
      // Usamos os dados retornados da API
      const novaAvaliacao: Avaliacao = {
        id: data.id,
        nota,
        comentario,
        usuario: {
          nome: session?.user?.name || 'Usuário',
          avatar: session?.user?.image || null
        },
        dataCriacao: new Date()
      }
      
      onAvaliacaoCriada(novaAvaliacao)
      setComentario('')
      setNota(5)
      
      toast.success("Avaliação enviada", {
        description: "Obrigado pelo seu feedback!"
      })
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      toast.error("Erro ao enviar avaliação", {
        description: "Tente novamente mais tarde"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Deixe sua avaliação</h3>
      
      <div className="space-y-2">
        <Label htmlFor="rating">Sua nota</Label>
        <RadioGroup
          id="rating"
          value={nota.toString()}
          onValueChange={(value) => setNota(Number(value))}
          className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex items-center">
              <RadioGroupItem
                value={value.toString()}
                id={`rating-${value}`}
                className="sr-only"
              />
              <Label
                htmlFor={`rating-${value}`}
                className="cursor-pointer p-1"
              >
                <Star
                  className={`w-8 h-8 ${nota >= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                />
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comentario">Seu comentário</Label>
        <Textarea
          id="comentario"
          placeholder="Conte como foi sua experiência..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/>
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar avaliação
          </span>
        )}
      </Button>
    </form>
  )
}

interface TabsEspacoProps {
  espacoId: string
  descricao: string
  adicionais: string[]
  vantagens: string[]
  beneficios: string[]
  galeria: string[]
  horarioAbertura: string
  horarioFechamento: string
  capacidade: number
  endereco: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
  cep: string
  avaliacoes?: Avaliacao[]
}

export function TabsEspaco({
  espacoId,
  descricao,
  adicionais,
  vantagens,
  beneficios,
  galeria,
  horarioAbertura,
  horarioFechamento,
  capacidade,
  endereco,
  numero,
  complemento,
  bairro,
  cidade,
  estado,
  cep,
  avaliacoes = []
}: TabsEspacoProps) {
  const [avaliacoesLista, setAvaliacoesLista] = useState<Avaliacao[]>(avaliacoes)
  
  const handleNovaAvaliacao = (avaliacao: Avaliacao) => {
    setAvaliacoesLista(prev => [avaliacao, ...prev])
  }

  return (
    <Tabs defaultValue="sobre" className="w-full">
      <TabsList className="grid grid-cols-4 w-full max-w-[600px]">
        <TabsTrigger value="sobre">Sobre</TabsTrigger>
        <TabsTrigger value="fotos">Fotos</TabsTrigger>
        <TabsTrigger value="local">Local</TabsTrigger>
        <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
      </TabsList>

      {/* Sobre */}
      <TabsContent value="sobre">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{descricao}</p>
            </div>

            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Até {capacidade} pessoas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{horarioAbertura} - {horarioFechamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Disponível todos os dias</span>
                </div>
              </div>
            </div>

            {/* Adicionais */}
            {adicionais.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Adicionais</h3>
                <div className="flex flex-wrap gap-2">
                  {adicionais.map((adicional, index) => (
                    <Badge key={index} variant="secondary">
                      {adicional}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Vantagens */}
            {vantagens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Vantagens</h3>
                <div className="flex flex-wrap gap-2">
                  {vantagens.map((vantagem, index) => (
                    <Badge key={index} variant="secondary">
                      {vantagem}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefícios */}
            {beneficios.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Benefícios</h3>
                <div className="flex flex-wrap gap-2">
                  {beneficios.map((beneficio, index) => (
                    <Badge key={index} variant="secondary">
                      {beneficio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </TabsContent>

      {/* Fotos */}
      <TabsContent value="fotos">
        <Card className="p-6">
          <GaleriaEspaco fotos={galeria.map(foto => {
            // Verifica se é base64 ou URL
            if (foto && typeof foto === 'string') {
              // Se for base64, mantém o formato original
              if (foto.startsWith('data:image')) {
                return foto;
              }
              // Se já começar com /, mantém como está
              if (foto.startsWith('/')) {
                return foto;
              }
              // Se for outro formato, adiciona /
              return `/${foto}`;
            }
            return '';
          }).filter(Boolean)} />
        </Card>
      </TabsContent>

      {/* Local */}
      <TabsContent value="local">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Endereço</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {endereco}, {numero}
                  {complemento && `, ${complemento}`}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {bairro} - {cidade}, {estado}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  CEP: {cep}
                </p>
              </div>
            </div>

            <div className="aspect-video relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBZxhQE9-kVZOYF7KyEhKZxWzS4mcWz2Tk&q=${encodeURIComponent(
                  `${endereco}, ${numero} - ${bairro}, ${cidade} - ${estado}, ${cep}`
                )}`}
              />
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* Avaliações */}
      <TabsContent value="avaliacoes">
        <div className="space-y-6">
          {/* Formulário de Avaliação */}
          <Card className="p-6">
            <AvaliacaoForm espacoId={espacoId} onAvaliacaoCriada={handleNovaAvaliacao} />
          </Card>

          {/* Lista de Avaliações */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">O que estão dizendo sobre este espaço</h3>
            {avaliacoes.length > 0 ? (
              <div className="space-y-6">
                {avaliacoes.map((avaliacao, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={avaliacao.usuario.avatar || undefined} />
                        <AvatarFallback>
                          {avaliacao.usuario.nome.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{avaliacao.usuario.nome}</h4>
                            <div className="flex items-center text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < avaliacao.nota ? "fill-current" : "stroke-current opacity-40"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {avaliacao.comentario}
                        </p>
                      </div>
                    </div>
                    {index < avaliacoes.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Ainda não há avaliações para este espaço.
                </p>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

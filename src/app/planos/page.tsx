'use client'

import { useState, useEffect, useRef } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ModalSelecaoPagamento } from '@/components/espaco/modal-selecao-pagamento'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { poppins } from '@/lib/fonts'
import { Button as MovingBorderButton } from '@/components/ui/moving-border'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'
import { ModalPagamentoAssinatura } from '@/components/planos/modal-pagamento-assinatura'
import './styles.css'

interface Plano {
  id: string
  nome: string
  descricao: string
  preco: number
  tipo: string
  duracao: number
  createdAt: string
  recursos: string[]
  popular?: boolean
  badge?: string
}

export default function Planos() {
  const { data: session } = useSession()
  const router = useRouter()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null)
  const [tipoAssinatura, setTipoAssinatura] = useState<'mensal' | 'anual'>('mensal')
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false)

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/planos')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar planos')
        }
        
        const data = await response.json()
        
        // Modificar os dados para marcar o plano intermediário como popular
        if (Array.isArray(data) && data.length >= 3) {
          const planosOrdenados = [...data].sort((a, b) => a.preco - b.preco)
          
          // Marcar o plano intermediário como popular
          const planosModificados = planosOrdenados.map((plano, index) => ({
            ...plano,
            popular: index === 1, // O plano do meio (índice 1) é o popular
            badge: index === 1 ? 'Mais popular' : undefined,
            recursos: plano.recursos?.split(',').map((r: string) => r.trim()) || [
              'Criações de curso com IA/mês',
              'Cursos no espaço de trabalho',
              'Download como PDF e SCORM',
              'Remover logotipo da Dezko',
              'Disponível quando a demanda é alta',
              'Suporte prioritário'
            ]
          }))
          
          setPlanos(planosModificados)
        } else {
          setPlanos([])
        }
      } catch (error) {
        console.error('Erro ao buscar planos:', error)
        toast.error('Não foi possível carregar os planos')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPlanos()
  }, [])

  const handleComprarClick = (plano: Plano) => {
    if (!session) {
      toast.error('Você precisa estar logado para assinar um plano')
      router.push('/login?callbackUrl=/planos')
      return
    }
    
    setPlanoSelecionado(plano)
    setPagamentoModalOpen(true)
  }
  
  // Calcular preço com base no tipo de assinatura (mensal ou anual)
  const calcularPreco = (preco: number, tipo: 'mensal' | 'anual') => {
    if (tipo === 'anual') {
      // Desconto de 15% no plano anual
      return (preco * 12 * 0.85).toFixed(2)
    }
    return preco.toFixed(2)
  }

  // Calcular período com base no tipo de assinatura
  const calcularPeriodo = (tipo: 'mensal' | 'anual') => {
    return tipo === 'mensal' ? '/mês' : '/ano'
  }

  // Refs para o carrossel de planos
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
  // Função para verificar se é possível rolar para a esquerda ou direita
  const checkScrollability = () => {
    if (!carouselRef.current) return
    
    setCanScrollLeft(carouselRef.current.scrollLeft > 0)
    setCanScrollRight(
      carouselRef.current.scrollLeft < 
      carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10
    )
  }
  
  // Função para rolar o carrossel
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    
    const scrollAmount = 400
    const scrollLeft = carouselRef.current.scrollLeft
    
    carouselRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth'
    })
  }
  
  // Monitora mudanças no scroll para atualizar os botões
  useEffect(() => {
    const currentRef = carouselRef.current
    if (currentRef) {
      checkScrollability()
      currentRef.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      
      return () => {
        currentRef.removeEventListener('scroll', checkScrollability)
        window.addEventListener('resize', checkScrollability)
      }
    }
  }, [planos])

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <Nav />
      
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Efeito de decoração */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <Badge className="px-3 py-1 bg-blue-100 hover:bg-blue-100 text-blue-700 rounded-full border-none">
                Escolha seu plano
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 ${poppins.className}`}
            >
              Planos premium para suas necessidades
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Escolha o plano ideal para seu negócio crescer. Todos os planos incluem funcionalidades essenciais e você pode cancelar a qualquer momento.
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white p-1.5 rounded-full shadow-md backdrop-blur-sm border border-blue-100/50">
              <button 
                className={`relative px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${poppins.className} ${
                  tipoAssinatura === 'mensal' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTipoAssinatura('mensal')}
              >
                <span className="relative z-10">Mensal</span>
                {tipoAssinatura === 'mensal' && 
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-md" 
                  />}
              </button>
              <button 
                className={`relative px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${poppins.className} ${
                  tipoAssinatura === 'anual' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTipoAssinatura('anual')}
              >
                <span className="relative z-10">Anual</span>
                {tipoAssinatura === 'anual' && 
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-md" 
                  />}
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="mt-4 text-gray-600">Carregando planos disponíveis...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              {/* Botões de navegação do carrossel */}
              {canScrollLeft && (
                <button 
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-blue-100/50 text-blue-700 hover:bg-blue-50 transition-all duration-200 -ml-5"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              
              {canScrollRight && (
                <button 
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-blue-100/50 text-blue-700 hover:bg-blue-50 transition-all duration-200 -mr-5"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
              
              {/* Carrossel de planos */}
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto pb-10 pt-5 -mx-4 px-4 snap-x scrollbar-hide carousel-container items-stretch"
              >
                {planos.map((plano) => (
                  <div
                    key={plano.id}
                    className="flex-none snap-start carousel-item flex items-stretch h-full w-[325px] mx-4"
                  >
                    {plano.popular ? (
                      <div className="relative popular-card flex flex-col justify-center h-full">
                        {plano.badge && (
                          <div className="popular-badge">
                            {plano.badge}
                          </div>
                        )}
                        <MovingBorderButton
                          borderRadius="1.25rem"
                          className="bg-white/90 text-black border-blue-200 z-10 h-full"
                          containerClassName="h-full w-full py-0"
                          borderClassName="bg-[radial-gradient(#3b82f6_40%,#60a5fa_60%)] opacity-90"
                          as="div"
                        >
                            <CardContainer className="h-full" containerClassName="py-0 m-0 h-full">
                              <CardBody className="bg-transparent w-full h-full relative">
                                <div className="p-8">
                                  <CardItem translateZ="20" className="w-full">
                                    <h3 className={`text-xl font-bold mb-2 ${poppins.className} w-full`}>{plano.nome}</h3>
                                    <p className="text-gray-600 text-sm mb-6 w-full">{plano.descricao}</p>
                                  </CardItem>
                                  
                                  <CardItem translateZ="30" className="w-full mb-8">
                                    <div className="flex items-baseline w-full">
                                      <span className="text-sm text-gray-600">R$</span>
                                      <span className={`text-4xl font-extrabold mx-1 ${poppins.className}`}>{calcularPreco(plano.preco, tipoAssinatura)}</span>
                                      <span className="text-gray-600">{calcularPeriodo(tipoAssinatura)}</span>
                                    </div>
                                  </CardItem>
                                  
                                  {tipoAssinatura === 'anual' && (
                                    <CardItem translateZ="40" className="w-full mb-6">
                                      <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg w-full"
                                      >
                                        <p className="text-xs text-green-700 font-medium text-center">
                                          Economize 15% com a assinatura anual
                                        </p>
                                      </motion.div>
                                    </CardItem>
                                  )}

                                  <CardItem translateZ="50" className="w-full mb-8">
                                    <ul className="space-y-4 w-full">
                                      {plano.recursos.map((recurso: string) => (
                                        <li key={recurso} className="flex items-start gap-3">
                                          <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                                          <span className="text-gray-700 text-sm">{recurso}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardItem>

                                  <CardItem translateZ="60" className="w-full">
                                    <Button 
                                      className={`w-full ${poppins.className} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md text-white border-none`}
                                      onClick={() => handleComprarClick(plano)}
                                    >
                                      {tipoAssinatura === 'mensal' ? 'Assinar agora' : 'Assinar anualmente'}
                                    </Button>
                                  </CardItem>
                                </div>
                              </CardBody>
                            </CardContainer>
                        </MovingBorderButton>
                      </div>
                    ) : (
                      <CardContainer className="h-full" containerClassName="py-0 h-full">
                        <CardBody className="h-full rounded-2xl relative border border-blue-100 bg-white/80 backdrop-blur-md w-full">
                          <div className="p-8">
                            <CardItem translateZ="20" className="w-full">
                              <h3 className={`text-xl font-bold mb-2 ${poppins.className} w-full`}>{plano.nome}</h3>
                              <p className="text-gray-600 text-sm mb-6 w-full">{plano.descricao}</p>
                            </CardItem>
                            
                            <CardItem translateZ="30" className="w-full mb-8">
                              <div className="flex items-baseline w-full">
                                <span className="text-sm text-gray-600">R$</span>
                                <span className={`text-4xl font-extrabold mx-1 ${poppins.className}`}>{calcularPreco(plano.preco, tipoAssinatura)}</span>
                                <span className="text-gray-600">{calcularPeriodo(tipoAssinatura)}</span>
                              </div>
                            </CardItem>
                            
                            {tipoAssinatura === 'anual' && (
                              <CardItem translateZ="40" className="w-full mb-6">
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg w-full"
                                >
                                  <p className="text-xs text-green-700 font-medium text-center">
                                    Economize 15% com a assinatura anual
                                  </p>
                                </motion.div>
                              </CardItem>
                            )}

                            <CardItem translateZ="50" className="w-full mb-8">
                              <ul className="space-y-4 w-full">
                                {plano.recursos.map((recurso: string) => (
                                  <li key={recurso} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                                    <span className="text-gray-700 text-sm">{recurso}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardItem>

                            <CardItem translateZ="60" className="w-full">
                              <Button 
                                className={`w-full ${poppins.className} bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300`}
                                onClick={() => handleComprarClick(plano)}
                              >
                                {tipoAssinatura === 'mensal' ? 'Assinar agora' : 'Assinar anualmente'}
                              </Button>
                            </CardItem>
                          </div>
                        </CardBody>
                      </CardContainer>
                    )}

                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      
      {/* Modal de pagamento de assinatura */}
      {planoSelecionado && (
        <ModalPagamentoAssinatura
          open={pagamentoModalOpen}
          onOpenChange={setPagamentoModalOpen}
          plano={{
            id: planoSelecionado.id,
            nome: planoSelecionado.nome,
            descricao: planoSelecionado.descricao,
            valorMensal: planoSelecionado.preco,
            valorAnual: planoSelecionado.preco * 12 * 0.85,
            status: 'ATIVO',
            createdAt: new Date(planoSelecionado.createdAt),
            updatedAt: new Date(),
            features: planoSelecionado.recursos
          }}
          tipoAssinatura={tipoAssinatura}
        />
      )}
    </main>
  )
}

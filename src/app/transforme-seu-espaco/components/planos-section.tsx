'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card'
import { ModalPagamentoAssinatura } from '@/components/planos/modal-pagamento-assinatura'

// Adicionando estilos para scrollbar-hide
import './scrollbar-hide.css'

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

export function PlanosSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null)
  const [tipoAssinatura, setTipoAssinatura] = useState<'mensal' | 'anual'>('mensal')
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false)
  
  // Refs para o carrossel de planos
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
  // Ref para a seção
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])
  
  // Buscar planos da API
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

  // Função para lidar com o clique no botão de comprar
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
  
  // Função para verificar se é possível rolar para a esquerda ou direita
  const checkScrollability = () => {
    if (!carouselRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px de margem
  }
  
  // Função para rolar o carrossel
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    
    const scrollAmount = 300
    const newScrollLeft = direction === 'left'
      ? carouselRef.current.scrollLeft - scrollAmount
      : carouselRef.current.scrollLeft + scrollAmount
    
    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }
  
  // Verificar scrollabilidade quando os planos são carregados ou a janela é redimensionada
  useEffect(() => {
    checkScrollability()
    window.addEventListener('resize', checkScrollability)
    
    if (carouselRef.current) {
      carouselRef.current.addEventListener('scroll', checkScrollability)
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollability)
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('scroll', checkScrollability)
      }
    }
  }, [planos])
  
  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ opacity }}
          className="absolute -bottom-64 -right-64 w-[40rem] h-[40rem] rounded-full bg-blue-50 blur-3xl"
        />
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 left-10 w-72 h-72 border border-blue-100 rounded-full opacity-30"
        />
        <motion.div 
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-40 h-40 border border-blue-100 rounded-full opacity-20"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          style={{ scale, opacity }}
          className="text-center mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4"
          >
            Planos flexíveis
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Escolha o plano</span> ideal para você
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 mb-8"
          >
            Temos opções para todos os perfis, desde quem está começando até quem já possui uma rede de espaços.
            Escolha o plano que melhor atende às suas necessidades.
          </motion.p>
          
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mx-auto"
          />
          
          {/* Seletor de tipo de assinatura */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex justify-center mt-10 mb-6"
          >
            <div className="bg-white p-1 rounded-full shadow-md border border-gray-100 flex">
              <button
                onClick={() => setTipoAssinatura('mensal')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${tipoAssinatura === 'mensal' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setTipoAssinatura('anual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${tipoAssinatura === 'anual' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Anual
              </button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Carrossel de planos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
                    className="min-w-[300px] md:min-w-[350px] px-4 snap-start"
                  >
                    {/* Card 3D */}
                    <CardContainer className={`w-full ${plano.popular ? 'border-2 border-blue-500' : 'border border-gray-200'} rounded-2xl overflow-hidden bg-white`}>
                      <CardBody className="relative bg-white p-6 flex flex-col h-full">
                        {plano.badge && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            {plano.badge}
                          </div>
                        )}
                        
                        <div className="flex flex-col h-full">
                          <CardItem translateZ="20" className="w-full">
                            <h3 className="text-xl font-bold mb-2 w-full">{plano.nome}</h3>
                            <p className="text-gray-600 text-sm mb-6 w-full">{plano.descricao}</p>
                          </CardItem>
                          
                          <CardItem translateZ="30" className="w-full mb-8">
                            <div className="flex items-baseline w-full">
                              <span className="text-sm text-gray-600">R$</span>
                              <span className="text-4xl font-extrabold mx-1">{calcularPreco(plano.preco, tipoAssinatura)}</span>
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
                              {plano.recursos.map((recurso: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                                  <span className="text-gray-700 text-sm">{recurso}</span>
                                </li>
                              ))}
                            </ul>
                          </CardItem>

                          <CardItem translateZ="60" className="w-full mt-auto">
                            <Button 
                              className="w-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => handleComprarClick(plano)}
                            >
                              {tipoAssinatura === 'mensal' ? 'Assinar agora' : 'Assinar anualmente'}
                            </Button>
                          </CardItem>
                        </div>
                      </CardBody>
                    </CardContainer>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Modal de pagamento de assinatura */}
      {planoSelecionado && (
        <ModalPagamentoAssinatura
          open={pagamentoModalOpen}
          onOpenChange={setPagamentoModalOpen}
          plano={{
            id: planoSelecionado.id,
            nome: planoSelecionado.nome,
            descricao: planoSelecionado.descricao,
            preco: planoSelecionado.preco,
            valorMensal: planoSelecionado.preco,
            valorAnual: planoSelecionado.preco * 12 * 0.85,
            tipo: planoSelecionado.tipo,
            duracao: planoSelecionado.duracao,
            status: 'ATIVO',
            createdAt: new Date(planoSelecionado.createdAt),
            updatedAt: new Date(),
            recursos: planoSelecionado.recursos,
            features: planoSelecionado.recursos
          }}
          tipoAssinatura={tipoAssinatura}
        />
      )}
    </section>
  )
}

'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

export function HeroSection() {
  // Referência para animação de scroll
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Animações baseadas em scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  // Variantes para animações sequenciais
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }
  
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.5
      }
    }
  }
  
  const floatingVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut"
      }
    }
  }
  
  return (
    <div ref={containerRef} className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-50 py-20 md:py-32">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"
        />
        
        {/* Formas geométricas adicionais */}
        <motion.div
          animate={{ rotate: [0, 360], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/4 w-64 h-64 border-2 border-blue-200/30 rounded-full"
        />
        
        <motion.div
          animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-1/4 w-20 h-20 bg-blue-100/20 rounded-lg transform rotate-12"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <motion.div
              variants={itemVariants}
              className="max-w-2xl">
              <div className="relative mb-8">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                  Monetize seu espaço ocioso
                </motion.span>
                
                <motion.h1 
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent inline-block">
                    Transforme seu espaço
                  </span>
                </motion.h1>
                <motion.h1 
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  em uma fonte de <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">renda extra</span>
                    <motion.span 
                      className="absolute -bottom-2 left-0 w-full h-1 bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 0.8 }}
                    />
                  </span>
                </motion.h1>
              </div>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Já pensou em ganhar dinheiro com aquele espaço que está parado?
                A Dezko conecta você com empresas e profissionais que precisam exatamente 
                do que você tem: salas, escritórios, coworkings ou qualquer espaço disponível.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="space-y-5 mb-10">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      Seu espaço tem potencial. A gente ajuda você a aproveitar.
                    </p>
                    <p className="text-gray-600">
                      Com a Dezko, você pode anunciar ambientes ociosos ou pouco utilizados de forma simples e segura.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1 rounded-full">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      Sem burocracia, só resultados
                    </p>
                    <p className="text-gray-600">
                      Nós cuidamos da divulgação e do pagamento. Você só foca em aproveitar a renda extra.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Link href="/cadastro" className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl w-full sm:w-auto group transition-all duration-300 shadow-lg hover:shadow-blue-200/50">
                      <span>Comece agora</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
                
                <Link href="#planos" className="flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button size="lg" variant="outline" className="border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl w-full sm:w-auto">
                      Ver planos
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="flex-1"
          >
            <div className="relative">
              {/* Elementos decorativos ao redor da imagem */}
              <motion.div 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 w-16 h-16 bg-blue-100 rounded-lg z-0"
              />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-50 rounded-full z-0"
              />
              
              {/* Moldura da imagem */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-blue-300/10 rounded-3xl transform rotate-3 z-0"
                animate={{ rotate: [3, 2, 3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Imagem principal */}
              <motion.div
                className="relative z-10 overflow-hidden rounded-2xl shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                  alt="Espaço de trabalho moderno" 
                  className="w-full h-[500px] object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
                  }}
                />
                
                {/* Overlay com gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-60" />
              </motion.div>
              
              {/* Indicadores flutuantes */}
              <motion.div 
                variants={floatingVariants}
                initial="hidden"
                animate="visible"
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg z-20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Renda Extra</p>
                    <p className="text-xs text-gray-500">Até R$ 2.500/mês</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Badge de "Disponível" */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-4 left-4 bg-blue-600 text-white py-1 px-3 rounded-full text-sm font-medium z-20 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Disponível para reserva</span>
              </motion.div>
              
              {/* Badge de avaliações */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 py-1.5 px-3 rounded-full text-sm font-medium z-20 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>4.9 (120)</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Indicadores de scroll */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-blue-600"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-medium mb-2">Conheça mais</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
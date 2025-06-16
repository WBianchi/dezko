'use client'

import { useEffect } from 'react'
import { HeroSection } from './components/hero-section'
import { BeneficiosSection } from './components/beneficios-section'
import { ComoFuncionaSection } from './components/como-funciona-section'
import { PlanosSection } from './components/planos-section'
import { QuemPodeAnunciarSection } from './components/quem-pode-anunciar-section'
import { DepoimentosSection } from './components/depoimentos-section'
import { CTASection } from './components/cta-section'
import { AnimatedBackground } from './components/animated-background'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Importar componentes do layout principal
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export default function TransformeSeuEspacoPage() {
  // Configuração para animação de scroll
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background animado */}
      <AnimatedBackground />
      
      {/* Conteúdo da página */}
      <div className="relative z-10">
        {/* Header */}
        <Nav />
        
        {/* Seções da Landing Page */}
        <main>
          <HeroSection />
          
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 }
            }}
            transition={{ duration: 0.5 }}
          >
            <BeneficiosSection />
          </motion.div>
          
          <ComoFuncionaSection />
          <PlanosSection />
          <QuemPodeAnunciarSection />
          <DepoimentosSection />
          <CTASection />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

'use client'

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowRight, Search, CalendarCheck, Key, Sparkles, Shield, Clock, CreditCard } from "lucide-react"
import { Poppins } from 'next/font/google'
import Link from 'next/link'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export function CTASection() {
  return (
    <section className="relative py-32">
      <div className="container max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-24"
        >
          {/* Título e Descrição */}
          <div className="max-w-3xl mx-auto space-y-6 px-4">
            <h2 className={`${poppins.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight`}>
              Encontre o{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                espaço perfeito
              </span>
              {' '}<span className="block sm:inline">para o seu negócio</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Temos diversos planos e opções de espaços para atender todas as suas necessidades.
              Escolha o que melhor se encaixa com o seu momento.
            </p>
          </div>

          {/* Mini Cards de Vantagens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-[1400px] mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-10 rounded-xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-zinc-900 flex flex-col items-center text-center"
            >
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 mb-6">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-xl mb-4">Diversas opções</h3>
              <p className="text-sm text-muted-foreground">
               Pague com pix, boleto e cartão de crédito
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-10 rounded-xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-zinc-900 flex flex-col items-center text-center"
            >
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 mb-6">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-xl mb-4">Flexibilidade Total</h3>
              <p className="text-sm text-muted-foreground">
                Acesso 24/7 com planos adaptáveis às suas necessidades
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-10 rounded-xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-zinc-900 flex flex-col items-center text-center"
            >
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 mb-6">
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-xl mb-4">Pagamento Facilitado</h3>
              <p className="text-sm text-muted-foreground">
                Diversas formas de pagamento e parcelamento
              </p>
            </motion.div>
          </div>

          {/* Como Funciona - 4 Passos */}
          <div className="pt-12 px-4">
            <h3 className={`${poppins.className} text-2xl sm:text-3xl font-semibold mb-8 sm:mb-16 text-center`}>
              Como funciona a{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Dezko
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 px-2 sm:px-8">
              {[
                {
                  icon: Search,
                  title: "Procure",
                  description: "Encontre o espaço perfeito para o seu negócio",
                  delay: 0.2
                },
                {
                  icon: CalendarCheck,
                  title: "Agende",
                  description: "Reserve na data e horário mais conveniente",
                  delay: 0.3
                },
                {
                  icon: Key,
                  title: "Acesse",
                  description: "Entre no seu espaço com total autonomia",
                  delay: 0.4
                },
                {
                  icon: Sparkles,
                  title: "Aproveite",
                  description: "Desfrute de uma experiência única e produtiva",
                  delay: 0.5
                }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step.delay }}
                  className="relative"
                >
                  {/* Linha conectora - só visível em telas grandes */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-14 left-[60%] w-full h-[2px] bg-gradient-to-r from-blue-600/20 to-blue-800/20 dark:from-blue-400/20 dark:to-blue-600/20" />
                  )}
                  
                  {/* Linha vertical para mobile e tablet - visível apenas entre itens */}
                  {index < 3 && (
                    <div className="lg:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[2px] h-8 bg-gradient-to-b from-blue-600/20 to-blue-800/20 dark:from-blue-400/20 dark:to-blue-600/20" />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
                    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-blue-950 shadow-lg shadow-blue-100/20 dark:shadow-blue-950/20 border border-blue-100/50 dark:border-blue-900/50 backdrop-blur-sm">
                      <step.icon className="h-7 w-7 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg sm:text-xl mb-2 sm:mb-3">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px] mx-auto">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-20 flex justify-center"
            >
              <Link href="/planos">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-lg px-8 py-6 h-auto rounded-[40px] font-poppins relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
                  <span className="relative">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 inline-block" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

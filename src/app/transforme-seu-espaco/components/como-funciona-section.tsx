'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { FileText, Calendar, Wallet, ArrowRight, Check, Users, Star } from 'lucide-react'
import { useRef } from 'react'

export function ComoFuncionaSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])
  
  const steps = [
    {
      icon: <FileText className="h-10 w-10 text-white" />,
      title: "Crie seu anúncio",
      description: "Cadastre seu espaço com fotos e informações detalhadas em poucos minutos. Destaque os diferenciais do seu ambiente.",
      color: "bg-blue-600",
      benefits: ["Visibilidade garantida", "Fotos profissionais", "Descrição otimizada"]
    },
    {
      icon: <Calendar className="h-10 w-10 text-white" />,
      title: "Receba reservas",
      description: "Você será notificado em tempo real sempre que alguém demonstrar interesse ou fizer uma reserva no seu espaço.",
      color: "bg-blue-700",
      benefits: ["Agenda integrada", "Notificações instantâneas", "Confirmação automática"]
    },
    {
      icon: <Wallet className="h-10 w-10 text-white" />,
      title: "Aproveite sua renda extra",
      description: "Receba pagamentos de forma segura e sem complicações. Acompanhe seus ganhos pelo painel administrativo.",
      color: "bg-blue-800",
      benefits: ["Pagamento garantido", "Transferência rápida", "Sem burocracia"]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }
  
  const lineVariants = {
    hidden: { width: "0%" },
    visible: { 
      width: "100%",
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  }

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
            Processo simplificado
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Como funciona</span> o processo?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 mb-8"
          >
            Transforme seu espaço ocioso em uma fonte de renda em apenas três passos simples.
            Nosso processo foi desenhado para ser rápido, seguro e eficiente.
          </motion.p>
          
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "120px" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mx-auto"
          />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 relative">
          {/* Linha conectora animada (apenas em desktop) */}
          <div className="hidden md:block absolute top-28 left-[10%] right-[10%] h-1 bg-blue-100 z-0">
            <motion.div 
              initial={{ width: "0%", left: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              className="absolute top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.3 }}
              whileHover={{ y: -5 }}
              className="flex-1 flex flex-col items-center text-center relative bg-white rounded-2xl p-8 shadow-lg shadow-blue-100/50 border border-blue-50"
            >
              {/* Número do passo */}
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 + index * 0.3 }}
                className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-200/50"
              >
                {index + 1}
              </motion.div>
              
              <div className="relative mb-8 mt-4">
                {/* Círculo principal com ícone */}
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 + index * 0.3 }}
                  className={`${step.color} w-20 h-20 rounded-2xl rotate-45 flex items-center justify-center shadow-lg z-10 relative overflow-hidden group-hover:rotate-0 transition-transform duration-300`}
                >
                  <motion.div
                    animate={{ rotate: [-45, -45] }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center"
                  >
                    {step.icon}
                  </motion.div>
                  
                  {/* Efeito de brilho */}
                  <motion.div 
                    animate={{ 
                      left: ["100%", "-100%"],
                      top: ["100%", "-100%"] 
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      repeatType: "loop", 
                      ease: "linear",
                      delay: index * 1
                    }}
                    className="absolute w-20 h-20 bg-white/20 blur-md transform rotate-45"
                  />
                </motion.div>
                
                {/* Círculo de pulso */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 bg-blue-200 rounded-2xl rotate-45 transform scale-110 opacity-20"
                />
              </div>
              
              <motion.h3 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.3 }}
                className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
              >
                {step.title}
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.3 }}
                className="text-gray-600 mb-6"
              >
                {step.description}
              </motion.p>
              
              {/* Lista de benefícios */}
              <motion.ul 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.3 }}
                className="space-y-2 text-left w-full mt-auto"
              >
                {step.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`${step.color} p-1 rounded-full text-white flex-shrink-0`}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </motion.ul>
              
              {/* Indicador de próximo passo */}
              {index < steps.length - 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.3 }}
                  className="hidden md:flex absolute -right-8 top-1/2 transform -translate-y-1/2 z-20"
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Estatísticas */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-2xl shadow-lg border border-blue-50"
        >
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">+5.000</h4>
              <p className="text-gray-600 text-sm">Usuários ativos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">+12.500</h4>
              <p className="text-gray-600 text-sm">Reservas realizadas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <div className="bg-blue-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">4.9/5.0</h4>
              <p className="text-gray-600 text-sm">Avaliação média</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

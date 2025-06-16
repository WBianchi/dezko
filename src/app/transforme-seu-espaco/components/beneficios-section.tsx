'use client'

import { motion } from 'framer-motion'
import { Users, Shield, Sliders } from 'lucide-react'

export function BeneficiosSection() {
  const beneficios = [
    {
      icon: <Users className="h-10 w-10 text-blue-600" />,
      title: "Empresas de verdade, buscando soluções reais",
      description: "Diariamente, milhares de profissionais e negócios buscam espaços flexíveis para reuniões, atendimentos e operações. A próxima reserva pode ser no seu espaço."
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: "Segurança e tranquilidade em cada reserva",
      description: "Você aprova quem entra. Cada locação é intermediada com contrato digital e pagamento garantido."
    },
    {
      icon: <Sliders className="h-10 w-10 text-blue-600" />,
      title: "Flexibilidade total",
      description: "Você define horários, valores e regras de uso. É você no controle."
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que anunciar na <span className="text-blue-600">Dezko</span>?
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {beneficios.map((beneficio, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="mb-6 bg-blue-50 p-4 rounded-xl inline-block group-hover:bg-blue-100 transition-colors">
                {beneficio.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{beneficio.title}</h3>
              <p className="text-gray-600">{beneficio.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

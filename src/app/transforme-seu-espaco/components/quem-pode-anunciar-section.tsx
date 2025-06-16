'use client'

import { motion } from 'framer-motion'
import { Stethoscope, Building2, Briefcase, UtensilsCrossed, Scissors, Brush, Users, Camera, Laptop } from 'lucide-react'

export function QuemPodeAnunciarSection() {
  const espacos = [
    {
      icon: <Stethoscope className="h-8 w-8 text-blue-600" />,
      title: "Consultórios e clínicas",
      description: "Com horários livres durante a semana"
    },
    {
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      title: "Salas comerciais",
      description: "Em prédios empresariais ou centros médicos"
    },
    {
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
      title: "Escritórios",
      description: "Com mesas ou estações de trabalho disponíveis"
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8 text-blue-600" />,
      title: "Cozinhas e espaços gastronômicos",
      description: "Para chefs e aulas particulares"
    },
    {
      icon: <Scissors className="h-8 w-8 text-blue-600" />,
      title: "Salões de beleza",
      description: "Que têm cadeiras vagas em determinados turnos"
    },
    {
      icon: <Brush className="h-8 w-8 text-blue-600" />,
      title: "Barbearias",
      description: "Com espaço ocioso ou profissionais que querem dividir custos"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Auditórios e salas de reunião",
      description: "Que ficam vazios fora de eventos"
    },
    {
      icon: <Camera className="h-8 w-8 text-blue-600" />,
      title: "Estúdios",
      description: "De estética, fotografia ou gravação com horários livres"
    },
    {
      icon: <Laptop className="h-8 w-8 text-blue-600" />,
      title: "Coworkings",
      description: "Com estrutura pronta para uso imediato"
    }
  ]

  return (
    <section className="py-20 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quem pode anunciar?</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Se você tem um espaço que pode ser usado por algumas horas no dia, ele pode gerar renda para você. 
            Veja alguns exemplos:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {espacos.map((espaco, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-blue-50 p-3 rounded-full inline-block mb-4">
                {espaco.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{espaco.title}</h3>
              <p className="text-gray-600">{espaco.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto"
        >
          <p className="text-lg font-medium text-gray-800 mb-4">
            Se o seu espaço está pronto para uso profissional e passa boa parte do tempo vazio, ele tem lugar na Dezko.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

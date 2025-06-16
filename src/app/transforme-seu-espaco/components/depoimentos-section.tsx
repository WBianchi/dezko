'use client'

import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function DepoimentosSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const depoimentos = [
    {
      nome: "Carlos Silva",
      cargo: "Proprietário de Clínica",
      foto: "https://randomuser.me/api/portraits/men/32.jpg",
      texto: "Minha clínica ficava vazia nos fins de semana. Agora, tenho profissionais alugando os consultórios e gerando uma renda extra significativa. A Dezko facilitou todo o processo!",
      estrelas: 5
    },
    {
      nome: "Ana Oliveira",
      cargo: "Dona de Coworking",
      foto: "https://randomuser.me/api/portraits/women/44.jpg",
      texto: "Com a Dezko, consegui aumentar a ocupação do meu espaço em mais de 70%. A plataforma é intuitiva e o suporte é excelente. Recomendo para todos os proprietários!",
      estrelas: 5
    },
    {
      nome: "Roberto Mendes",
      cargo: "Proprietário de Escritório",
      foto: "https://randomuser.me/api/portraits/men/62.jpg",
      texto: "Tenho um escritório grande que ficava ocioso. Graças à Dezko, agora alugo estações de trabalho e salas de reunião. A renda extra cobre mais da metade do aluguel!",
      estrelas: 4
    }
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === depoimentos.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? depoimentos.length - 1 : prevIndex - 1
    )
  }

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
            O que dizem nossos parceiros
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {depoimentos.map((depoimento, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-50 rounded-2xl p-8 shadow-lg relative"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-shrink-0">
                        <img 
                          src={depoimento.foto} 
                          alt={depoimento.nome} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < depoimento.estrelas ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 italic mb-4">"{depoimento.texto}"</p>
                        <div>
                          <h4 className="font-bold">{depoimento.nome}</h4>
                          <p className="text-sm text-gray-600">{depoimento.cargo}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controles de navegação */}
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
          >
            <ChevronLeft className="h-6 w-6 text-blue-600" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
          >
            <ChevronRight className="h-6 w-6 text-blue-600" />
          </button>
          
          {/* Indicadores */}
          <div className="flex justify-center mt-6 gap-2">
            {depoimentos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

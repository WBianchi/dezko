'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, MessageSquare, HelpCircle, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleWidget = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Botão principal do chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={toggleWidget}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold">Precisa de ajuda?</h3>
              </div>
              <motion.button
                onClick={toggleWidget}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-6">
                Olá! Como podemos ajudar você hoje? Escolha uma das opções abaixo:
              </p>

              <div className="space-y-3">
                <Link href="/atendimento-virtual">
                  <motion.div
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center gap-3 cursor-pointer group"
                    whileHover={{ x: 5, backgroundColor: "#dbeafe" }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Atendimento online</h4>
                      <p className="text-xs text-gray-600">Fale com um de nossos atendentes</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </Link>

                <Link href="/central-de-ajuda">
                  <motion.div
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center gap-3 cursor-pointer group"
                    whileHover={{ x: 5, backgroundColor: "#dbeafe" }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Central de ajuda</h4>
                      <p className="text-xs text-gray-600">Tutoriais e guias úteis</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </Link>

                <Link href="/duvidas-frequentes">
                  <motion.div
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center gap-3 cursor-pointer group"
                    whileHover={{ x: 5, backgroundColor: "#dbeafe" }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Dúvidas frequentes</h4>
                      <p className="text-xs text-gray-600">Respostas para perguntas comuns</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t p-4">
              <p className="text-xs text-center text-gray-500">
                Estamos disponíveis 24/7 para ajudar você
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

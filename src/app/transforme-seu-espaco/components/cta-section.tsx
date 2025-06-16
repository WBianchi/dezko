'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece agora. Cadastre-se grátis e sem compromisso.
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Transforme seu espaço ocioso em uma fonte de renda extra. 
            Junte-se a milhares de proprietários que já estão lucrando com a Dezko.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
              Cadastrar meu espaço
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Facebook, Instagram, Linkedin, MapPin, Phone, Twitter, Mail, Clock, Shield, Award, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ChatWidget } from './chat-widget'

export function Footer() {
  return (
    <>
    <ChatWidget />
    <footer className="bg-white/80 backdrop-blur-md border-t mt-16">
      {/* Features Section */}
      <div className="border-b">
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <Shield className="w-12 h-12 text-blue-600" />
              <div>
                <h4 className="font-semibold mb-2">Segurança Garantida</h4>
                <p className="text-sm text-gray-600">Contratos seguros e verificados</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Award className="w-12 h-12 text-blue-600" />
              <div>
                <h4 className="font-semibold mb-2">Espaços Premium</h4>
                <p className="text-sm text-gray-600">Locais de alta qualidade</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-12 h-12 text-blue-600" />
              <div>
                <h4 className="font-semibold mb-2">Suporte 24/7</h4>
                <p className="text-sm text-gray-600">Atendimento especializado</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-12 h-12 text-blue-600" />
              <div>
                <h4 className="font-semibold mb-2">Satisfação Garantida</h4>
                <p className="text-sm text-gray-600">Política de reembolso em até 7 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="mr-6 flex-none">
              <Image 
                src="/logo.png" 
                alt="Dezxko" 
                width={100} 
                height={40} 
                className="object-contain" 
              />
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-md">
              Transformando a maneira como as empresas encontram seus espaços ideais. 
              Conectamos pessoas a lugares extraordinários para criar, colaborar e crescer.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-6 max-w-md">
            © Todos os Direitos Reservados | Dezko | Aluguel de Espaços
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/espacos?categoria=aluguel-de-salas" className="text-gray-600 hover:text-blue-700">Aluguel de Salas</a></li>
              <li><a href="/espacos?categoria=coworking" className="text-gray-600 hover:text-blue-700">Coworking</a></li>
              <li><a href="/espacos?categoria=escritorios-virtuais" className="text-gray-600 hover:text-blue-700">Escritórios Virtuais</a></li>
              <li><a href="/espacos?categoria=salas-de-reuniao" className="text-gray-600 hover:text-blue-700">Salas de Reunião</a></li>
              <li><a href="/espacos?categoria=auditorios" className="text-gray-600 hover:text-blue-700">Auditórios</a></li>
              <li><a href="/espacos?categoria=espacos-para-eventos" className="text-gray-600 hover:text-blue-700">Espaços para Eventos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">A Dezko</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/atendimento-virtual" className="text-gray-600 hover:text-blue-700">Atendimento virtual</Link></li>
              <li><Link href="/duvidas-frequentes" className="text-gray-600 hover:text-blue-700">Duvidas frequentes</Link></li>
              <li><Link href="/central-de-ajuda" className="text-gray-600 hover:text-blue-700">Central de ajuda</Link></li>
              <li><Link href="/sobre-nos" className="text-gray-600 hover:text-blue-700">Sobre Nós</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-blue-700">Nosso Blog</Link></li>
              <li><Link href="/afiliados" className="text-gray-600 hover:text-blue-700">Afiliados Dezko</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                Av. Paulista, 1000 - São Paulo
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
               Atendimento automatizado
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                contato@dezko.com.br
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                Atendimento 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-gray-600 mb-4">
                Receba as melhores ofertas e novidades do mercado imobiliário comercial.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Seu e-mail"
                  className="bg-white/50"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900">
                  Assinar
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-end">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <Link href="/termos" className="hover:text-blue-700">Termos de Uso</Link>
                <span>•</span>
                <Link href="/privacidade" className="hover:text-blue-700">Política de Privacidade</Link>
                <span>•</span>
                <Link href="/cookies" className="hover:text-blue-700">Cookies</Link>
                <span>•</span>
                <Link href="/reembolso" className="hover:text-blue-700">Reembolso</Link>
              </div>
            </div>
          </div>
          <div className="text-left text-sm text-gray-600 pt-8 border-t">
            <p>&copy; Todos os Direitos Reservados | Dezko | Aluguel de Espaços CNPJ: 48.108.656/0001-59 – GCG Solução informatica e marketing</p>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}

'use client'

import { Topbar } from '@/components/topbar'
import { Leftbar } from '@/components/leftbar'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/entrar')
    },
  })
  
  const [isMobile, setIsMobile] = useState(false)
  
  // Detectar dispositivo móvel e ajustar layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Verificar no carregamento inicial
    checkMobile()
    
    // Adicionar event listener para mudanças de tamanho de tela
    window.addEventListener('resize', checkMobile)
    
    // Limpar event listener
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (status === 'loading') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Topbar userType={session?.user?.role} />
      <Leftbar userType={session?.user?.role} />
      <main className={`pt-16 ${isMobile ? 'pl-16 sm:pl-20' : 'pl-16 md:pl-64'} transition-all duration-300`}>
        <div className="p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

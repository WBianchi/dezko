'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { Plus, AlertCircle } from 'lucide-react'
import { columns } from './columns'
import { useQuery } from '@tanstack/react-query'
import { AddAgendaModal } from '@/components/modals/add-agenda-modal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export default function AgendaPage() {
  const router = useRouter()

  // Buscar as agendas existentes
  const { data: agendas, isLoading: isLoadingAgendas } = useQuery({
    queryKey: ['agendas'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/agendas')
      return response.json()
    },
  })

  // Verificar disponibilidade de criação de novas agendas
  const { data: disponibilidade, isLoading: isLoadingDisponibilidade } = useQuery({
    queryKey: ['agendas-disponibilidade'],
    queryFn: async () => {
      const response = await fetch('/api/espaco/agendas/disponivel')
      return response.json()
    },
  })

  const isLoading = isLoadingAgendas || isLoadingDisponibilidade
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Agenda"
            description="Gerencie as agendas do seu espaço"
          />
          
          {disponibilidade?.temAgendaDisponivel ? (
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                  <span className="font-medium">Disponível:</span> {disponibilidade.totalDisponivel} de {disponibilidade.limiteAgendas}
                </Badge>
              </motion.div>
              
              <AddAgendaModal>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Agenda
                </Button>
              </AddAgendaModal>
            </div>
          ) : (
            <Button onClick={() => router.push('/planos')} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800">
              Assinar um plano
            </Button>
          )}
        </div>
        
        <Separator />
        
        {!isLoading && !disponibilidade?.temAgendaDisponivel && (
          <Alert className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite de agendas atingido</AlertTitle>
            <AlertDescription>
              {disponibilidade?.mensagem || "Você atingiu o limite de agendas do seu plano atual. Assine um plano para criar mais agendas."}
            </AlertDescription>
          </Alert>
        )}
        
        <DataTable
          columns={columns}
          data={agendas || []}
          searchKey="titulo"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

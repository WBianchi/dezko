'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

type Espaco = {
  id: string
  nome: string
  cidade?: string
  estado?: string
}

interface NovaMensagemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NovaMensagemModal({ isOpen, onClose }: NovaMensagemModalProps) {
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [espacoId, setEspacoId] = useState('')
  const queryClient = useQueryClient()

  // Buscar espaços onde o usuário tem reservas
  const { data: espacos, isLoading: carregandoEspacos } = useQuery<Espaco[]>({
    queryKey: ['espacos-reservados-usuario'],
    queryFn: async () => {
      const response = await fetch('/api/usuario/espacos-reservados')
      const data = await response.json()
      return data.espacos || []
    }
  })

  // Mutação para enviar a mensagem
  const { mutate: enviarMensagem, isPending } = useMutation({
    mutationFn: async (dados: { assunto: string, mensagem: string, espacoId: string }) => {
      const response = await fetch('/api/usuario/mensagens/nova', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar mensagem')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Sua mensagem foi enviada com sucesso.')
      // Limpar campos e fechar modal
      setAssunto('')
      setMensagem('')
      setEspacoId('')
      onClose()

      // Invalidar query para atualizar lista de mensagens
      queryClient.invalidateQueries({ queryKey: ['mensagens-usuario'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao enviar mensagem. Tente novamente mais tarde.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos
    if (!assunto || !mensagem || !espacoId) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    // Enviar mensagem
    enviarMensagem({ assunto, mensagem, espacoId })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para um espaço de interesse.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="espaco">Espaço</Label>
            <Select value={espacoId} onValueChange={setEspacoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um espaço" />
              </SelectTrigger>
              <SelectContent>
                {carregandoEspacos ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : espacos && espacos.length > 0 ? (
                  espacos.map((espaco) => (
                    <SelectItem key={espaco.id} value={espaco.id}>
                      {espaco.nome} {espaco.cidade && espaco.estado ? `- ${espaco.cidade}/${espaco.estado}` : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="sem-espacos" disabled>
                    Nenhum espaço disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Digite o assunto da mensagem"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={5}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

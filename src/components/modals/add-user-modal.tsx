'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const userSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'espaco', 'usuario']),
})

type UserForm = z.infer<typeof userSchema>

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser?: {
    id: string
    nome: string
    email: string
    role: string
  } | null
}

export function AddUserModal({ open, onOpenChange, editingUser }: AddUserModalProps) {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: editingUser?.role || 'usuario',
      nome: editingUser?.nome || '',
      email: editingUser?.email || '',
      senha: ''
    }
  })

  const role = watch('role')

  async function onSubmit(data: UserForm) {
    try {
      setLoading(true)
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}` 
        : '/api/admin/users'
      
      const method = editingUser ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Erro ao salvar usuário')

      // Atualizar a lista de usuários
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Fechar o modal e resetar o formulário
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Edite os dados do usuário.'
                : 'Preencha os dados para criar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="role">Tipo de Usuário</label>
              <Select
                defaultValue={editingUser?.role || "usuario"}
                onValueChange={(value) => setValue('role', value as UserForm['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="espaco">Espaço</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="nome">Nome</label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Nome completo"
              />
              {errors.nome && (
                <span className="text-sm text-red-500">{errors.nome.message}</span>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="senha">Senha</label>
              <Input
                id="senha"
                type="password"
                {...register('senha')}
                placeholder="••••••••"
              />
              {errors.senha && (
                <span className="text-sm text-red-500">{errors.senha.message}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                editingUser ? "Salvar" : "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

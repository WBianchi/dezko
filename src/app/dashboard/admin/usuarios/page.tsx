'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { AddUserModal } from '@/components/modals/add-user-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input'
import { toast } from "sonner"
import {
  ResponsiveContainer,
  ResponsiveHeader,
  ResponsiveFilters,
  ResponsiveTable
} from '@/components/dashboard/responsive-container'
import { ResponsiveDataTable } from '@/components/dashboard/responsive-table'

interface User {
  id: string
  nome: string
  email: string
  role: 'admin' | 'espaco' | 'usuario'
  createdAt: string
}

async function getUsers() {
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Falha ao carregar usuários')
  return res.json()
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'espaco':
      return 'Espaço'
    case 'usuario':
      return 'Usuário'
    default:
      return role
  }
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-700'
    case 'espaco':
      return 'bg-blue-100 text-blue-700'
    case 'usuario':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const queryClient = useQueryClient()
  
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers
  })

  async function handleDeleteUser(user: User) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao excluir usuário')

      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast.error('Erro ao excluir usuário')
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Erro ao carregar usuários. Tente novamente mais tarde.
      </div>
    )
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader 
        title="Usuários"
        subtitle="Gerencie todos os usuários do sistema"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
          </Button>
        }
      />
      
      <ResponsiveFilters>
        <div className="flex gap-2 w-full flex-1 flex-wrap">
          <Input 
            placeholder="Buscar usuários..."
            className="max-w-xs" 
          />
          <Button variant="outline" size="sm" className="h-10">
            Filtrar
          </Button>
        </div>
      </ResponsiveFilters>

      <ResponsiveTable>
        <ResponsiveDataTable 
          data={users || []}
          columns={[
            {
              header: "Usuário",
              accessorKey: "nome",
              cell: (user) => (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                    <AvatarFallback>
                      {user.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.nome}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              )
            },
            {
              header: "Email",
              accessorKey: "email",
              hideOnMobile: true
            },
            {
              header: "Tipo",
              accessorKey: "role",
              cell: (user) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              )
            },
            {
              header: "Data de Cadastro",
              accessorKey: "createdAt",
              cell: (user) => new Date(user.createdAt).toLocaleDateString('pt-BR'),
              hideOnMobile: true
            },
            {
              header: "Ações",
              accessorKey: "acoes",
              cell: (user) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setEditingUser(user)
                      setIsAddModalOpen(true)
                    }}>
                      Editar usuário
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setDeletingUser(user)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      Excluir usuário
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
          ]}
          emptyMessage="Nenhum usuário encontrado"
        />
      </ResponsiveTable>

      <AddUserModal 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) setEditingUser(null)
        }}
        editingUser={editingUser}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário{' '}
              <span className="font-medium">{deletingUser?.nome}</span> e removerá seus dados do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingUser && handleDeleteUser(deletingUser)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveContainer>
  )
}

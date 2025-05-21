'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Heading } from '@/components/heading'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, User, Key, FileText, X, CheckCircle2 } from 'lucide-react'

const perfilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF é obrigatório e deve ter 11 dígitos').max(14, 'CPF deve ter no máximo 14 caracteres'),
  telefone: z.string().min(14, 'Telefone é obrigatório e deve estar no formato (99) 99999-9999'),
})

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme a nova senha'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
})

export default function PerfilUsuarioPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const perfilForm = useForm<z.infer<typeof perfilSchema>>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
    }
  })

  const senhaForm = useForm<z.infer<typeof senhaSchema>>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    }
  })

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUsuarioData = async () => {
      if (!session?.user) return
      
      try {
        setLoading(true)
        
        const res = await fetch('/api/usuario/perfil')
        
        if (!res.ok) {
          throw new Error(`Erro ao buscar dados do usuário: ${res.status} ${res.statusText}`)
        }
        
        const data = await res.json()
        
        // Carregar dados no formulário
        perfilForm.reset({
          nome: data.nome || '',
          email: data.email || '',
          cpf: data.cpf || '',
          telefone: data.telefone || '',
        })

        // Carregar avatar preview se existir
        if (data.avatar) {
          setAvatarPreview(data.avatar)
        }
      } catch (error: unknown) {
        console.error('Erro ao buscar dados do usuário:', error)
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro desconhecido ao carregar perfil',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsuarioData()
  }, [session, perfilForm, toast])

  const onSubmitPerfil = async (values: z.infer<typeof perfilSchema>) => {
    setIsSaving(true)
    try {
      // Enviar dados do perfil para a API
      const res = await fetch('/api/usuario/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      // Atualize a sessão para refletir o novo nome
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: values.nome
          }
        })
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!'
      })
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onSubmitSenha = async (values: z.infer<typeof senhaSchema>) => {
    setIsSaving(true)
    try {
      // Enviar dados da senha para a API
      const res = await fetch('/api/usuario/senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao atualizar senha')
      }

      // Limpar o formulário
      senhaForm.reset({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      })
      
      setAlterandoSenha(false)

      toast({
        title: 'Sucesso',
        description: 'Senha atualizada com sucesso!'
      })
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar senha',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setAvatarFile(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    
    setUploadingAvatar(true)
    try {
      // Converter para base64
      const reader = new FileReader()
      reader.readAsDataURL(avatarFile)
      
      reader.onload = async () => {
        const base64data = reader.result
        
        // Enviar para a API
        const res = await fetch('/api/usuario/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar: base64data }),
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Erro ao atualizar avatar')
        }
        
        const data = await res.json()
        
        // Atualizar avatar na sessão
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              image: data.avatar
            }
          })
        }
        
        toast({
          title: 'Sucesso',
          description: 'Avatar atualizado com sucesso!'
        })
        
        setAvatarFile(null)
        setUploadingAvatar(false)
      }
    } catch (error: unknown) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar avatar',
        variant: 'destructive'
      })
      setUploadingAvatar(false)
    }
  }

  const removerAvatarPreview = () => {
    setAvatarFile(null)
    setAvatarPreview(session?.user?.image || null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Meu Perfil"
          description="Gerencie suas informações pessoais"
        />
        
        <Separator />
        
        <div className="grid grid-cols-3 gap-6">
          {/* Avatar e informações básicas */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Sua foto será exibida em seu perfil e nas reservas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
              
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarPreview || session?.user?.image || undefined} />
                  <AvatarFallback className="text-3xl">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {avatarFile && (
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    onClick={removerAvatarPreview}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {avatarFile ? (
                <Button 
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="w-full"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Salvar Foto
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Alterar Foto
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Formulário principal */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...perfilForm}>
                <form 
                  id="perfil-form" 
                  onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} 
                  className="space-y-4 grid grid-cols-2 gap-4"
                >
                  <FormField
                    control={perfilForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted p-2 rounded-l-md">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input 
                              placeholder="Seu nome completo" 
                              className="rounded-l-none"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={perfilForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu.email@exemplo.com" 
                            {...field} 
                            disabled
                          />
                        </FormControl>
                        <FormDescription>
                          O email não pode ser alterado
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={perfilForm.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(99) 99999-9999" 
                            value={field.value}
                            onChange={(e) => {
                              // Aplicar máscara de telefone manualmente
                              const value = e.target.value
                                .replace(/\D/g, '') // Remove caracteres não numéricos
                                .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses em volta dos dois primeiros dígitos
                                .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen depois de 5 dígitos
                                .replace(/(-\d{4})\d+?$/, '$1'); // Limita a 11 dígitos
                              
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Formato: (99) 99999-9999
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={perfilForm.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="bg-muted p-2 rounded-l-md">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input 
                              placeholder="000.000.000-00" 
                              className="rounded-l-none"
                              value={field.value}
                              onChange={(e) => {
                                // Aplicar máscara de CPF manualmente
                                const value = e.target.value
                                  .replace(/\D/g, '') // Remove caracteres não numéricos
                                  .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os primeiros 3 dígitos
                                  .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os próximos 3 dígitos
                                  .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca hífen antes dos últimos 2 dígitos
                                  .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 11 dígitos
                                
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => perfilForm.reset()}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                form="perfil-form"
                disabled={isSaving || !perfilForm.formState.isDirty}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Formulário de senha */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alterandoSenha ? (
                <Form {...senhaForm}>
                  <form 
                    id="senha-form" 
                    onSubmit={senhaForm.handleSubmit(onSubmitSenha)} 
                    className="space-y-4 grid grid-cols-3 gap-4"
                  >
                    <FormField
                      control={senhaForm.control}
                      name="senhaAtual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Atual</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="bg-muted p-2 rounded-l-md">
                                <Key className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input 
                                placeholder="Digite sua senha atual" 
                                type="password"
                                className="rounded-l-none"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={senhaForm.control}
                      name="novaSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite sua nova senha" 
                              type="password"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Mínimo de 6 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={senhaForm.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Confirme sua nova senha" 
                              type="password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setAlterandoSenha(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Alterar minha senha
                  </Button>
                </div>
              )}
            </CardContent>
            {alterandoSenha && (
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setAlterandoSenha(false)
                    senhaForm.reset()
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  form="senha-form"
                  disabled={isSaving || !senhaForm.formState.isDirty}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : 'Atualizar Senha'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

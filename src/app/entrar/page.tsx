'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Facebook, Github, Mail as Google } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    if (status === 'authenticated' && session) {
      // Redirecionar com base no tipo de usuário
      if (session.user?.role === 'admin') {
        router.push('/dashboard/admin')
      } else if (session.user?.role === 'espaco') {
        router.push('/dashboard/espaco')
      } else if (session.user?.role === 'usuario') {
        router.push('/dashboard/usuario')
      } else {
        // Caso não tenha role específico, redirecionar para dashboard padrão
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  // Se estiver carregando ou já autenticado, mostrar tela de carregamento
  if (status === 'loading' || status === 'authenticated') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
    </div>
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const senha = formData.get("senha") as string

    try {
      // Tentar login como admin
      const result = await signIn("credentials", {
        email,
        senha,
        role: "admin",
        redirect: false,
        callbackUrl: "/dashboard/admin"
      })

      if (result?.ok) {
        router.push('/dashboard/admin')
        return
      }

      // Se não for admin, tentar como espaço
      const resultEspaco = await signIn("credentials", {
        email,
        senha,
        role: "espaco",
        redirect: false,
        callbackUrl: "/dashboard/espaco"
      })

      if (resultEspaco?.ok) {
        router.push('/dashboard/espaco')
        return
      }

      // Se não for espaço, tentar como usuário
      const resultUsuario = await signIn("credentials", {
        email,
        senha,
        role: "usuario",
        redirect: false,
        callbackUrl
      })

      if (resultUsuario?.ok) {
        router.push(callbackUrl)
        return
      }

      setError("Email ou senha inválidos")
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError("Ocorreu um erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Dezko
            </h1>
          </Link>

          <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-600 mb-8">
            Entre com suas credenciais para acessar sua conta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <Input
                name="email"
                type="email"
                required
                disabled={loading}
                placeholder="seu@email.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Input
                name="senha"
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  disabled={loading}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                />
                <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
              </label>
              <Link href="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-700">
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" className="w-full">
                <Google className="w-5 h-5 mr-2" />
                  Google
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-8">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-blue-600 hover:text-blue-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Blue Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12"
      >
        <div className="max-w-lg text-white">
          <h3 className="text-4xl font-bold mb-6">
            Transforme seu negócio com os melhores espaços
          </h3>
          <p className="text-blue-100 text-lg mb-8">
            Acesse sua conta para gerenciar seus espaços, agendamentos e preferências. 
            Tenha acesso a recursos exclusivos e ofertas especiais.
          </p>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                🏢
              </div>
              <div>
                <h4 className="font-semibold mb-1">Espaços Premium</h4>
                <p className="text-blue-100">Acesso aos melhores espaços comerciais</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                📅
              </div>
              <div>
                <h4 className="font-semibold mb-1">Agendamento Fácil</h4>
                <p className="text-blue-100">Reserve espaços com poucos cliques</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

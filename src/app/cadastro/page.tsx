'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { NumericFormat, PatternFormat } from 'react-number-format'
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Building2, Store, Users, User, MapPin, Mail, Lock, Phone, FileText, Home, MapPinned, CheckCircle2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interfaces para os dados da API do IBGE
interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export default function CadastroPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState<"espaco" | null>("espaco")
  const [etapa, setEtapa] = useState(1)
  const [tipoDocumento, setTipoDocumento] = useState<"cnpj" | "cpf">("cnpj")
  
  // Estados para o seletor hierárquico
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("") 
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("") 
  const [carregandoEstados, setCarregandoEstados] = useState(false)
  const [carregandoCidades, setCarregandoCidades] = useState(false)
  const [erroBusca, setErroBusca] = useState("")  

  // Formulário Cliente
  const [formCliente, setFormCliente] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cpf: "",
  })
  
  const [senhaErro, setSenhaErro] = useState("")

  async function handleSubmitEspaco(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const senha = formData.get("senha") as string
    const confirmarSenha = formData.get("confirmarSenha") as string
    const telefone = formData.get("telefone") as string
    const cnpj = tipoDocumento === "cnpj" ? formData.get("documento") as string : ""
    const cpf = tipoDocumento === "cpf" ? formData.get("documento") as string : ""
    const endereco = formData.get("endereco") as string
    const cidade = formData.get("cidade") as string
    const estado = formData.get("estado") as string
    const cep = formData.get("cep") as string
    
    // Verificar se as senhas são iguais
    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/cadastro/espaco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          telefone: telefone.replace(/\D/g, ''),
          cnpj: tipoDocumento === "cnpj" ? cnpj.replace(/\D/g, '') : null,
          cpf: tipoDocumento === "cpf" ? cpf.replace(/\D/g, '') : null,
          endereco,
          cidade,
          estado,
          cep: cep.replace(/\D/g, ''),
          descricao: '',
          horarioAbertura: '08:00',
          horarioFechamento: '18:00',
          capacidade: 10,
          preco: 0,
          fotos: [],
          amenidades: []
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      router.push('/entrar')
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao fazer o cadastro")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSenhaErro("")
    setLoading(true)
    
    // Verificar se as senhas são iguais
    if (formCliente.senha !== formCliente.confirmarSenha) {
      setSenhaErro("As senhas não coincidem")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/cadastro/cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formCliente.nome,
          email: formCliente.email,
          senha: formCliente.senha,
          telefone: formCliente.telefone.replace(/\D/g, ''),
          cpf: formCliente.cpf.replace(/\D/g, ''),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      router.push('/entrar')
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao fazer o cadastro")
    } finally {
      setLoading(false)
    }
  }

  // Controla a atualização do formulário do cliente
  function handleClienteFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormCliente(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Busca os estados da API do IBGE
  useEffect(() => {
    async function buscarEstados() {
      setCarregandoEstados(true)
      setErroBusca("")
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        if (!response.ok) {
          throw new Error('Falha ao carregar os estados')
        }
        const data = await response.json()
        setEstados(data)
      } catch (error) {
        console.error('Erro ao buscar estados:', error)
        setErroBusca("Não foi possível carregar os estados. Tente novamente.")
      } finally {
        setCarregandoEstados(false)
      }
    }

    buscarEstados()
  }, [])

  // Busca as cidades quando um estado é selecionado
  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([])
      setCidadeSelecionada("")
      return
    }

    async function buscarCidades(uf: string) {
      setCarregandoCidades(true)
      setErroBusca("")
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
        if (!response.ok) {
          throw new Error('Falha ao carregar as cidades')
        }
        const data = await response.json()
        setCidades(data)
      } catch (error) {
        console.error('Erro ao buscar cidades:', error)
        setErroBusca("Não foi possível carregar as cidades. Tente novamente.")
      } finally {
        setCarregandoCidades(false)
      }
    }

    buscarCidades(estadoSelecionado)
  }, [estadoSelecionado])

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    tap: { scale: 0.98 }
  }

  // Renderização da seleção de tipo de usuário
  const renderSelecaoTipoUsuario = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center space-y-6"
    >
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
        Bem-vindo à Dezko
      </h1>
      <p className="text-gray-600 text-lg">
        Crie sua conta para começar
      </p>
      
      <div className="flex justify-center mt-8">
        <motion.div 
          className="relative rounded-xl w-full max-w-md p-6 flex flex-col items-center justify-center gap-4 border-2 border-indigo-500 bg-indigo-50"
          variants={itemVariants}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 text-indigo-500"
          >
            <CheckCircle2 size={24} />
          </motion.div>
          <motion.div 
            className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Building2 size={42} />
          </motion.div>
          <h2 className="text-xl font-semibold">Cadastrar conta</h2>
          <p className="text-gray-500 text-center text-sm">Para quem tem espaços e quer alugá-los</p>
        </motion.div>
      </div>

      <motion.div 
        variants={itemVariants}
        className="mt-8"
      >
        <Button 
          className="w-full md:w-auto px-8"
          size="lg"
          onClick={() => setEtapa(2)}
        >
          Continuar
        </Button>
      </motion.div>
    </motion.div>
  )

  // Formulário de cadastro para clientes
  const renderFormularioCliente = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setEtapa(1)} 
          className="mr-2"
        >
          Voltar
        </Button>
        <h2 className="text-xl font-semibold flex items-center">
          <Building2 className="mr-2 text-blue-500" size={20} />
          Cadastrar conta
        </h2>
      </div>

      <form onSubmit={handleSubmitCliente} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <Input
              id="nome"
              name="nome"
              value={formCliente.nome}
              onChange={handleClienteFormChange}
              required
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formCliente.email}
              onChange={handleClienteFormChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <Input
              id="senha"
              name="senha"
              type="password"
              value={formCliente.senha}
              onChange={handleClienteFormChange}
              required
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <Input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              value={formCliente.confirmarSenha}
              onChange={handleClienteFormChange}
              required
              placeholder="••••••••"
            />
            {senhaErro && <p className="text-red-500 text-xs mt-1">{senhaErro}</p>}
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <PatternFormat
              id="telefone"
              name="telefone"
              format="(##) #####-####"
              mask="_"
              value={formCliente.telefone}
              onValueChange={(values) => {
                setFormCliente(prev => ({
                  ...prev,
                  telefone: values.value
                }))
              }}
              required
              placeholder="(11) 99999-9999"
              customInput={Input}
            />
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <PatternFormat
              id="cpf"
              name="cpf"
              format="###.###.###-##"
              mask="_"
              value={formCliente.cpf}
              onValueChange={(values) => {
                setFormCliente(prev => ({
                  ...prev,
                  cpf: values.value
                }))
              }}
              required
              placeholder="000.000.000-00"
              customInput={Input}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>

        <div className="text-center text-sm text-gray-500 mt-4">
          Já tem uma conta? <Link href="/entrar" className="text-blue-600 hover:underline">Entrar</Link>
        </div>
      </form>
    </motion.div>
  )

  // Formulário de cadastro para espaços
  const renderFormularioEspaco = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">
          <Building2 className="mr-2 text-indigo-500" size={20} />
          Cadastro Dezko
        </h2>
      </div>

      <form onSubmit={handleSubmitEspaco} className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de usuário
            </label>
            <Input
              id="nome"
              name="nome"
              required
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <Input
              id="senha"
              name="senha"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <Input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <PatternFormat
              id="telefone"
              name="telefone"
              format="(##) #####-####"
              mask="_"
              required
              placeholder="(11) 99999-9999"
              customInput={Input}
            />
          </div>

          <div>
            <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button 
                type="button"
                variant={tipoDocumento === "cnpj" ? "default" : "outline"}
                onClick={() => setTipoDocumento("cnpj")}
                className="flex items-center justify-center"
              >
                CNPJ
              </Button>
              <Button 
                type="button"
                variant={tipoDocumento === "cpf" ? "default" : "outline"}
                onClick={() => setTipoDocumento("cpf")}
                className="flex items-center justify-center"
              >
                CPF
              </Button>
            </div>
            {tipoDocumento === "cnpj" ? (
              <PatternFormat
                id="documento"
                name="documento"
                format="##.###.###/####-##"
                mask="_"
                required
                placeholder="00.000.000/0000-00"
                customInput={Input}
              />
            ) : (
              <PatternFormat
                id="documento"
                name="documento"
                format="###.###.###-##"
                mask="_"
                required
                placeholder="000.000.000-00"
                customInput={Input}
              />
            )}
          </div>

          <div>
            <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <PatternFormat
              id="cep"
              name="cep"
              format="#####-###"
              mask="_"
              required
              placeholder="00000-000"
              customInput={Input}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <Input
              id="endereco"
              name="endereco"
              required
              placeholder="Rua, número, complemento"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            {carregandoEstados ? (
              <div className="flex items-center space-x-2 h-10">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Carregando estados...</span>
              </div>
            ) : (
              <Select
                value={estadoSelecionado}
                onValueChange={(valor) => {
                  setEstadoSelecionado(valor);
                  setCidadeSelecionada("");
                }}
              >
                <SelectTrigger id="estado" name="estado" className="w-full">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.sigla}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            {carregandoCidades ? (
              <div className="flex items-center space-x-2 h-10">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Carregando cidades...</span>
              </div>
            ) : (
              <Select
                value={cidadeSelecionada}
                onValueChange={setCidadeSelecionada}
                disabled={!estadoSelecionado || cidades.length === 0}
              >
                <SelectTrigger id="cidade" name="cidade" className="w-full">
                  <SelectValue placeholder={estadoSelecionado ? "Selecione a cidade" : "Selecione um estado primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/entrar" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </form>
      </motion.div>
    )

  // Renderiza o componente principal baseado na etapa atual
  return (
    <div className="container max-w-4xl mx-auto p-4 py-10">
      <Card>
        <CardContent className="p-6 md:p-8">
          {etapa === 1 && renderSelecaoTipoUsuario()}
          {etapa === 2 && renderFormularioEspaco()}
        </CardContent>
      </Card>
    </div>
  )
}

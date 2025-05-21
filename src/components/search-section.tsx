'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Poppins } from 'next/font/google'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Typewriter from 'typewriter-effect'

interface Estado {
  id: number
  sigla: string
  nome: string
}

interface Cidade {
  id: number
  nome: string
}

interface Categoria {
  id: string
  nome: string
  slug: string
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export function SearchSection() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState("")
  const [cidadeSelecionada, setCidadeSelecionada] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")

  // Buscar estados da API do IBGE
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(response => response.json())
      .then(data => {
        setEstados(data.map((estado: any) => ({
          id: estado.id,
          sigla: estado.sigla,
          nome: estado.nome
        })))
      })
  }, [])

  // Buscar cidades quando um estado é selecionado
  useEffect(() => {
    if (estadoSelecionado) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios?orderBy=nome`)
        .then(response => response.json())
        .then(data => {
          setCidades(data.map((cidade: any) => ({
            id: cidade.id,
            nome: cidade.nome
          })))
        })
    } else {
      setCidades([])
    }
  }, [estadoSelecionado])

  // Buscar categorias do banco
  useEffect(() => {
    fetch("/api/categorias")
      .then(response => response.json())
      .then(data => {
        setCategorias(data)
      })
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Buscar estado e cidade pelos nomes, não pelos IDs
    if (estadoSelecionado) {
      const estadoObj = estados.find(e => e.id.toString() === estadoSelecionado)
      if (estadoObj) {
        console.log("Estado selecionado:", estadoObj)
        params.append("estado", estadoObj.sigla) // Usar a sigla do estado (SP, RJ, etc)
      }
    }
    
    if (cidadeSelecionada) {
      const cidadeObj = cidades.find(c => c.id.toString() === cidadeSelecionada)
      if (cidadeObj) {
        console.log("Cidade selecionada:", cidadeObj)
        params.append("cidade", cidadeObj.nome) // Usar o nome da cidade
      }
    }
    
    if (categoriaSelecionada) params.append("categoria", categoriaSelecionada)
    
    console.log("Parâmetros de busca:", Object.fromEntries(params.entries()))
    
    // Redirecionar para a página de espaços
    window.location.href = `/espacos?${params.toString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-12"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className={`${poppins.className} text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight`}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
            Encontre o Espaço Perfeito
          </span>
          <br />
          <div className="h-20 md:h-24 flex items-center justify-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
              <Typewriter
                options={{
                  strings: ['Para Seu Negócio', 'Para Seus Eventos', 'Para Suas Reuniões'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 50,
                  wrapperClassName: `${poppins.className} text-4xl md:text-5xl lg:text-6xl font-bold`,
                }}
              />
            </span>
          </div>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`${poppins.className} text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-6`}
        >
          A maior plataforma de locação de espaços corporativos do Brasil. 
          Salas comerciais, coworkings e escritórios com{' '}
          <span className="text-blue-600 font-semibold">flexibilidade</span> e{' '}
          <span className="text-blue-600 font-semibold">praticidade</span>.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 p-6 rounded-3xl shadow-xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={estadoSelecionado} onValueChange={setEstadoSelecionado}>
              <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-900/50 border-0 rounded-2xl">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(estado => (
                  <SelectItem key={estado.id} value={estado.id.toString()}>
                    {estado.nome} ({estado.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cidadeSelecionada} onValueChange={setCidadeSelecionada} disabled={!estadoSelecionado}>
              <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-900/50 border-0 rounded-2xl">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                {cidades.map(cidade => (
                  <SelectItem key={cidade.id} value={cidade.id.toString()}>
                    {cidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
              <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-900/50 border-0 rounded-2xl">
                <SelectValue placeholder="Tipo de Espaço" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Search className="w-4 h-4" />
              Buscar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

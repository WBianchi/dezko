"use client"

import { useState, useEffect } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { ChevronDown, Filter, MapPin, Star, Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { EspacoCard } from "@/components/espaco-card"

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

interface Espaco {
  id: string
  nome: string
  descricao: string
  preco: number
  capacidade: number
  categoria: Categoria
  cidade: string
  estado: string
  avaliacao: number
  fotos: string[]
}

export default function EspacosPage() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState("")
  const [cidadeSelecionada, setCidadeSelecionada] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")
  const [precoRange, setPrecoRange] = useState([0, 10000])
  const [capacidadeRange, setCapacidadeRange] = useState([0, 1000])
  const [apenasDisponiveis, setApenasDisponiveis] = useState(true)
  const [carregandoParametros, setCarregandoParametros] = useState(true)
  
  // Carregar parâmetros da URL - depende do carregamento dos estados
  useEffect(() => {
    if (typeof window !== 'undefined' && estados.length > 0) {
      const params = new URLSearchParams(window.location.search)
      
      // Carregar filtros dos parâmetros da URL
      const estado = params.get('estado')
      const cidade = params.get('cidade')
      const categoria = params.get('categoria')
      
      console.log('Parâmetros da URL:', { estado, cidade, categoria })
      
      // Para o estado, precisamos encontrar o ID pela sigla
      if (estado) {
        const estadoObj = estados.find(e => e.sigla === estado)
        if (estadoObj) {
          console.log('Estado encontrado:', estadoObj)
          setEstadoSelecionado(estadoObj.id.toString())
          
          // Para a cidade, precisamos guardar para buscar depois que as cidades forem carregadas
          if (cidade) {
            // Guardar o nome da cidade para definir depois que as cidades forem carregadas
            sessionStorage.setItem('cidadeParaSelecionar', cidade)
          }
        } else {
          console.error('Estado não encontrado para a sigla:', estado)
          // Se não encontrou o estado, marca como finalizado o carregamento
          setCarregandoParametros(false)
        }
      } else {
        // Se não tem estado na URL, marca como finalizado o carregamento
        setCarregandoParametros(false)
      }
      
      if (categoria) setCategoriaSelecionada(categoria)
      
      // Carregar outros parâmetros opcionais
      const precoMin = params.get('precoMin')
      const precoMax = params.get('precoMax')
      const capacidadeMin = params.get('capacidadeMin')
      const capacidadeMax = params.get('capacidadeMax')
      const apenasDisp = params.get('apenasDisponiveis')
      
      if (precoMin && precoMax) {
        setPrecoRange([parseInt(precoMin), parseInt(precoMax)])
      }
      
      if (capacidadeMin && capacidadeMax) {
        setCapacidadeRange([parseInt(capacidadeMin), parseInt(capacidadeMax)])
      }
      
      if (apenasDisp === 'false') {
        setApenasDisponiveis(false)
      }
      
      setCarregandoParametros(false)
    }
  }, [])

  // Buscar estados da API do IBGE
  useEffect(() => {
    console.log('Buscando estados...')
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(response => response.json())
      .then(data => {
        const estadosCarregados = data.map((estado: any) => ({
          id: estado.id,
          sigla: estado.sigla,
          nome: estado.nome
        }))
        
        setEstados(estadosCarregados)
        console.log('Estados carregados:', estadosCarregados.length)
        
        // Verificar se há parâmetros na URL para processar após carregar estados
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const estadoURL = params.get('estado')
          
          if (estadoURL) {
            const estadoObj = estadosCarregados.find(e => e.sigla === estadoURL)
            if (estadoObj) {
              console.log('Estado encontrado na URL:', estadoObj)
              setEstadoSelecionado(estadoObj.id.toString())
            } else {
              setCarregandoParametros(false)
            }
          } else {
            setCarregandoParametros(false)
          }
        }
      })
  }, [])

  // Buscar cidades quando um estado é selecionado
  useEffect(() => {
    if (estadoSelecionado) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios?orderBy=nome`)
        .then(response => response.json())
        .then(data => {
          const cidadesCarregadas = data.map((cidade: any) => ({
            id: cidade.id,
            nome: cidade.nome
          }))
          
          setCidades(cidadesCarregadas)
          
          // Verificar se há uma cidade para selecionar
          const cidadeParaSelecionar = sessionStorage.getItem('cidadeParaSelecionar')
          if (cidadeParaSelecionar) {
            const cidadeObj = cidadesCarregadas.find(c => c.nome === cidadeParaSelecionar)
            if (cidadeObj) {
              console.log('Cidade encontrada:', cidadeObj)
              setCidadeSelecionada(cidadeObj.id.toString())
              // Limpar o storage
              sessionStorage.removeItem('cidadeParaSelecionar')
            }
          }
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

  // Buscar espaços com filtros
  useEffect(() => {
    if (carregandoParametros) {
      console.log('Aguardando carregamento de parâmetros...')
      return
    }
    
    const params = new URLSearchParams()
    
    // Converter IDs para valores corretos para a API
    if (estadoSelecionado) {
      const estadoObj = estados.find(e => e.id.toString() === estadoSelecionado)
      if (estadoObj) {
        console.log('Buscando com estado:', estadoObj.sigla)
        params.append("estado", estadoObj.sigla)
      }
    }
    
    if (cidadeSelecionada) {
      const cidadeObj = cidades.find(c => c.id.toString() === cidadeSelecionada)
      if (cidadeObj) {
        console.log('Buscando com cidade:', cidadeObj.nome)
        params.append("cidade", cidadeObj.nome)
      }
    }
    
    if (categoriaSelecionada) params.append("categoria", categoriaSelecionada)
    
    // Só adiciona os filtros de preço se forem diferentes do padrão
    if (precoRange[0] !== 0) params.append("precoMin", precoRange[0].toString())
    if (precoRange[1] !== 10000) params.append("precoMax", precoRange[1].toString())
    
    // Só adiciona os filtros de capacidade se forem diferentes do padrão
    if (capacidadeRange[0] !== 0) params.append("capacidadeMin", capacidadeRange[0].toString())
    if (capacidadeRange[1] !== 1000) params.append("capacidadeMax", capacidadeRange[1].toString())
    
    // Só adiciona o filtro de disponibilidade se for false (padrão é true)
    if (!apenasDisponiveis) params.append("apenasDisponiveis", "false")

    fetch(`/api/espacos?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        setEspacos(data)
      })
  }, [estadoSelecionado, cidadeSelecionada, categoriaSelecionada, precoRange, capacidadeRange, apenasDisponiveis])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Espaços Disponíveis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Encontre o espaço perfeito para seu evento
            </p>
          </div>

          {/* Filtros Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <Select value={estadoSelecionado} onValueChange={setEstadoSelecionado}>
                    <SelectTrigger>
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

                  <Select 
                    value={cidadeSelecionada} 
                    onValueChange={setCidadeSelecionada}
                    disabled={!estadoSelecionado}
                  >
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Faixa de Preço</Label>
                    <Slider
                      value={precoRange}
                      onValueChange={setPrecoRange}
                      min={0}
                      max={10000}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>R$ {precoRange[0]}</span>
                      <span>R$ {precoRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Capacidade</Label>
                    <Slider
                      value={capacidadeRange}
                      onValueChange={setCapacidadeRange}
                      min={0}
                      max={1000}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>{capacidadeRange[0]} pessoas</span>
                      <span>{capacidadeRange[1]} pessoas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apenas-disponiveis"
                    checked={apenasDisponiveis}
                    onCheckedChange={setApenasDisponiveis}
                  />
                  <Label htmlFor="apenas-disponiveis">Apenas Disponíveis</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Filtros Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Select value={estadoSelecionado} onValueChange={setEstadoSelecionado}>
              <SelectTrigger className="w-[180px]">
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

            <Select 
              value={cidadeSelecionada} 
              onValueChange={setCidadeSelecionada}
              disabled={!estadoSelecionado}
            >
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Mais Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Filtros Avançados</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <Label>Faixa de Preço</Label>
                    <Slider
                      value={precoRange}
                      onValueChange={setPrecoRange}
                      min={0}
                      max={10000}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>R$ {precoRange[0]}</span>
                      <span>R$ {precoRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Capacidade</Label>
                    <Slider
                      value={capacidadeRange}
                      onValueChange={setCapacidadeRange}
                      min={0}
                      max={1000}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>{capacidadeRange[0]} pessoas</span>
                      <span>{capacidadeRange[1]} pessoas</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="apenas-disponiveis-desktop"
                      checked={apenasDisponiveis}
                      onCheckedChange={setApenasDisponiveis}
                    />
                    <Label htmlFor="apenas-disponiveis-desktop">Apenas Disponíveis</Label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Grid de Espaços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {espacos.map((espaco) => (
            <EspacoCard key={espaco.id} espaco={espaco} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}

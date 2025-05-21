'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, Plus, Pencil, Trash } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface Beneficio {
  id: string
  nome: string
}

interface Comissao {
  tipo: string
  valor: number
}

interface Plano {
  id: string
  nome: string
  preco: number
  descricao: string
  duracao: number
  limiteAgendas: number
  beneficios: Beneficio[]
  tipo: string
  comissao: Comissao
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPlano, setCurrentPlano] = useState<Plano>({
    id: '',
    nome: '',
    preco: 0,
    descricao: '',
    duracao: 30,
    limiteAgendas: 2,
    beneficios: [],
    tipo: 'basico',
    comissao: {
      tipo: 'percentage',
      valor: 10
    }
  })
  const [beneficio, setBeneficio] = useState('')

  useEffect(() => {
    // Aqui vamos carregar os planos do banco de dados
    const fetchPlanos = async () => {
      try {
        const response = await fetch('/api/admin/planos')
        if (response.ok) {
          const data = await response.json()
          setPlanos(data)
        } else {
          console.error('Erro ao carregar planos')
          // Dados de exemplo para desenvolvimento
          setPlanos([
            {
              id: '1',
              nome: 'Plano Básico',
              preco: 49.90,
              descricao: 'Ideal para quem está começando',
              duracao: 30,
              limiteAgendas: 2,
              beneficios: [
                { id: '1', nome: 'Acesso ao painel' },
                { id: '2', nome: 'Até 2 agendas' }
              ],
              tipo: 'basico',
              comissao: {
                tipo: 'percentage',
                valor: 10
              }
            },
            {
              id: '2',
              nome: 'Plano Premium',
              preco: 99.90,
              descricao: 'Para espaços em crescimento',
              duracao: 30,
              limiteAgendas: 5,
              beneficios: [
                { id: '1', nome: 'Acesso ao painel' },
                { id: '2', nome: 'Até 5 agendas' },
                { id: '3', nome: 'Relatórios avançados' }
              ],
              tipo: 'premium',
              comissao: {
                tipo: 'percentage',
                valor: 15
              }
            },
            {
              id: '3',
              nome: 'Plano Enterprise',
              preco: 299.90,
              descricao: 'Para grandes estabelecimentos',
              duracao: 30,
              limiteAgendas: 10,
              beneficios: [
                { id: '1', nome: 'Acesso ao painel' },
                { id: '2', nome: 'Até 10 agendas' },
                { id: '3', nome: 'Relatórios avançados' },
                { id: '4', nome: 'Suporte prioritário' }
              ],
              tipo: 'enterprise',
              comissao: {
                tipo: 'percentage',
                valor: 20
              }
            }
          ])
        }
      } catch (error) {
        console.error('Erro ao carregar planos', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanos()
  }, [])

  const handleAddBeneficio = () => {
    if (beneficio.trim() === '') {
      toast.error("Digite um benefício válido")
      return
    }
    
    setCurrentPlano({
      ...currentPlano,
      beneficios: [
        ...currentPlano.beneficios, 
        { id: Date.now().toString(), nome: beneficio.trim() }
      ]
    })
    setBeneficio('')
  }

  const handleRemoveBeneficio = (id: string) => {
    setCurrentPlano({
      ...currentPlano,
      beneficios: currentPlano.beneficios.filter(b => b.id !== id)
    })
  }

  const handleSavePlano = async () => {
    try {
      setIsLoading(true)
      
      // Validação básica - apenas o nome é obrigatório
      if (!currentPlano.nome.trim()) {
        toast.error("Erro ao salvar: Nome do plano é obrigatório")
        return
      }
      
      // Validação de valores numéricos
      if (isNaN(currentPlano.preco) || isNaN(currentPlano.duracao) || isNaN(currentPlano.limiteAgendas)) {
        toast.error("Erro ao salvar: Valores numéricos inválidos")
        return
      }
      
      // Validação da comissão - apenas se estiver definida
      if (currentPlano.comissao && isNaN(currentPlano.comissao.valor)) {
        toast.error("Erro ao salvar: Valor da comissão inválido")
        return
      }

      // Endereço da API para criar ou atualizar
      const url = isEditMode
        ? `/api/admin/planos/${currentPlano.id}`
        : '/api/admin/planos'
      
      // Método HTTP apropriado
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        // Garantir que a comissão está definida antes de enviar
      body: JSON.stringify({
        ...currentPlano,
        comissao: currentPlano.comissao || {
          tipo: 'percentage',
          valor: 0
        }
      })
      })

      if (response.ok) {
        // Atualizar a lista de planos
        if (isEditMode) {
          setPlanos(planos.map(plano => 
            plano.id === currentPlano.id ? currentPlano : plano
          ))
        } else {
          const newPlano = await response.json()
          setPlanos([...planos, newPlano])
        }

        toast.success(isEditMode 
          ? "Plano atualizado com sucesso" 
          : "Plano criado com sucesso")

        // Resetar o formulário e fechar o diálogo
        resetForm()
        setIsDialogOpen(false)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar plano')
      }
    } catch (error) {
      console.error('Erro ao salvar plano', error)
      toast.error("Ocorreu um erro ao salvar o plano")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePlano = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/planos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPlanos(planos.filter(plano => plano.id !== id))
        toast.success("Plano excluído com sucesso")
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir plano')
      }
    } catch (error) {
      console.error('Erro ao excluir plano', error)
      toast.error("Ocorreu um erro ao excluir o plano")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPlano = (plano: Plano) => {
    // Garantir que comissao existe
    const planoComComissao = {
      ...plano,
      comissao: plano.comissao || {
        tipo: 'percentage',
        valor: 0
      }
    }
    setCurrentPlano(planoComComissao)
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setCurrentPlano({
      id: '',
      nome: '',
      preco: 0,
      descricao: '',
      duracao: 30,
      limiteAgendas: 2,
      beneficios: [],
      tipo: 'basico',
      comissao: {
        tipo: 'percentage',
        valor: 0
      }
    })
    setIsEditMode(false)
    setBeneficio('')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Planos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie os planos de assinatura disponíveis para os espaços
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Faça as alterações necessárias no plano existente.' 
                  : 'Preencha os dados para criar um novo plano de assinatura.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome do Plano</Label>
                  <Input
                    id="nome"
                    value={currentPlano.nome}
                    onChange={(e) => setCurrentPlano({...currentPlano, nome: e.target.value})}
                    placeholder="Ex: Plano Básico"
                  />
                </div>
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentPlano.preco}
                    onChange={(e) => {
                      const valor = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setCurrentPlano({...currentPlano, preco: valor});
                    }}
                    placeholder="99.90"
                  />
                </div>
                <div>
                  <Label htmlFor="duracao">Duração (dias)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    value={currentPlano.duracao}
                    onChange={(e) => setCurrentPlano({...currentPlano, duracao: parseInt(e.target.value)})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="limiteAgendas">Limite de Agendas</Label>
                  <Input
                    id="limiteAgendas"
                    type="number"
                    value={currentPlano.limiteAgendas}
                    onChange={(e) => setCurrentPlano({...currentPlano, limiteAgendas: parseInt(e.target.value)})}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Plano</Label>
                  <select
                    id="tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentPlano.tipo}
                    onChange={(e) => setCurrentPlano({...currentPlano, tipo: e.target.value})}
                  >
                    <option value="basico">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="comissaoTipo">Tipo de Comissão</Label>
                  <select
                    id="comissaoTipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentPlano.comissao?.tipo || 'percentage'}
                    onChange={(e) => setCurrentPlano({...currentPlano, comissao: {...(currentPlano.comissao || {}), tipo: e.target.value}})}
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="comissaoValor">Valor da Comissão {(currentPlano.comissao?.tipo === 'percentage' || !currentPlano.comissao) ? '(%)' : '(R$)'}</Label>
                  <Input
                    id="comissaoValor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentPlano.comissao?.valor ?? 0}
                    onChange={(e) => {
                      const valor = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setCurrentPlano({...currentPlano, comissao: {...(currentPlano.comissao || {}), valor: valor}});
                    }}
                    placeholder={currentPlano.comissao?.tipo === 'percentage' ? "10" : "10.00"}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={currentPlano.descricao}
                    onChange={(e) => setCurrentPlano({...currentPlano, descricao: e.target.value})}
                    placeholder="Descreva as características deste plano"
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-2 block">Benefícios</Label>
                  <div className="flex mb-2">
                    <Input
                      value={beneficio}
                      onChange={(e) => setBeneficio(e.target.value)}
                      placeholder="Adicione um benefício"
                      className="mr-2"
                    />
                    <Button type="button" onClick={handleAddBeneficio}>
                      Adicionar
                    </Button>
                  </div>
                  {currentPlano.beneficios.length > 0 && (
                    <div className="border rounded-md p-3 mt-2">
                      <ul className="space-y-2">
                        {currentPlano.beneficios.map((b) => (
                          <li key={b.id} className="flex justify-between items-center">
                            <span>{b.nome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBeneficio(b.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSavePlano} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tabela" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tabela">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Planos</CardTitle>
              <CardDescription>
                Todos os planos disponíveis para os espaços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Limite de Agendas</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Carregando planos...
                      </TableCell>
                    </TableRow>
                  ) : planos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Nenhum plano encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    planos.map((plano) => (
                      <TableRow key={plano.id}>
                        <TableCell className="font-medium">{plano.nome}</TableCell>
                        <TableCell className="capitalize">{plano.tipo}</TableCell>
                        <TableCell>R$ {plano.preco.toFixed(2)}</TableCell>
                        <TableCell>{plano.limiteAgendas}</TableCell>
                        <TableCell>{plano.duracao} dias</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPlano(plano)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePlano(plano.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p className="text-center col-span-3">Carregando planos...</p>
            ) : planos.length === 0 ? (
              <p className="text-center col-span-3">Nenhum plano encontrado</p>
            ) : (
              planos.map((plano) => (
                <Card key={plano.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plano.nome}</CardTitle>
                        <CardDescription>{plano.descricao}</CardDescription>
                      </div>
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ {plano.preco.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Detalhes do plano:</p>
                      <div className="text-sm">
                        <span className="font-medium">Duração:</span> {plano.duracao} dias
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Limite de agendas:</span> {plano.limiteAgendas}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Tipo:</span> {plano.tipo.charAt(0).toUpperCase() + plano.tipo.slice(1)}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Benefícios:</p>
                      <ul className="text-sm space-y-2">
                        {plano.beneficios.map((b) => (
                          <li key={b.id} className="flex items-center">
                            <Checkbox id={`benefit-${b.id}`} checked={true} disabled className="mr-2" />
                            <label htmlFor={`benefit-${b.id}`}>{b.nome}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditPlano(plano)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDeletePlano(plano.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

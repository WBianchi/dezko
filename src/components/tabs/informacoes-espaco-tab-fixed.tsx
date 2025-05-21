'use client'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload, Clock, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const formSchema = z.object({
  categoria: z.string(),
  adicionais: z.array(z.string()),
  vantagens: z.array(z.string()),
  beneficios: z.array(z.string()),
  fotoPrincipal: z.string(),
  fotoCapa: z.string(),
  galeria: z.array(z.string()),
  horarioAbertura: z.string(),
  horarioFechamento: z.string(),
})

export function InformacoesEspacoTab() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [novoItem, setNovoItem] = useState("")
  const [tipoAtual, setTipoAtual] = useState<"adicionais" | "vantagens" | "beneficios">("adicionais")
  const [uploadType, setUploadType] = useState<"fotoPrincipal" | "fotoCapa" | "galeria" | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [categorias, setCategorias] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoria: "",
      adicionais: [],
      vantagens: [],
      beneficios: [],
      galeria: [],
      fotoPrincipal: "",
      fotoCapa: "",
      horarioAbertura: "09:00",
      horarioFechamento: "18:00",
    }
  })

  // Função para carregar as categorias do espaço
  const carregarCategorias = async () => {
    try {
      const res = await fetch('/api/espaco/categorias')
      if (res.ok) {
        const data = await res.json()
        setCategorias(data.todasCategorias)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      // Carregar dados do espaço
      fetch('/api/espaco')
        .then(res => res.json())
        .then(data => {
          form.reset({
            ...data,
            adicionais: Array.isArray(data.adicionais) ? data.adicionais.map((item: any) => item.nome) : [],
            vantagens: Array.isArray(data.vantagens) ? data.vantagens.map((item: any) => item.nome) : [],
            beneficios: Array.isArray(data.beneficios) ? data.beneficios.map((item: any) => item.nome) : [],
            galeria: Array.isArray(data.imagens) ? data.imagens : [],
            fotoPrincipal: data.fotoPrincipal || "",
            fotoCapa: data.fotoCapa || "",
            horarioAbertura: "09:00",
            horarioFechamento: "18:00",
          })
          setLoading(false)
        })
      
      // Carregar categorias
      carregarCategorias()
    }
  }, [session])

  // Função para fazer upload de imagem
  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (uploadType === null) return
    
    setUploadLoading(true)
    
    try {
      // Converter arquivo para base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const imageData = reader.result as string
        
        const res = await fetch('/api/espaco/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData,
            type: uploadType
          }),
        })
        
        if (!res.ok) {
          throw new Error('Erro ao fazer upload')
        }
        
        const data = await res.json()
        
        if (uploadType === 'galeria') {
          form.setValue('galeria', data.imagens)
        } else {
          form.setValue(uploadType, data[uploadType])
        }
        
        setUploadType(null)
        setUploadLoading(false)
        
        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso!"
        })
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      setUploadLoading(false)
      
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch('/api/espaco', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Erro ao atualizar informações')

      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso!"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar informações",
        variant: "destructive"
      })
    }
  }

  const adicionarItem = async (tipo: "adicionais" | "vantagens" | "beneficios") => {
    if (!novoItem) return
    
    try {
      const res = await fetch(`/api/espaco/${tipo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: novoItem }),
      })
      
      if (!res.ok) throw new Error(`Erro ao adicionar ${tipo}`)
      
      const data = await res.json()
      const items = form.getValues(tipo)
      form.setValue(tipo, [...items, novoItem])
      setNovoItem("")
      
      toast({
        title: "Sucesso",
        description: `${novoItem} adicionado com sucesso!`
      })
    } catch (error) {
      console.error(`Erro ao adicionar ${tipo}:`, error)
      toast({
        title: "Erro",
        description: `Erro ao adicionar ${tipo}`,
        variant: "destructive"
      })
    }
  }

  const removerItem = async (tipo: "adicionais" | "vantagens" | "beneficios", index: number, nome: string) => {
    try {
      const res = await fetch(`/api/espaco/${tipo}?nome=${encodeURIComponent(nome)}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error(`Erro ao remover ${tipo}`)
      
      const items = form.getValues(tipo)
      form.setValue(tipo, items.filter((_, i) => i !== index))
      
      toast({
        title: "Sucesso",
        description: `${nome} removido com sucesso!`
      })
    } catch (error) {
      console.error(`Erro ao remover ${tipo}:`, error)
      toast({
        title: "Erro",
        description: `Erro ao remover ${tipo}`,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <Form {...form}>
      {/* Input de arquivo oculto para upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
            e.target.value = ''
          }
        }}
      />
      
      {/* Diálogo de upload de imagem */}
      <Dialog open={uploadType !== null} onOpenChange={(open) => !open && setUploadType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadType === "fotoPrincipal" && "Alterar Foto Principal"}
              {uploadType === "fotoCapa" && "Alterar Foto de Capa"}
              {uploadType === "galeria" && "Adicionar à Galeria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Clique para selecionar uma imagem</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Coluna da Esquerda - Imagens */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Imagens do Espaço</h3>
                
                {/* Foto Principal */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fotoPrincipal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto Principal</FormLabel>
                        <div className="relative h-48 w-full bg-muted rounded-lg overflow-hidden">
                          {field.value ? (
                            <Image
                              src={field.value}
                              alt="Foto principal"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2"
                            onClick={() => setUploadType("fotoPrincipal")}
                          >
                            Alterar
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Foto Capa */}
                  <FormField
                    control={form.control}
                    name="fotoCapa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto de Capa</FormLabel>
                        <div className="relative h-32 w-full bg-muted rounded-lg overflow-hidden">
                          {field.value ? (
                            <Image
                              src={field.value}
                              alt="Foto de capa"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2"
                            onClick={() => setUploadType("fotoCapa")}
                          >
                            Alterar
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Galeria */}
                  <FormField
                    control={form.control}
                    name="galeria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Galeria de Imagens</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.isArray(field.value) && field.value.map((imageSrc, index) => (
                            <div key={index} className="relative h-24 w-full bg-muted rounded-lg overflow-hidden">
                              <Image
                                src={imageSrc}
                                alt={`Imagem ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/espaco/upload?type=galeria&index=${index}`, {
                                      method: 'DELETE',
                                    })
                                    
                                    if (!res.ok) {
                                      throw new Error('Erro ao remover imagem')
                                    }
                                    
                                    const data = await res.json()
                                    form.setValue('galeria', data.imagens)
                                    
                                    toast({
                                      title: "Sucesso",
                                      description: "Imagem removida com sucesso!"
                                    })
                                  } catch (error) {
                                    console.error('Erro ao remover imagem:', error)
                                    toast({
                                      title: "Erro",
                                      description: "Erro ao remover imagem",
                                      variant: "destructive"
                                    })
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            className="h-24 w-full flex flex-col items-center justify-center gap-2"
                            onClick={() => setUploadType("galeria")}
                          >
                            <Upload className="h-6 w-6" />
                            <span className="text-sm">Adicionar</span>
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Horários */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horário de Funcionamento
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horarioAbertura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abertura</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horarioFechamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fechamento</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita - Informações */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Categoria e Características</h3>
                
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Categoria do Espaço</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Select value={tipoAtual} onValueChange={(v: any) => setTipoAtual(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adicionais">Adicionais</SelectItem>
                          <SelectItem value="vantagens">Vantagens</SelectItem>
                          <SelectItem value="beneficios">Benefícios</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1 flex gap-2">
                        <Input 
                          placeholder={`Adicionar ${tipoAtual}`} 
                          value={novoItem} 
                          onChange={(e) => setNovoItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              adicionarItem(tipoAtual)
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={() => adicionarItem(tipoAtual)}
                          disabled={!novoItem}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {tipoAtual === "adicionais" && (
                      <FormField
                        control={form.control}
                        name="adicionais"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(field.value) && field.value.map((item, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {item}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => removerItem("adicionais", index, item)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              {Array.isArray(field.value) && field.value.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum adicional cadastrado</p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {tipoAtual === "vantagens" && (
                      <FormField
                        control={form.control}
                        name="vantagens"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(field.value) && field.value.map((item, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {item}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => removerItem("vantagens", index, item)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              {Array.isArray(field.value) && field.value.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhuma vantagem cadastrada</p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {tipoAtual === "beneficios" && (
                      <FormField
                        control={form.control}
                        name="beneficios"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(field.value) && field.value.map((item, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {item}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => removerItem("beneficios", index, item)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                              {Array.isArray(field.value) && field.value.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum benefício cadastrado</p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Salvar Informações
        </Button>
      </form>
    </Form>
  )
}

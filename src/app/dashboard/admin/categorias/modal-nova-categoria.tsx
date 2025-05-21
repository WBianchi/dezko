'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ModalNovaCategoriaProps {
  children: React.ReactNode
}

export function ModalNovaCategoria({ children }: ModalNovaCategoriaProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [icone, setIcone] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          descricao,
          icone,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar categoria")
      }

      toast({
        title: "Categoria criada com sucesso!",
        description: "A categoria foi adicionada à lista.",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao criar categoria",
        description: "Ocorreu um erro ao criar a categoria. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Ex: Coworking"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva a categoria..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icone">Ícone</Label>
            <Input
              id="icone"
              placeholder="Ex: building"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Criar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

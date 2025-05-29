'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Post } from '../columns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BlobImageUpload from '@/components/ui/blob-image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PostFormProps {
  initialData?: Post;
  categorias?: { id: string; nome: string }[];
  tags?: { id: string; nome: string }[];
  posts?: Post[];
  onClose?: () => void;
}

export function PostFormSimple({
  initialData,
  categorias = [],
  tags = [],
  posts = [],
  onClose
}: PostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    slug: initialData?.slug || '',
    descricao: initialData?.descricao || '',
    conteudo: initialData?.conteudo || '',
    foto: initialData?.foto || '',
    status: initialData?.status || 'RASCUNHO'
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map(tag => tag.id) || []
  )

  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialData?.categorias?.map(cat => cat.id) || []
  )

  const [selectedPosts, setSelectedPosts] = useState<string[]>(
    initialData?.postsRelacionados?.map(post => post.id) || []
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Gerar slug a partir do título
    if (name === 'titulo') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleStatusChange = (value: "RASCUNHO" | "PUBLICADO") => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }

  const handleCategoriaToggle = (catId: string) => {
    setSelectedCategorias(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) 
        : [...prev, catId]
    )
  }

  const handlePostToggle = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Construir dados para enviar para a API
      const postData = {
        ...formData,
        categoriaIds: selectedCategorias,
        tagIds: selectedTags,
        postsRelacionadosIds: selectedPosts
      }

      let response;
      if (initialData) {
        // Se tem dados iniciais, é uma atualização
        response = await fetch(`/api/admin/blog/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      } else {
        // Caso contrário, é uma criação
        response = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Ocorreu um erro ao salvar o post');
      }
      
      // Feedback para o usuário
      toast.success(initialData ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!')
      
      // Fechar o modal e atualizar a página
      if (onClose) onClose()
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Informações gerais</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="categorias">Categorias e Tags</TabsTrigger>
          <TabsTrigger value="relacionados">Posts relacionados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input 
                  id="titulo"
                  name="titulo"
                  placeholder="Título do post"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug"
                  name="slug"
                  placeholder="slug-do-post"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  URL do post (gerado automaticamente, mas pode ser editado)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao"
                  name="descricao"
                  placeholder="Breve descrição do post"
                  value={formData.descricao || ''}
                  onChange={handleChange}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Será exibida nos cards e listagens de posts
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="foto">Foto de capa</Label>
                <BlobImageUpload
                  value={formData.foto || null}
                  onChange={(url) => setFormData(prev => ({ ...prev, foto: url }))}
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                    <SelectItem value="PUBLICADO">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="conteudo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea 
              id="conteudo"
              name="conteudo"
              placeholder="Conteúdo do post"
              value={formData.conteudo}
              onChange={handleChange}
              className="min-h-[400px]"
              required
            />
          </div>
        </TabsContent>
        
        <TabsContent value="categorias" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Categorias</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione as categorias do post
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {categorias.length > 0 ? (
                    categorias.map((categoria) => (
                      <div key={categoria.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id={`categoria-${categoria.id}`}
                          checked={selectedCategorias.includes(categoria.id)}
                          onChange={() => handleCategoriaToggle(categoria.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`categoria-${categoria.id}`}
                          className="text-sm font-medium leading-none"
                        >
                          {categoria.nome}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria disponível.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Tags</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione as tags do post
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer hover:bg-primary/90",
                          selectedTags.includes(tag.id) 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background text-foreground"
                        )}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.nome}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma tag disponível.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Seção de SEO removida conforme solicitado */}
        
        <TabsContent value="relacionados" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Posts Relacionados</h3>
              <p className="text-sm text-muted-foreground">
                Selecione os posts relacionados
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {posts.filter(post => post.id !== initialData?.id).length > 0 ? (
                  posts
                    .filter(post => post.id !== initialData?.id)
                    .map((post) => (
                      <div key={post.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id={`post-${post.id}`}
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handlePostToggle(post.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`post-${post.id}`}
                          className="text-sm font-medium leading-none"
                        >
                          {post.titulo}
                        </label>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum outro post disponível para relacionar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t px-6 py-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Salvando...' : 'Salvar post'}
        </Button>
      </CardFooter>
    </form>
  )
}

export default PostFormSimple

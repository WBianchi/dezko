  'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BlobImageUpload } from '@/components/ui/blob-image-upload'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Importamos o tipo Post do arquivo de colunas
import { Post } from '../columns'

const formSchema = z.object({
  titulo: z.string().min(3, {
    message: 'O título deve ter pelo menos 3 caracteres',
  }),
  slug: z.string().min(3, {
    message: 'O slug deve ter pelo menos 3 caracteres',
  }),
  descricao: z.string().optional(),
  conteudo: z.string().min(10, {
    message: 'O conteúdo deve ter pelo menos 10 caracteres',
  }),
  foto: z.string().optional(),
  status: z.enum(['RASCUNHO', 'PUBLICADO']),
  pontuacaoSeo: z.coerce.number().int().min(0).max(100).default(0),
  categoriaIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  postsRelacionadosIds: z.array(z.string()).optional(),
})

type PostFormValues = z.infer<typeof formSchema>

interface PostFormProps {
  initialData?: Post;
  categorias?: { id: string; nome: string }[];
  tags?: { id: string; nome: string }[];
  posts?: Post[];
  onClose?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialData,
  categorias = [],
  tags = [],
  posts = [],
  onClose,
}) => {
  const [isPending, setIsPending] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map(tag => tag.id) || []
  )
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialData?.categorias?.map(cat => cat.id) || []
  )
  const [selectedPosts, setSelectedPosts] = useState<string[]>(
    initialData?.postsRelacionados?.map(post => post.id) || []
  )

  const title = initialData ? 'Editar post' : 'Criar post'
  const description = initialData ? 'Edite as informações do post' : 'Adicione um novo post ao blog'
  const action = initialData ? 'Salvar alterações' : 'Criar'
  const toastMessage = initialData ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!'

  const defaultValues = initialData ? {
    ...initialData,
    categoriaIds: initialData.categorias?.map(cat => cat.id) || [],
    tagIds: initialData.tags?.map(tag => tag.id) || [],
    postsRelacionadosIds: initialData.postsRelacionados?.map(post => post.id) || [],
  } : {
    titulo: '',
    slug: '',
    descricao: '',
    conteudo: '',
    foto: '',
    status: 'RASCUNHO' as const,
    pontuacaoSeo: 0,
    categoriaIds: [],
    tagIds: [],
    postsRelacionadosIds: [],
  }

  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  const onSubmit = async (data: PostFormValues) => {
    try {
      setIsPending(true)
      // Adicione os arrays selecionados aos dados
      data.categoriaIds = selectedCategorias
      data.tagIds = selectedTags
      data.postsRelacionadosIds = selectedPosts

      // API endpoint para criar/atualizar o post
      const url = initialData 
        ? `/api/admin/blog/${initialData.id}` 
        : '/api/admin/blog'
        
      const response = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Algo deu errado')
      }

      router.refresh()
      onClose?.()
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Algo deu errado')
    }
  }

  // Função para gerar slug a partir do título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    form.setValue('titulo', title)
    
    // Gerar slug se não tiver sido editado ou estiver vazio
    if (!form.getValues('slug') || form.getValues('slug') === form.formState.defaultValues?.slug) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
      
      form.setValue('slug', slug)
    }
  }

  // Função para manipular tags selecionadas
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }

  // Função para manipular categorias selecionadas
  const handleCategoriaToggle = (catId: string) => {
    setSelectedCategorias(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) 
        : [...prev, catId]
    )
  }

  // Função para manipular posts relacionados selecionados
  const handlePostToggle = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="geral">Informações gerais</TabsTrigger>
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="categorias">Categorias e Tags</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="relacionados">Posts relacionados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Título do post" 
                      {...field} 
                      onChange={handleTitleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-do-post" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL do post (gerado automaticamente, mas pode ser editado)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve descrição do post" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Será exibida nos cards e listagens de posts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto de capa</FormLabel>
                  <FormControl>
                    <BlobImageUpload 
                      value={field.value || null}
                      disabled={isPending} 
                      onChange={(url: string) => field.onChange(url)}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Imagem principal do post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    disabled={isPending} 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                      <SelectItem value="PUBLICADO">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="conteudo" className="space-y-4">
            <FormField
              control={form.control}
              name="conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conteúdo do post" 
                      {...field} 
                      className="min-h-[400px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="categorias" className="space-y-4">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <FormLabel className="text-base">Categorias</FormLabel>
                  <FormDescription className="mb-4">
                    Selecione as categorias do post
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2">
                    {categorias.length > 0 ? (
                      categorias.map((categoria) => (
                        <div key={categoria.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`categoria-${categoria.id}`}
                            checked={selectedCategorias.includes(categoria.id)}
                            onCheckedChange={() => handleCategoriaToggle(categoria.id)}
                          />
                          <label
                            htmlFor={`categoria-${categoria.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {categoria.nome}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma categoria disponível.{' '}
                        <Link href="/dashboard/admin/blog/categorias" className="text-primary underline">
                          Criar categorias
                        </Link>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <FormLabel className="text-base">Tags</FormLabel>
                  <FormDescription className="mb-4">
                    Selecione as tags do post
                  </FormDescription>
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
                        Nenhuma tag disponível.{' '}
                        <Link href="/dashboard/admin/blog/tags" className="text-primary underline">
                          Criar tags
                        </Link>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4">
            <FormField
              control={form.control}
              name="pontuacaoSeo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação SEO (0-100)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      placeholder="Pontuação SEO" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Pontuação de otimização para motores de busca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="relacionados" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <FormLabel className="text-base">Posts Relacionados</FormLabel>
                <FormDescription className="mb-4">
                  Selecione os posts relacionados
                </FormDescription>
                <div className="grid gap-2">
                  {posts.filter(post => post.id !== initialData?.id).length > 0 ? (
                    posts
                      .filter(post => post.id !== initialData?.id)
                      .map((post) => (
                        <div key={post.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`post-${post.id}`}
                            checked={selectedPosts.includes(post.id)}
                            onCheckedChange={() => handlePostToggle(post.id)}
                          />
                          <label
                            htmlFor={`post-${post.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onClose?.()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default PostForm;

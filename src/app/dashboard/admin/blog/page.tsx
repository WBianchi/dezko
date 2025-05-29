'use client'

import { useState, useEffect } from 'react'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PostModal from './components/post-modal'
import { toast } from 'sonner'
// Importar o tipo PostStatus diretamente

// Defina interfaces para os dados
interface Post {
  id: string
  titulo: string
  slug: string
  descricao?: string | null
  conteudo: string
  foto?: string | null
  status: 'RASCUNHO' | 'PUBLICADO'
  autorId: string
  pontuacaoSeo: number
  createdAt: string
  updatedAt: string
  categorias?: Categoria[]
  tags?: Tag[]
  postsRelacionados?: Post[]
  categoriaIds?: string[]
  tagIds?: string[]
  postsRelacionadosIds?: string[]
}

interface Categoria {
  id: string
  nome: string
  slug: string
}

interface Tag {
  id: string
  nome: string
  slug: string
}

// Componentes
interface CellActionsProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const CellActions = ({ post, onEdit, onDelete }: CellActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 hover:bg-primary/10"
        onClick={() => onEdit(post)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(post)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </Button>
    </div>
  )
}

export default function BlogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined)
  const [posts, setPosts] = useState<Post[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  
  // Buscar dados do servidor
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar posts
        const postsResponse = await fetch('/api/admin/blog');
        if (!postsResponse.ok) {
          throw new Error('Falha ao carregar posts');
        }
        const postsData = await postsResponse.json();
        setPosts(postsData);

        // Buscar categorias
        const categoriasResponse = await fetch('/api/admin/blog/categorias');
        if (!categoriasResponse.ok) {
          throw new Error('Falha ao carregar categorias');
        }
        const categoriasData = await categoriasResponse.json();
        setCategorias(categoriasData);

        // Buscar tags
        const tagsResponse = await fetch('/api/admin/blog/tags');
        if (!tagsResponse.ok) {
          throw new Error('Falha ao carregar tags');
        }
        const tagsData = await tagsResponse.json();
        setTags(tagsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (post?: Post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingPost(undefined)
    setIsModalOpen(false)
    // Recarregar dados após fechar o modal para atualizar a tabela
    fetchPosts()
  }

  // Buscar posts novamente
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog');
      if (!response.ok) {
        throw new Error('Falha ao carregar posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Erro ao recarregar posts:', error);
      toast.error('Erro ao recarregar posts. Tente novamente mais tarde.');
    }
  };

  // Função para manipular ações nas linhas da tabela
  const handleRowAction = async (action: 'edit' | 'delete', post: Post) => {
    if (action === 'edit') {
      openModal(post)
    } else if (action === 'delete') {
      try {
        const response = await fetch(`/api/admin/blog/${post.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Falha ao excluir post');
        }
        
        toast.success(`Post "${post.titulo}" excluído com sucesso!`);
        // Atualizar a lista de posts após excluir
        fetchPosts();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o post');
      }
    }
  }

  // CellActions já está sendo usado nas colunas, não precisamos redefinir aqui

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Blog"
          description="Gerencie os posts do blog"
        />
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>
      <Separator />
      <DataTable 
        columns={columns.map(column => {
          if (column.id === 'actions') {
            return {
              ...column,
              cell: ({ row }: any) => {
                const post = row.original;
                return (
                  <CellActions 
                    post={post} 
                    onEdit={(post) => handleRowAction('edit', post)}
                    onDelete={(postId) => handleRowAction('delete', { ...post, id: postId })}
                  />
                );
              }
            };
          }
          return column;
        })} 
        data={posts} 
        searchKey="titulo"
      />
      
      <PostModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        editingPost={editingPost}
        categorias={categorias}
        tags={tags}
      />
    </div>
  )
}

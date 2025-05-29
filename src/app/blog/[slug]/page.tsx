import { prisma } from "@/lib/prisma"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarIcon, UserIcon, TagIcon, Share2Icon } from "lucide-react"
import { notFound } from "next/navigation"
import { Metadata } from "next"

// Formato da data: 20 de Março de 2023
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post não encontrado | Blog Dezko',
    };
  }

  return {
    title: `${post.titulo} | Blog Dezko`,
    description: post.descricao || post.conteudo.substring(0, 160),
    openGraph: {
      title: post.titulo,
      description: post.descricao || post.conteudo.substring(0, 160),
      images: post.foto ? [post.foto] : [],
    },
  };
}

async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: 'PUBLICADO'
      },
      include: {
        autor: {
          select: {
            id: true,
            nome: true
          }
        },
        categorias: {
          select: {
            id: true,
            nome: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            nome: true,
            slug: true
          }
        },
        postsRelacionados: {
          where: {
            status: 'PUBLICADO'
          },
          select: {
            id: true,
            titulo: true,
            slug: true,
            foto: true,
            descricao: true,
            createdAt: true
          }
        }
      }
    });
    
    return post;
  } catch (error) {
    console.error('Erro ao buscar post por slug:', error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      <div className="container mx-auto px-4 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs & Voltar */}
          <div className="mb-10 flex items-center justify-between">
            <Link href="/blog" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Voltar para o blog</span>
            </Link>
            
            <div className="flex gap-2">
              {post.categorias && post.categorias.map((categoria: any) => (
                <Badge key={categoria.id} variant="outline">
                  {categoria.nome}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Título e Meta */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              {post.titulo}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              
              {post.autor && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Por {post.autor.nome}</span>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  <div className="flex gap-1">
                    {post.tags.map((tag: any, index: number) => (
                      <span key={tag.id}>
                        {tag.nome}{index < post.tags.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Imagem de Capa */}
          {post.foto && (
            <div className="aspect-[16/9] relative overflow-hidden rounded-lg mb-12">
              <img 
                src={post.foto} 
                alt={post.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Conteúdo */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
            {/* Aqui renderizamos o conteúdo do post */}
            <div dangerouslySetInnerHTML={{ __html: post.conteudo }} />
          </div>
          
          {/* Compartilhar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-16">
            <div>
              <h3 className="text-lg font-semibold mb-1">Gostou deste conteúdo?</h3>
              <p className="text-muted-foreground">Compartilhe com seus colegas.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2Icon className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
          
          {/* Posts Relacionados */}
          {post.postsRelacionados && post.postsRelacionados.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Posts Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {post.postsRelacionados.map((relatedPost: any) => (
                  <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
                    <Card className="group overflow-hidden border-2 hover:border-blue-500 transition-all h-full">
                      <div className="aspect-[3/2] relative">
                        {relatedPost.foto ? (
                          <img 
                            src={relatedPost.foto}
                            alt={relatedPost.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                            <p className="text-muted-foreground">Sem imagem</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(relatedPost.createdAt)}
                        </p>
                        <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                          {relatedPost.titulo}
                        </h3>
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                          Ler artigo <ArrowUpRight className="ml-1 w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

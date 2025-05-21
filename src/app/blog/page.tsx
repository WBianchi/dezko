import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, Clock, User2, Tag, ChevronRight } from "lucide-react"

export default function Blog() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Blog Dezko
            </Badge>
            <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-6">
              Insights e Novidades
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Descubra dicas, tendências e histórias sobre espaços compartilhados e coworking
            </p>
          </div>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input 
                type="text"
                placeholder="Buscar artigos..."
                className="w-full pl-12 h-12 text-lg rounded-2xl border-2 hover:border-blue-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                Coworking
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                Produtividade
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                Home Office
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                Empreendedorismo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-400/90 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="aspect-[2/1] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60" 
                alt="Coworking moderno"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-4 text-white/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">5 min de leitura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User2 className="w-4 h-4" />
                    <span className="text-sm">Por Maria Silva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">Coworking</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  Como Escolher o Espaço de Trabalho Ideal para sua Equipe
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-3xl">
                  Descubra os fatores essenciais para selecionar o ambiente perfeito que impulsionará 
                  a produtividade e criatividade do seu time.
                </p>
                <Button size="lg" variant="secondary" className="group">
                  Ler Artigo
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Posts Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map((post) => (
              <Card key={post} className="group overflow-hidden border-2 hover:border-blue-500 transition-all">
                <div className="aspect-[3/2] relative">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60" 
                    alt="Post thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">3 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">Produtividade</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                    10 Dicas para Aumentar sua Produtividade no Trabalho Remoto
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Aprenda estratégias práticas para otimizar seu tempo e melhorar seus resultados 
                    trabalhando de casa ou em espaços compartilhados.
                  </p>
                  <Button variant="ghost" className="group/btn">
                    Continuar Lendo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-blue-600 to-blue-400 border-0">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Receba Novidades no seu Email
                </h2>
                <p className="text-white/90 text-lg mb-0">
                  Inscreva-se para receber dicas exclusivas e novidades do mundo dos espaços compartilhados.
                </p>
              </div>
              <div className="w-full md:w-auto flex gap-4">
                <Input 
                  type="email"
                  placeholder="Seu melhor email"
                  className="h-12 min-w-[300px] bg-white/90 border-0"
                />
                <Button size="lg" variant="secondary">
                  Inscrever
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}

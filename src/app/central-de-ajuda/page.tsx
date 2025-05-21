import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, FileQuestion, MessageCircle, ShieldCheck, Wallet, Users, Search, ArrowRight } from "lucide-react"

export default function CentralDeAjuda() {
  return (
    <main className="min-h-screen">
      <Nav />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Como podemos ajudar?
          </h1>
          <p className="text-xl text-muted-foreground mt-6">
            Encontre respostas, guias e suporte para todas as suas dúvidas
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input 
            type="text"
            placeholder="Buscar ajuda..."
            className="w-full pl-12 h-14 text-lg rounded-2xl border-2 hover:border-blue-500 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Guias e Tutoriais</h3>
                  <p className="text-muted-foreground mb-6">
                    Aprenda a usar todas as funcionalidades da plataforma
                  </p>
                </div>
                <Button className="w-full group">
                  Ver guias
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <FileQuestion className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Dúvidas Frequentes</h3>
                  <p className="text-muted-foreground mb-6">
                    Respostas para as perguntas mais comuns
                  </p>
                </div>
                <Button className="w-full group">
                  Ver FAQ
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Suporte</h3>
                  <p className="text-muted-foreground mb-6">
                    Entre em contato com nossa equipe de suporte
                  </p>
                </div>
                <Button className="w-full group">
                  Falar com Suporte
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Segurança</h3>
                  <p className="text-muted-foreground mb-6">
                    Informações sobre segurança e privacidade
                  </p>
                </div>
                <Button className="w-full group">
                  Ver mais
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Pagamentos</h3>
                  <p className="text-muted-foreground mb-6">
                    Tudo sobre pagamentos e reembolsos
                  </p>
                </div>
                <Button className="w-full group">
                  Saiba mais
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Comunidade</h3>
                  <p className="text-muted-foreground mb-6">
                    Participe da nossa comunidade de usuários
                  </p>
                </div>
                <Button className="w-full group">
                  Participar
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-y-2">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold mb-4">Ainda precisa de ajuda?</h2>
              <p className="text-muted-foreground mb-6 md:mb-0">
                Nossa equipe está pronta para ajudar você com qualquer dúvida
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="group">
                Falar com Suporte
                <MessageCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

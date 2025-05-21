import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  DollarSign, 
  Users, 
  Rocket, 
  Award, 
  ChevronRight, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2
} from "lucide-react"

export default function Afiliados() {
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
              Programa de Afiliados
            </Badge>
            <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-6">
              Ganhe Dinheiro Indicando Espaços
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Seja um parceiro Dezko e lucre compartilhando os melhores espaços de trabalho
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="group">
                Começar Agora
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comissões Atrativas</h3>
              <p className="text-muted-foreground">
                Ganhe até 30% de comissão em cada reserva realizada através do seu link.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pagamento Rápido</h3>
              <p className="text-muted-foreground">
                Receba suas comissões em até 7 dias após a confirmação da reserva.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Suporte Dedicado</h3>
              <p className="text-muted-foreground">
                Equipe exclusiva para ajudar você a maximizar seus ganhos.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bônus Exclusivos</h3>
              <p className="text-muted-foreground">
                Ganhe bônus especiais ao atingir metas de indicações mensais.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece a Ganhar em 3 Passos</h2>
            <p className="text-xl text-muted-foreground">
              É fácil começar a ganhar dinheiro com a Dezko
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <Sparkles className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Cadastre-se</h3>
                <p className="text-muted-foreground">
                  Faça seu cadastro gratuito no programa de afiliados da Dezko.
                </p>
              </Card>
            </div>

            <div className="relative">
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <Building2 className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Indique Espaços</h3>
                <p className="text-muted-foreground">
                  Compartilhe seu link único com pessoas procurando espaços.
                </p>
              </Card>
            </div>

            <div className="relative">
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <DollarSign className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">Receba</h3>
                <p className="text-muted-foreground">
                  Ganhe comissões por cada reserva realizada através do seu link.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-blue-600 to-blue-400 border-0">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Por que ser um Afiliado Dezko?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Comissões Recorrentes</h3>
                      <p className="text-white/90">Ganhe em todas as renovações de reserva</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Dashboard Completo</h3>
                      <p className="text-white/90">Acompanhe seus ganhos em tempo real</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Materiais Prontos</h3>
                      <p className="text-white/90">Banners e textos para suas divulgações</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Treinamentos</h3>
                      <p className="text-white/90">Aprenda as melhores estratégias de divulgação</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="p-8 w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
                  <h3 className="text-2xl font-bold mb-2">Comece Agora</h3>
                  <p className="text-muted-foreground mb-6">
                    Cadastre-se gratuitamente e comece a ganhar com a Dezko
                  </p>
                  <Button size="lg" className="w-full group">
                    Criar Conta de Afiliado
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}

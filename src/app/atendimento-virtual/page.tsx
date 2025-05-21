import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessagesSquare, Headphones, MailQuestion, ShieldCheck, Clock, Rocket, Star } from "lucide-react"

export default function AtendimentoVirtual() {
  return (
    <main className="min-h-screen">
      <Nav />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Precisa de ajuda?
          </h1>
          <p className="text-xl text-muted-foreground mt-6">
            Escolha o melhor canal para entrar em contato com nossa equipe
          </p>
        </div>
      </div>

      {/* Canais de Atendimento */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <MessagesSquare className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Chat Online</h3>
                  <p className="text-muted-foreground">
                    Atendimento instantâneo com nossa equipe especializada
                  </p>
                </div>
                <Button size="lg" className="w-full group font-medium">
                  Iniciar Chat Agora
                  <Star className="ml-2 w-5 h-5 text-yellow-400" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Tempo médio de resposta: &lt; 5 minutos
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Central Telefônica</h3>
                  <p className="text-muted-foreground">
                    Fale diretamente com um de nossos especialistas
                  </p>
                </div>
                <Button size="lg" variant="outline" className="w-full group font-medium">
                  0800 123 4567
                </Button>
                <p className="text-sm text-muted-foreground">
                  Ligação gratuita de qualquer lugar do Brasil
                </p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <MailQuestion className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">E-mail</h3>
                  <p className="text-muted-foreground">
                    Para dúvidas que precisam de mais detalhes
                  </p>
                </div>
                <Button size="lg" variant="outline" className="w-full group font-medium">
                  contato@dezko.com.br
                </Button>
                <p className="text-sm text-muted-foreground">
                  Respondemos em até 24 horas úteis
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Informações */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Horário de Atendimento</h3>
                <p className="text-muted-foreground">Segunda a Sexta: 08h às 18h</p>
                <p className="text-muted-foreground">Sábado: 09h às 13h</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Chat online 24/7</p>
              </div>
            </div>

            <div className="flex items-start space-x-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Atendimento Seguro</h3>
                <p className="text-muted-foreground">
                  Suas informações estão protegidas com os mais altos padrões de segurança
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Certificado SSL</p>
              </div>
            </div>

            <div className="flex items-start space-x-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Resposta Rápida</h3>
                <p className="text-muted-foreground">
                  Nossa equipe está pronta para responder rapidamente suas dúvidas
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Média &lt; 5 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">98%</div>
              <div className="text-muted-foreground">Taxa de satisfação dos clientes</div>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">&lt; 5min</div>
              <div className="text-muted-foreground">Tempo médio de resposta</div>
            </div>
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">24/7</div>
              <div className="text-muted-foreground">Disponibilidade do chat</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

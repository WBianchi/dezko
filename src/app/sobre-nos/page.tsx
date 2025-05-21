import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Building2, Users2, Rocket, Target, Award, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SobreNos() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Quem Somos
            </Badge>
            <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-6">
              Dezko
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A Dezko é uma plataforma inovadora dedicada a conectar proprietários de espaços ociosos com profissionais liberais, 
              freelancers e pequenos empreendedores que precisam de um local temporário para trabalhar. Fundada com o objetivo de 
              promover a flexibilidade e a economia compartilhada, a Dezko oferece uma solução prática e acessível para quem 
              busca alugar espaços por hora, turno ou dia.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/planos">
                <Button size="lg" className="group">
                  Comece Agora
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/planos">
                <Button size="lg" variant="outline">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* O Que Fazemos Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-600">O Que Fazemos</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Na Dezko, facilitamos o processo de locação de espaços de trabalho. Nosso site permite que proprietários anunciem desde salas, 
            escritórios, oficinas, barbearias, galpões, garagens, até boxes, cadeiras, etc..., enquanto profissionais podem encontrar e 
            reservar esses espaços conforme suas necessidades específicas. Nossa plataforma é fácil de usar e reduz significativamente a 
            burocracia envolvida na locação tradicional, proporcionando uma experiência rápida e eficiente para ambas as partes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all group">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">+1000</h3>
            <p className="text-muted-foreground">Espaços Cadastrados</p>
          </Card>
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all group">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">+5000</h3>
            <p className="text-muted-foreground">Reservas Realizadas</p>
          </Card>
          <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all group">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">4.9/5</h3>
            <p className="text-muted-foreground">Avaliação dos Usuários</p>
          </Card>
        </div>
      </div>

      {/* Valores Section */}
      <div className="container mx-auto px-4 py-20 bg-blue-50 dark:bg-gray-900/50 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Nossos Valores
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nos move</h2>
            <p className="text-xl text-muted-foreground">
              Nossos princípios fundamentais que guiam todas as nossas ações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inovação</h3>
              <p className="text-muted-foreground">
                Estamos constantemente buscando novas maneiras de melhorar nossa plataforma e oferecer soluções que atendam às necessidades em constante evolução dos nossos usuários.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Users2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexibilidade</h3>
              <p className="text-muted-foreground">
                Acreditamos que a flexibilidade é essencial no mundo moderno. Oferecemos opções de locação que se adaptam às agendas e necessidades de nossos usuários, sem compromissos a longo prazo.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparência</h3>
              <p className="text-muted-foreground">
                Priorizamos a clareza e a honestidade em todas as nossas operações, garantindo que nossos usuários tenham todas as informações necessárias para tomar decisões informadas.
              </p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustentabilidade</h3>
              <p className="text-muted-foreground">
                Incentivamos a utilização eficiente de recursos ao promover o uso de espaços que, de outra forma, ficariam ociosos, contribuindo para um mundo mais sustentável.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <Card className="p-8 md:p-12 bg-gradient-to-r from-blue-600 to-blue-400 border-0 overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Nossa Missão
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    Nossa missão é transformar espaços ociosos em oportunidades de negócios, promovendo a flexibilidade e a acessibilidade no mercado de locação de espaços de trabalho. Queremos criar um ecossistema onde proprietários e locatários possam se conectar e prosperar juntos, facilitando o crescimento de pequenos negócios e profissionais autônomos.
                  </p>
                  <Link href="/planos">
                    <Button size="lg" variant="secondary" className="group">
                      Junte-se a Nós
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="w-full md:w-1/3 aspect-square relative">
                  <div className="absolute inset-0 bg-blue-400/20 backdrop-blur-xl rounded-2xl" />
                  <div className="absolute inset-4 bg-blue-500/20 backdrop-blur-xl rounded-xl" />
                  <div className="absolute inset-8 bg-blue-600/20 backdrop-blur-xl rounded-lg" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Informações Relevantes Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Informações Relevantes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Diferenciais</h2>
            <p className="text-xl text-muted-foreground">
              O que torna a Dezko especial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Fácil Acesso</h3>
              <p className="text-muted-foreground">Nossa plataforma é intuitiva e fácil de navegar, permitindo que usuários encontrem e reservem espaços de forma rápida e simples.</p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Variedade de Espaços</h3>
              <p className="text-muted-foreground">Oferecemos uma ampla gama de espaços para atender às diversas necessidades dos profissionais, desde salas de reunião e escritórios até oficinas e áreas de coworking.</p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Segurança e Confiança</h3>
              <p className="text-muted-foreground">Implementamos medidas rigorosas para garantir a segurança e a confiança de nossos usuários, incluindo avaliações e verificações de perfis.</p>
            </Card>

            <Card className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 hover:border-blue-500 transition-all h-full">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Suporte ao Cliente</h3>
              <p className="text-muted-foreground">Nossa equipe de suporte está sempre pronta para ajudar, garantindo que nossos usuários tenham uma experiência tranquila e satisfatória na plataforma.</p>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Visão Section */}
      <div className="container mx-auto px-4 py-20 bg-blue-50 dark:bg-gray-900/50 rounded-3xl">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex">
            Nossa Visão
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Para onde vamos</h2>
          
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 border-blue-200 p-8 rounded-xl max-w-3xl mx-auto">
            <p className="text-xl text-muted-foreground mb-0 leading-relaxed">
              A Dezko aspira ser a plataforma líder no mercado de locação flexível de espaços de trabalho, reconhecida por sua inovação, confiabilidade e impacto positivo na comunidade de profissionais autônomos e proprietários de imóveis.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contato Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-200 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex">
            Contato
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Fale Conosco</h2>
          
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-2 border-blue-200 p-8 rounded-xl max-w-3xl mx-auto">
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Para saber mais sobre a Dezko ou para qualquer dúvida, entre em contato conosco através do nosso site ou redes sociais. Estamos sempre disponíveis para ajudar e fornecer todas as informações que você precisar.
            </p>
            <div className="flex justify-center">
              <Link href="/atendimento-virtual">
                <Button size="lg" className="group">
                  Entre em Contato
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

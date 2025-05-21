import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { MessagesSquare, Search, CreditCard, Calendar, ShieldCheck, Star, ArrowRight, HelpCircle, Mail } from "lucide-react"

export default function DuvidasFrequentes() {
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
            Encontre respostas para as perguntas mais comuns sobre a Dezko
          </p>
        </div>
      </div>

      {/* Categorias e Perguntas */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="geral" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="geral"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-4 h-auto"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Search className="w-6 h-6" />
                  <span>Geral</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="pagamentos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-4 h-auto"
              >
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard className="w-6 h-6" />
                  <span>Pagamentos</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="reservas"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-4 h-auto"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span>Reservas</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="seguranca"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-4 h-auto"
              >
                <div className="flex flex-col items-center space-y-2">
                  <ShieldCheck className="w-6 h-6" />
                  <span>Segurança</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Como funciona o aluguel de espaços na Dezko?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    A Dezko é uma plataforma que conecta pessoas que buscam espaços para alugar com proprietários que têm espaços disponíveis. Você pode pesquisar, comparar e reservar diversos tipos de espaços diretamente pela plataforma.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Como faço para anunciar meu espaço?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    Para anunciar seu espaço, basta criar uma conta como proprietário, preencher as informações do seu espaço, adicionar fotos e definir a disponibilidade e preços. Nossa equipe fará uma revisão e seu espaço estará disponível para reservas.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="pagamentos" className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-3" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Quais são as formas de pagamento aceitas?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    Aceitamos pagamentos via cartão de crédito, débito e PIX através da plataforma Mercado Pago, garantindo segurança e praticidade nas transações.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="reservas" className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-4" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Como funciona o processo de reserva?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    Após escolher o espaço desejado, selecione a data e horário disponíveis, faça o pagamento e pronto! Você receberá um e-mail de confirmação com todas as informações da sua reserva.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Qual é a política de cancelamento?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    Nossa política de cancelamento varia de acordo com o espaço e o prazo. Em geral, cancelamentos com mais de 48 horas de antecedência recebem reembolso total. Consulte as condições específicas de cada espaço.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="seguranca" className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-6" className="border-2 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-950/50 [&[data-state=open]]:bg-blue-50 dark:[&[data-state=open]]:bg-blue-950/50">
                    Como funciona a avaliação dos espaços?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4">
                    Após utilizar um espaço, você pode avaliá-lo com uma nota e deixar um comentário. Essas avaliações ajudam outros usuários a tomarem melhores decisões e mantêm a qualidade da plataforma.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Não encontrou o que procurava? */}
      <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-y-2">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold mb-4">Não encontrou o que procurava?</h2>
              <p className="text-muted-foreground mb-6 md:mb-0">
                Nossa equipe está pronta para ajudar você com qualquer dúvida
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="group">
                Falar com Suporte
                <MessagesSquare className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="group">
                Enviar E-mail
                <Mail className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

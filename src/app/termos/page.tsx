import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"

export default function Termos() {
  return (
    <main className="min-h-screen">
      <Nav />
      
      <PageHeader 
        title="Termos de Uso"
        description="Leia atentamente os termos e condições de uso da plataforma Dezko."
      />

      <PageContainer>
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma Dezko, você concorda com estes termos de uso 
            e todas as leis e regulamentos aplicáveis. Se você não concordar com algum 
            destes termos, está proibido de usar ou acessar este site.
          </p>

          <h2>2. Uso da Plataforma</h2>
          <p>
            A Dezko é uma plataforma que conecta pessoas que buscam espaços para alugar 
            com proprietários que têm espaços disponíveis. O uso da plataforma está 
            sujeito às seguintes condições:
          </p>
          <ul>
            <li>Você deve ter pelo menos 18 anos de idade</li>
            <li>Você deve fornecer informações verdadeiras e precisas</li>
            <li>Você é responsável por manter a segurança de sua conta</li>
            <li>Você não pode usar a plataforma para fins ilegais</li>
          </ul>

          <h2>3. Contas de Usuário</h2>
          <p>
            Para utilizar alguns recursos da plataforma, você precisará criar uma conta. 
            Você é responsável por:
          </p>
          <ul>
            <li>Manter a confidencialidade de sua senha</li>
            <li>Restringir o acesso ao seu computador e conta</li>
            <li>Assumir responsabilidade por todas as atividades em sua conta</li>
          </ul>

          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo presente na plataforma Dezko, incluindo textos, gráficos, 
            logos, ícones, imagens, clipes de áudio, downloads digitais e compilações 
            de dados, é propriedade da Dezko ou de seus fornecedores de conteúdo e 
            está protegido por leis internacionais de direitos autorais.
          </p>

          <h2>5. Responsabilidades</h2>
          <p>
            A Dezko não se responsabiliza por:
          </p>
          <ul>
            <li>Danos causados por outros usuários</li>
            <li>Conteúdo gerado por usuários</li>
            <li>Indisponibilidade temporária da plataforma</li>
            <li>Problemas técnicos fora de nosso controle</li>
          </ul>

          <h2>6. Modificações</h2>
          <p>
            A Dezko reserva-se o direito de modificar estes termos a qualquer momento. 
            Continuando a usar a plataforma após as alterações, você aceita os novos termos.
          </p>

          <h2>7. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes termos, entre em contato conosco:
          </p>
          <ul>
            <li>E-mail: contato@dezko.com.br</li>
            <li>Telefone: 0800 123 4567</li>
          </ul>

          <div className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Última atualização: 19 de Fevereiro de 2025
          </div>
        </div>
      </PageContainer>

      <Footer />
    </main>
  )
}

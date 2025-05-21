import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"

export default function Privacidade() {
  return (
    <main className="min-h-screen">
      <Nav />
      
      <PageHeader 
        title="Política de Privacidade"
        description="Saiba como a Dezko protege e utiliza seus dados pessoais."
      />

      <PageContainer>
        <div className="max-w-4xl mx-auto prose dark:prose-invert">
          <h2>1. Introdução</h2>
          <p>
            A Dezko está comprometida em proteger sua privacidade. Esta política 
            descreve como coletamos, usamos e protegemos suas informações pessoais.
          </p>

          <h2>2. Informações que Coletamos</h2>
          <p>
            Coletamos as seguintes informações:
          </p>
          <ul>
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone</li>
            <li>Endereço</li>
            <li>Informações de pagamento</li>
            <li>Dados de uso da plataforma</li>
          </ul>

          <h2>3. Como Usamos suas Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul>
            <li>Processar reservas e pagamentos</li>
            <li>Enviar comunicações sobre seus serviços</li>
            <li>Melhorar nossos serviços</li>
            <li>Cumprir obrigações legais</li>
            <li>Prevenir fraudes</li>
          </ul>

          <h2>4. Compartilhamento de Dados</h2>
          <p>
            Compartilhamos suas informações apenas com:
          </p>
          <ul>
            <li>Proprietários de espaços (apenas informações necessárias)</li>
            <li>Processadores de pagamento</li>
            <li>Prestadores de serviços essenciais</li>
            <li>Autoridades (quando legalmente exigido)</li>
          </ul>

          <h2>5. Segurança dos Dados</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações:
          </p>
          <ul>
            <li>Criptografia SSL/TLS</li>
            <li>Acesso restrito a dados pessoais</li>
            <li>Monitoramento contínuo</li>
            <li>Backups regulares</li>
          </ul>

          <h2>6. Seus Direitos</h2>
          <p>
            Você tem direito a:
          </p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar exclusão de dados</li>
            <li>Restringir o processamento</li>
            <li>Portar seus dados</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            Utilizamos cookies para:
          </p>
          <ul>
            <li>Manter você conectado</li>
            <li>Lembrar suas preferências</li>
            <li>Analisar o uso da plataforma</li>
            <li>Melhorar a experiência do usuário</li>
          </ul>

          <h2>8. Contato</h2>
          <p>
            Para questões sobre privacidade, contate nosso DPO:
          </p>
          <ul>
            <li>E-mail: privacidade@dezko.com.br</li>
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

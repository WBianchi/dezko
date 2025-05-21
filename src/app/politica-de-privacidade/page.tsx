import { PolicyLayout } from "@/components/policy-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade | Dezko",
  description: "Como coletamos, usamos e protegemos seus dados na plataforma Dezko.",
}

export default function PoliticaDePrivacidade() {
  return (
    <PolicyLayout
      title="Política de Privacidade"
      badge="Última atualização: 19 de Fevereiro de 2025"
    >
      <h2>1. Introdução</h2>
      <p>
        A Dezko está comprometida em proteger sua privacidade e seus dados pessoais. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nossa plataforma.
      </p>

      <h2>2. Informações que Coletamos</h2>
      <h3>2.1. Dados fornecidos por você</h3>
      <ul>
        <li>Nome completo e dados de contato</li>
        <li>Informações de perfil e foto</li>
        <li>Documentos de identificação</li>
        <li>Dados de pagamento</li>
        <li>Preferências e configurações</li>
      </ul>

      <h3>2.2. Dados coletados automaticamente</h3>
      <ul>
        <li>Endereço IP e dados de localização</li>
        <li>Informações do dispositivo e navegador</li>
        <li>Cookies e tecnologias similares</li>
        <li>Dados de uso e interação</li>
        <li>Registros de acesso</li>
      </ul>

      <h2>3. Como Usamos seus Dados</h2>
      <p>
        Utilizamos suas informações para:
      </p>
      <ul>
        <li>Fornecer e melhorar nossos serviços</li>
        <li>Processar reservas e pagamentos</li>
        <li>Enviar comunicações importantes</li>
        <li>Personalizar sua experiência</li>
        <li>Garantir a segurança da plataforma</li>
        <li>Cumprir obrigações legais</li>
      </ul>

      <h2>4. Compartilhamento de Dados</h2>
      <p>
        Podemos compartilhar suas informações com:
      </p>
      <ul>
        <li>Anfitriões e usuários (apenas informações necessárias para a reserva)</li>
        <li>Processadores de pagamento</li>
        <li>Prestadores de serviços essenciais</li>
        <li>Autoridades competentes (quando legalmente exigido)</li>
      </ul>

      <h2>5. Seus Direitos</h2>
      <p>
        Você tem direito a:
      </p>
      <ul>
        <li>Acessar seus dados pessoais</li>
        <li>Corrigir informações imprecisas</li>
        <li>Solicitar a exclusão de seus dados</li>
        <li>Restringir ou opor-se ao processamento</li>
        <li>Receber seus dados em formato portável</li>
        <li>Retirar consentimentos previamente fornecidos</li>
      </ul>

      <h2>6. Segurança dos Dados</h2>
      <p>
        Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados, incluindo:
      </p>
      <ul>
        <li>Criptografia de dados sensíveis</li>
        <li>Firewalls e sistemas de segurança</li>
        <li>Controles de acesso rigorosos</li>
        <li>Monitoramento contínuo</li>
        <li>Treinamento de equipe</li>
      </ul>

      <h2>7. Retenção de Dados</h2>
      <p>
        Mantemos seus dados apenas pelo tempo necessário para:
      </p>
      <ul>
        <li>Fornecer nossos serviços</li>
        <li>Cumprir obrigações legais</li>
        <li>Resolver disputas</li>
        <li>Fazer cumprir nossos acordos</li>
      </ul>

      <h2>8. Cookies e Tecnologias Similares</h2>
      <p>
        Utilizamos cookies e tecnologias similares para melhorar sua experiência. Para mais informações, consulte nossa <a href="/cookies">Política de Cookies</a>.
      </p>

      <h2>9. Transferências Internacionais</h2>
      <p>
        Seus dados podem ser transferidos e processados em países diferentes do seu país de residência. Quando isso ocorrer, garantimos que medidas apropriadas de proteção sejam implementadas.
      </p>

      <h2>10. Menores de Idade</h2>
      <p>
        Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente.
      </p>

      <h2>11. Atualizações desta Política</h2>
      <p>
        Podemos atualizar esta política periodicamente. Notificaremos você sobre alterações significativas através de aviso em nossa plataforma ou por e-mail. O uso continuado de nossos serviços após as alterações constitui aceitação da política atualizada.
      </p>

      <h2>12. Contato</h2>
      <p>
        Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados:
      </p>
      <ul>
        <li>E-mail: privacidade@dezko.com.br</li>
        <li>Telefone: 0800 123 4567</li>
        <li>Endereço: Av. Paulista, 1000 - São Paulo, SP</li>
      </ul>
    </PolicyLayout>
  )
}

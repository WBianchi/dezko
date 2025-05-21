import { PolicyLayout } from "@/components/policy-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso | Dezko",
  description: "Termos e condições de uso da plataforma Dezko.",
}

export default function TermosDeUso() {
  return (
    <PolicyLayout
      title="Termos de Uso"
      badge="Última atualização: 19 de Fevereiro de 2025"
    >
      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar a plataforma Dezko, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, por favor, não utilize nossos serviços.
      </p>

      <h2>2. Serviços Oferecidos</h2>
      <p>
        A Dezko é uma plataforma de marketplace que conecta proprietários de espaços (Anfitriões) com pessoas que buscam locais para eventos, reuniões ou outras atividades (Usuários).
      </p>
      <ul>
        <li>Listagem e busca de espaços</li>
        <li>Sistema de reservas e pagamentos</li>
        <li>Avaliações e comentários</li>
        <li>Suporte ao cliente</li>
      </ul>

      <h2>3. Cadastro e Conta</h2>
      <p>
        Para utilizar completamente nossos serviços, é necessário criar uma conta. Você é responsável por:
      </p>
      <ul>
        <li>Fornecer informações precisas e atualizadas</li>
        <li>Manter a segurança de suas credenciais de acesso</li>
        <li>Todas as atividades realizadas em sua conta</li>
      </ul>

      <h2>4. Responsabilidades dos Anfitriões</h2>
      <p>
        Ao listar um espaço na Dezko, os Anfitriões devem:
      </p>
      <ul>
        <li>Fornecer informações precisas sobre o espaço</li>
        <li>Manter o calendário de disponibilidade atualizado</li>
        <li>Cumprir com as reservas confirmadas</li>
        <li>Manter o espaço em condições adequadas de uso</li>
        <li>Respeitar as políticas de cancelamento</li>
      </ul>

      <h2>5. Responsabilidades dos Usuários</h2>
      <p>
        Ao reservar um espaço através da Dezko, os Usuários devem:
      </p>
      <ul>
        <li>Utilizar o espaço de acordo com o propósito informado</li>
        <li>Respeitar as regras específicas de cada espaço</li>
        <li>Cumprir com os horários de check-in e check-out</li>
        <li>Realizar o pagamento conforme acordado</li>
        <li>Reportar problemas imediatamente</li>
      </ul>

      <h2>6. Pagamentos e Taxas</h2>
      <p>
        A Dezko utiliza sistemas seguros de processamento de pagamento. Ao utilizar nossa plataforma:
      </p>
      <ul>
        <li>As taxas de serviço serão claramente informadas</li>
        <li>Os pagamentos são processados de forma segura</li>
        <li>Reembolsos seguem nossa política específica</li>
        <li>Os valores são apresentados em Reais (BRL)</li>
      </ul>

      <h2>7. Cancelamentos</h2>
      <p>
        Nossa política de cancelamento visa proteger tanto Anfitriões quanto Usuários. Os termos específicos de cancelamento podem variar de acordo com o espaço e serão sempre apresentados antes da confirmação da reserva.
      </p>

      <h2>8. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo disponível na plataforma Dezko, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é de propriedade da Dezko ou de seus fornecedores de conteúdo e está protegido por leis brasileiras e internacionais de direitos autorais.
      </p>

      <h2>9. Privacidade e Dados</h2>
      <p>
        Respeitamos sua privacidade e protegemos seus dados pessoais. Para entender como coletamos, usamos e protegemos suas informações, consulte nossa <a href="/politica-de-privacidade">Política de Privacidade</a>.
      </p>

      <h2>10. Modificações dos Termos</h2>
      <p>
        A Dezko reserva-se o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas aos usuários através de aviso na plataforma ou por e-mail. O uso continuado dos serviços após as alterações constitui aceitação dos novos termos.
      </p>

      <h2>11. Legislação Aplicável</h2>
      <p>
        Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será submetida à jurisdição do foro da cidade de São Paulo, SP, com exclusão de qualquer outro, por mais privilegiado que seja.
      </p>

      <h2>12. Contato</h2>
      <p>
        Se você tiver dúvidas sobre estes termos, entre em contato conosco através do e-mail: suporte@dezko.com.br
      </p>
    </PolicyLayout>
  )
}

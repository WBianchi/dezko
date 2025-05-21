import { PolicyLayout } from "@/components/policy-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Reembolso | Dezko",
  description: "Entenda nossa política de reembolso e cancelamento na plataforma Dezko.",
}

export default function Reembolso() {
  return (
    <PolicyLayout
      title="Política de Reembolso"
      badge="Última atualização: 19 de Fevereiro de 2025"
    >
      <h2>1. Introdução</h2>
      <p>
        A Dezko se compromete a garantir um processo justo e transparente de reembolso para todos os usuários da plataforma. Esta política estabelece as condições e procedimentos para solicitação e processamento de reembolsos.
      </p>

      <h2>2. Condições para Reembolso</h2>
      <h3>2.1. Cancelamento pelo Usuário</h3>
      <p>
        O valor do reembolso dependerá do momento do cancelamento:
      </p>
      <ul>
        <li><strong>7+ dias antes do evento:</strong> Reembolso de 100% do valor</li>
        <li><strong>3-6 dias antes do evento:</strong> Reembolso de 70% do valor</li>
        <li><strong>1-2 dias antes do evento:</strong> Reembolso de 50% do valor</li>
        <li><strong>No dia do evento:</strong> Sem reembolso</li>
      </ul>

      <h3>2.2. Cancelamento pelo Anfitrião</h3>
      <p>
        Se o Anfitrião cancelar a reserva:
      </p>
      <ul>
        <li>Reembolso de 100% do valor pago</li>
        <li>Crédito adicional de 10% para uso futuro na plataforma</li>
        <li>Assistência para encontrar um espaço alternativo</li>
      </ul>

      <h3>2.3. Circunstâncias Excepcionais</h3>
      <p>
        Reembolso integral em casos de:
      </p>
      <ul>
        <li>Desastres naturais ou eventos climáticos extremos</li>
        <li>Problemas graves no espaço que impossibilitem seu uso</li>
        <li>Emergências médicas (com comprovação)</li>
        <li>Restrições governamentais imprevistas</li>
      </ul>

      <h2>3. Processo de Reembolso</h2>
      <h3>3.1. Como Solicitar</h3>
      <ul>
        <li>Acesse sua conta na Dezko</li>
        <li>Vá para "Minhas Reservas"</li>
        <li>Selecione a reserva específica</li>
        <li>Clique em "Solicitar Reembolso"</li>
        <li>Preencha o formulário com o motivo</li>
        <li>Anexe documentos relevantes (se necessário)</li>
      </ul>

      <h3>3.2. Prazos</h3>
      <ul>
        <li><strong>Análise da solicitação:</strong> Até 2 dias úteis</li>
        <li><strong>Processamento do reembolso:</strong> 3-5 dias úteis após aprovação</li>
        <li><strong>Crédito no cartão:</strong> 2-10 dias úteis (varia por banco)</li>
      </ul>

      <h2>4. Formas de Reembolso</h2>
      <p>
        O reembolso será processado através do mesmo método de pagamento utilizado na reserva:
      </p>
      <ul>
        <li><strong>Cartão de Crédito:</strong> Estorno na fatura</li>
        <li><strong>PIX:</strong> Devolução para a chave de origem</li>
        <li><strong>Créditos Dezko:</strong> Retorno ao saldo da conta</li>
      </ul>

      <h2>5. Taxas Não Reembolsáveis</h2>
      <p>
        Algumas taxas não são reembolsáveis em nenhuma circunstância:
      </p>
      <ul>
        <li>Taxa de serviço da plataforma</li>
        <li>Taxas de processamento de pagamento</li>
        <li>Seguros contratados</li>
      </ul>

      <h2>6. Disputas e Mediação</h2>
      <p>
        Em caso de discordância sobre o reembolso:
      </p>
      <ul>
        <li>Nossa equipe de suporte mediará a situação</li>
        <li>Ambas as partes poderão apresentar evidências</li>
        <li>Decisão final baseada em nossas políticas e termos</li>
        <li>Possibilidade de recurso em até 5 dias úteis</li>
      </ul>

      <h2>7. Proteção contra Fraudes</h2>
      <p>
        Para proteger nossa comunidade:
      </p>
      <ul>
        <li>Verificamos todas as solicitações de reembolso</li>
        <li>Monitoramos padrões suspeitos de cancelamento</li>
        <li>Podemos solicitar documentação adicional</li>
        <li>Reservamo-nos o direito de negar reembolsos fraudulentos</li>
      </ul>

      <h2>8. Casos Especiais</h2>
      <h3>8.1. Eventos Corporativos</h3>
      <p>
        Para reservas corporativas acima de R$ 5.000:
      </p>
      <ul>
        <li>Política de cancelamento personalizada</li>
        <li>Possibilidade de reagendamento sem custo</li>
        <li>Seguro-evento opcional</li>
      </ul>

      <h3>8.2. Eventos Recorrentes</h3>
      <p>
        Para reservas recorrentes:
      </p>
      <ul>
        <li>Cancelamento com 30 dias de antecedência</li>
        <li>Flexibilidade para reagendamento</li>
        <li>Desconto em reservas futuras</li>
      </ul>

      <h2>9. Contato</h2>
      <p>
        Para dúvidas sobre reembolsos:
      </p>
      <ul>
        <li>E-mail: reembolsos@dezko.com.br</li>
        <li>Telefone: 0800 123 4567</li>
        <li>Chat: Disponível 24/7 no app</li>
      </ul>
    </PolicyLayout>
  )
}

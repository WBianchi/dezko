import { PolicyLayout } from "@/components/policy-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies | Dezko",
  description: "Entenda como utilizamos cookies e outras tecnologias de rastreamento na plataforma Dezko.",
}

export default function Cookies() {
  return (
    <PolicyLayout
      title="Política de Cookies"
      badge="Última atualização: 19 de Fevereiro de 2025"
    >
      <h2>1. O que são Cookies?</h2>
      <p>
        Cookies são pequenos arquivos de texto que são armazenados em seu dispositivo quando você visita nosso site. Eles nos ajudam a fazer o site funcionar corretamente, torná-lo mais seguro, proporcionar uma melhor experiência do usuário e entender como o site está sendo usado.
      </p>

      <h2>2. Como Utilizamos os Cookies</h2>
      <p>
        Utilizamos diferentes tipos de cookies para executar o site e os serviços da Dezko:
      </p>

      <h3>2.1. Cookies Essenciais</h3>
      <p>
        São necessários para o funcionamento básico do site. Sem eles, você não conseguiria navegar pelo site ou usar recursos básicos.
      </p>
      <ul>
        <li>Autenticação e segurança</li>
        <li>Gerenciamento de sessão</li>
        <li>Lembrar preferências essenciais</li>
        <li>Balanceamento de carga</li>
      </ul>

      <h3>2.2. Cookies de Desempenho</h3>
      <p>
        Nos ajudam a entender como os visitantes interagem com o site, coletando informações anonimamente.
      </p>
      <ul>
        <li>Análise de tráfego</li>
        <li>Identificação de erros</li>
        <li>Teste de diferentes versões</li>
        <li>Métricas de desempenho</li>
      </ul>

      <h3>2.3. Cookies de Funcionalidade</h3>
      <p>
        Permitem que o site lembre suas escolhas para proporcionar uma experiência mais personalizada.
      </p>
      <ul>
        <li>Preferências de idioma</li>
        <li>Localização</li>
        <li>Configurações de visualização</li>
        <li>Histórico de busca</li>
      </ul>

      <h3>2.4. Cookies de Publicidade</h3>
      <p>
        Usados para entregar anúncios mais relevantes e medir a eficácia de nossas campanhas publicitárias.
      </p>
      <ul>
        <li>Segmentação de anúncios</li>
        <li>Análise de campanhas</li>
        <li>Frequência de anúncios</li>
        <li>Medição de conversão</li>
      </ul>

      <h2>3. Cookies de Terceiros</h2>
      <p>
        Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas:
      </p>
      <ul>
        <li>Google Analytics (análise de tráfego)</li>
        <li>Stripe (processamento de pagamentos)</li>
        <li>Redes sociais (botões de compartilhamento)</li>
        <li>Serviços de mapas</li>
      </ul>

      <h2>4. Duração dos Cookies</h2>
      <p>
        Os cookies que utilizamos têm diferentes durações:
      </p>
      <ul>
        <li><strong>Cookies de Sessão:</strong> Temporários, excluídos quando você fecha o navegador</li>
        <li><strong>Cookies Persistentes:</strong> Permanecem no seu dispositivo por um período específico ou até serem excluídos manualmente</li>
      </ul>

      <h2>5. Gerenciamento de Cookies</h2>
      <p>
        Você tem controle sobre os cookies e pode gerenciá-los de várias maneiras:
      </p>
      <ul>
        <li>Configurações do navegador para aceitar/rejeitar cookies</li>
        <li>Exclusão de cookies existentes</li>
        <li>Configuração para notificação quando novos cookies forem recebidos</li>
        <li>Uso de ferramentas de navegação privada</li>
      </ul>

      <h2>6. Impacto da Desativação de Cookies</h2>
      <p>
        A desativação de cookies pode afetar sua experiência no site:
      </p>
      <ul>
        <li>Algumas funcionalidades podem não funcionar corretamente</li>
        <li>Suas preferências não serão salvas</li>
        <li>Você precisará fazer login novamente a cada visita</li>
        <li>A experiência pode ser menos personalizada</li>
      </ul>

      <h2>7. Outras Tecnologias de Rastreamento</h2>
      <p>
        Além dos cookies, também utilizamos:
      </p>
      <ul>
        <li>Web beacons</li>
        <li>Pixels de rastreamento</li>
        <li>Local storage</li>
        <li>Identificadores de dispositivo</li>
      </ul>

      <h2>8. Atualizações na Política</h2>
      <p>
        Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas de uso de cookies. Recomendamos que você revise esta política regularmente para se manter informado sobre como protegemos suas informações.
      </p>

      <h2>9. Contato</h2>
      <p>
        Se você tiver dúvidas sobre como usamos cookies ou outras tecnologias de rastreamento, entre em contato conosco:
      </p>
      <ul>
        <li>E-mail: privacidade@dezko.com.br</li>
        <li>Telefone: 0800 123 4567</li>
      </ul>
    </PolicyLayout>
  )
}

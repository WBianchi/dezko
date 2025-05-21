'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Building2, Info, Plug, User } from "lucide-react"
import { MeuPerfilTab } from "@/components/tabs/meu-perfil-tab"
import { NotificacoesTab } from "@/components/tabs/notificacoes-tab"
import { IntegracoesTab } from "@/components/tabs/integracoes-tab"
import { InformacoesEspacoTab } from "@/components/tabs/informacoes-espaco-tab"

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Meu Perfil
              </TabsTrigger>
              <TabsTrigger value="informacoes" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações do Espaço
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="integracoes" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Integrações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="perfil">
              <MeuPerfilTab />
            </TabsContent>
            <TabsContent value="informacoes">
              <InformacoesEspacoTab />
            </TabsContent>
            <TabsContent value="notificacoes">
              <NotificacoesTab />
            </TabsContent>
            <TabsContent value="integracoes">
              <IntegracoesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

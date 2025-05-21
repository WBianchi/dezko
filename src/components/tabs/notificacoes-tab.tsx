'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function NotificacoesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Gerencie suas preferências de notificação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Novas reservas</Label>
            <CardDescription>Receba notificações quando houver novas reservas</CardDescription>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Cancelamentos</Label>
            <CardDescription>Receba notificações quando houver cancelamentos</CardDescription>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Atualizações do sistema</Label>
            <CardDescription>Receba notificações sobre atualizações do sistema</CardDescription>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  )
}

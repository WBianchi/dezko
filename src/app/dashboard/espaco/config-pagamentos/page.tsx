'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Percent, 
  CreditCard, 
  QrCode, 
  DollarSign,
  PlugZap, 
  Settings, 
  Building2,
  ArrowLeftRight,
  Wallet
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import { useSession } from "next-auth/react"
import { ConfigPagamentosTab } from "@/components/tabs/config-pagamentos-tab"
import { MetodoPagamentoTab } from "@/components/tabs/metodo-pagamento-tab"
import { PagamentoRapidoTab } from "@/components/tabs/pagamento-rapido-tab"

export default function ConfigPagamentosPage() {
  const { data: session } = useSession()
  const espacoId = session?.user?.espacoId
  
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Configuração de Pagamentos</CardTitle>
              <CardDescription>
                Configure suas preferências de recebimento, taxas e métodos de pagamento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações Gerais
              </TabsTrigger>
              <TabsTrigger value="metodos" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Métodos de Pagamento
              </TabsTrigger>
              <TabsTrigger value="rapido" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Pagamento Rápido
              </TabsTrigger>
            </TabsList>
            <TabsContent value="config">
              <ConfigPagamentosTab espacoId={espacoId} />
            </TabsContent>
            <TabsContent value="metodos">
              <MetodoPagamentoTab espacoId={espacoId} />
            </TabsContent>
            <TabsContent value="rapido">
              <PagamentoRapidoTab espacoId={espacoId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

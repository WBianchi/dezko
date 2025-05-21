'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

type OpenPixConfig = {
  openpixAuthKey: string
  openpixWebhookSecret: string
  apiUrl: string
  nodeEnv: string
}

export default function OpenPixTest() {
  const [loading, setLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [config, setConfig] = useState<OpenPixConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Buscar configuração
  const fetchConfig = async () => {
    setConfigLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/openpix/config')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações')
      }
      
      const data = await response.json()
      setConfig(data.config)
    } catch (err: any) {
      console.error('Erro ao buscar configuração:', err)
      setError(err.message || 'Erro ao buscar configurações')
      toast.error('Erro ao buscar configurações')
    } finally {
      setConfigLoading(false)
    }
  }
  
  // Testar conexão com OpenPix
  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/openpix/test')
      const data = await response.json()
      
      setTestResult(data)
      
      if (data.success) {
        toast.success('Conexão com OpenPix bem-sucedida!')
      } else {
        toast.error('Falha na conexão com OpenPix')
      }
    } catch (err: any) {
      console.error('Erro no teste OpenPix:', err)
      setError(err.message || 'Erro na conexão com OpenPix')
      toast.error('Erro ao testar conexão')
    } finally {
      setLoading(false)
    }
  }
  
  // Carregar configuração ao montar o componente
  if (!config && !configLoading && !error) {
    fetchConfig()
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Integração OpenPix</CardTitle>
        <CardDescription>
          Verificar a conexão com a API OpenPix e as configurações
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status da configuração */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Status da Configuração:</h3>
          
          {configLoading ? (
            <div className="flex items-center space-x-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando configurações...</span>
            </div>
          ) : config ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-muted-foreground">Chave API:</span>
                <Badge variant={config.openpixAuthKey !== 'Não configurado' ? 'default' : 'destructive'}>
                  {config.openpixAuthKey !== 'Não configurado' ? 'Configurado' : 'Não configurado'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-muted-foreground">Webhook Secret:</span>
                <Badge variant={config.openpixWebhookSecret !== 'Não configurado' ? 'default' : 'destructive'}>
                  {config.openpixWebhookSecret}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-muted-foreground">API URL:</span>
                <span className="text-xs">{config.apiUrl}</span>
              </div>
              
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-muted-foreground">Ambiente:</span>
                <Badge variant="outline">{config.nodeEnv}</Badge>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        
        {/* Resultados do teste */}
        {testResult && (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Resultado do Teste:</h3>
            
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResult.success ? 'Sucesso' : 'Falha'}
              </AlertTitle>
              <AlertDescription>
                {testResult.success 
                  ? 'Conexão com OpenPix estabelecida com sucesso'
                  : 'Falha na conexão com OpenPix. Verifique as configurações e logs.'}
              </AlertDescription>
            </Alert>
            
            {testResult.response && (
              <div className="rounded-md bg-zinc-50 p-3 text-xs font-mono overflow-x-auto mt-2">
                <pre>{JSON.stringify(testResult.response, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchConfig}
          disabled={configLoading}
        >
          {configLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar configurações
            </>
          )}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={testConnection}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar conexão'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

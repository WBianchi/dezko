'use client'

import * as React from 'react'
import { Bell, Calendar, CreditCard, Mail, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'

export function Notifications() {
  // Notificações não lidas
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: 'Nova reserva confirmada',
      message: 'Sala de reunião 01 foi reservada para hoje às 14h',
      time: 'Há 5 min',
      read: false,
      type: 'reserva',
      icon: Calendar,
    },
    {
      id: 2,
      title: 'Avaliação recebida',
      message: 'Você recebeu uma nova avaliação 5 estrelas',
      time: 'Hoje',
      read: false,
      type: 'avaliacao',
      icon: Star,
    },
    {
      id: 3,
      title: 'Oferta especial: 20% de desconto',
      message: 'Aproveite 20% de desconto em reservas feitas até sexta-feira.',
      time: 'Hoje',
      read: false,
      type: 'promocao',
      icon: Sparkles,
    },
  ])

  // Notificações lidas
  const [readNotifications, setReadNotifications] = React.useState([
    {
      id: 4,
      title: 'Pagamento processado',
      message: 'Seu pagamento de R$ 150,00 foi processado com sucesso.',
      time: 'Ontem',
      type: 'pagamento',
      icon: CreditCard,
    },
    {
      id: 5,
      title: 'Nova mensagem recebida',
      message: 'O administrador do espaço enviou uma mensagem sobre sua reserva.',
      time: '2 dias atrás',
      type: 'mensagem',
      icon: Mail,
    },
  ])

  const unreadCount = notifications.length

  const markAllAsRead = () => {
    setReadNotifications([...readNotifications, ...notifications])
    setNotifications([])
  }

  const markAsRead = (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (notification) {
      setReadNotifications([...readNotifications, notification])
      setNotifications(notifications.filter(n => n.id !== notificationId))
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-50 dark:hover:bg-blue-900 relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[0.7rem] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-l border-blue-100 dark:border-blue-900 shadow-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Notificações
          </SheetTitle>
        </SheetHeader>
        
        {/* Ações */}
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
        
        {/* Notificações não lidas */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              Não lidas
            </h3>
            
            <AnimatePresence>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-blue-100 dark:border-blue-900 shadow-sm transition-all hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-8 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Ignorar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/50"
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
        
        {/* Notificações anteriores */}
        {readNotifications.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              Anteriores
            </h3>
            
            <div className="space-y-3 opacity-80">
              {readNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      <notification.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {notifications.length === 0 && readNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhuma notificação</h3>
            <p className="text-sm text-gray-500">Você não tem notificações neste momento.</p>
          </div>
        )}
        
        {(notifications.length > 0 || readNotifications.length > 0) && (
          <div className="pt-6 flex justify-center">
            <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30">
              Ver todas as notificações
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

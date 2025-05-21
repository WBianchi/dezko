'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface PixStatusProps {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | null
  className?: string
}

export function PixStatus({ status, className }: PixStatusProps) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    // Animação para aparecer quando o status mudar
    setVisible(true)
    
    // Desaparece após 5 segundos se for approved ou rejected
    if (status === 'approved' || status === 'rejected' || status === 'cancelled') {
      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [status])
  
  if (!status) return null
  
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Aguardando pagamento',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-500'
        }
      case 'approved':
        return {
          icon: Check,
          text: 'Pagamento aprovado!',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          iconColor: 'text-green-500'
        }
      case 'rejected':
        return {
          icon: AlertCircle,
          text: 'Pagamento rejeitado',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-500'
        }
      case 'cancelled':
        return {
          icon: AlertCircle,
          text: 'Pagamento cancelado',
          bgColor: 'bg-zinc-50',
          borderColor: 'border-zinc-200',
          textColor: 'text-zinc-700',
          iconColor: 'text-zinc-500'
        }
      default:
        return {
          icon: Clock,
          text: 'Processando',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-500'
        }
    }
  }
  
  const config = getStatusConfig()
  const Icon = config.icon
  
  return (
    <motion.div
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-3 rounded-lg border flex items-center w-full",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 mr-2", config.iconColor)} />
      <span className={cn("font-medium text-sm", config.textColor)}>
        {config.text}
      </span>
    </motion.div>
  )
}

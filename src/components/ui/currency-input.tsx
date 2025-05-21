'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

export function CurrencyInput({ value, onChange, placeholder = 'R$ 0,00' }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    return value ? formatCurrency(value) : ''
  })

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let value = event.target.value.replace(/\D/g, '')
    
    if (value) {
      value = value.padStart(3, '0')
      const numberValue = Number(value) / 100
      setDisplayValue(formatCurrency(numberValue))
      onChange(numberValue)
    } else {
      setDisplayValue('')
      onChange(0)
    }
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}

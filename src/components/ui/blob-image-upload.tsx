'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Trash, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface BlobImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  value: string | null
  className?: string
}

export function BlobImageUpload({
  disabled,
  onChange,
  value,
  className = '',
}: BlobImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]

    // Validar o tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Envie apenas JPG, PNG, WebP ou GIF.')
      return
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. O tamanho máximo é 5MB.')
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      onChange(data.url)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Falha ao enviar a imagem. Tente novamente.')
    } finally {
      setIsUploading(false)
      // Limpar o input file para permitir o upload do mesmo arquivo novamente
      e.target.value = ''
    }
  }

  const onRemove = () => {
    onChange('')
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden mb-4">
          <div className="z-10 absolute top-2 right-2">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="sm"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <Image
            fill
            className="object-cover"
            alt="Imagem de capa"
            src={value}
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md p-8 w-full">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-slate-100 p-4 rounded-full">
              <ImagePlus className="h-6 w-6 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Arraste e solte uma imagem ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP ou GIF (max. 5MB)
              </p>
            </div>
            <Button
              type="button"
              disabled={disabled || isUploading}
              variant="secondary"
              size="sm"
              className="mt-2 relative"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Fazer Upload
                </>
              )}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handleUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={disabled || isUploading}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlobImageUpload

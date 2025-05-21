'use client'

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface GaleriaEspacoProps {
  fotos: string[]
}

export function GaleriaEspaco({ fotos }: GaleriaEspacoProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  
  // Verificação para garantir que temos fotos válidas para exibir
  const fotosValidas = fotos.filter(foto => {
    // Aceita tanto URLs quanto dados base64
    return foto && typeof foto === 'string' && (
      foto.startsWith('/') || 
      foto.startsWith('http') || 
      foto.startsWith('data:image')
    )
  }) || []
  
  console.log('Fotos recebidas na galeria:', fotosValidas)

  const nextImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage + 1) % fotosValidas.length)
  }

  const previousImage = () => {
    if (selectedImage === null) return
    setSelectedImage(selectedImage === 0 ? fotosValidas.length - 1 : selectedImage - 1)
  }

  if (fotosValidas.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Nenhuma foto disponível para este espaço.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {fotosValidas.map((foto, index) => (
          <div
            key={index}
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={foto}
              alt={`Foto ${index + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <DialogTitle>
            <VisuallyHidden>Visualização da Galeria de Fotos</VisuallyHidden>
          </DialogTitle>
          <div className="relative aspect-video">
            {selectedImage !== null && fotosValidas[selectedImage] && (
              <Image
                src={fotosValidas[selectedImage]}
                alt={`Foto ${selectedImage + 1}`}
                fill
                className="object-contain"
              />
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="absolute inset-y-0 left-4 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute inset-y-0 right-4 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {fotosValidas.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    selectedImage === index ? "bg-white" : "bg-white/50"
                  )}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new NextResponse('Nenhum arquivo enviado', { status: 400 })
    }
    
    // Verificar o tipo de arquivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(file.type)) {
      return new NextResponse(
        'Tipo de arquivo não permitido. Apenas jpeg, png, webp e gif são aceitos',
        { status: 400 }
      )
    }
    
    // Verificar o tamanho do arquivo (limite de 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return new NextResponse(
        'Arquivo muito grande. O tamanho máximo é 5MB',
        { status: 400 }
      )
    }

    // Gerar um nome único para o arquivo usando UUID
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `blog/${uuidv4()}.${fileExtension}`

    // Fazer upload para o Vercel Blob Storage
    const blob = await put(uniqueFileName, file, {
      access: 'public',
    })

    // Retornar a URL do arquivo enviado
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[UPLOAD]', error)
    return new NextResponse('Erro ao fazer upload do arquivo', { status: 500 })
  }
}

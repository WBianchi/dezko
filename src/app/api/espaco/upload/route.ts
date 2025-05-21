import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tipagem personalizada do usuário NextAuth
interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  role?: string;
}

// Função auxiliar para obter o ID do espaço
async function getEspacoId(session: any) {
  const user = session.user as UserWithRole;
  const userRole = user.role;
  
  if (userRole === "espaco" && user.id) {
    return user.id;
  } else if (userRole === "admin") {
    const admin = await prisma.admin.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        espacos: {
          select: {
            id: true
          },
          take: 1
        }
      }
    });

    if (!admin || admin.espacos.length === 0) {
      return null;
    }

    return admin.espacos[0].id;
  }
  
  return null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    // Recebe a imagem em base64 e outras informações
    const body = await req.json();
    const { imageData, type } = body;

    if (!imageData || !type) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verifica se o tipo é válido
    if (!["fotoPrincipal", "fotoCapa", "galeria"].includes(type)) {
      return new NextResponse("Tipo de imagem inválido", { status: 400 });
    }

    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }

    // Em um sistema de produção, você enviaria essa imagem para um serviço 
    // como S3 ou similares e salvaria a URL no banco de dados.
    // Para este exemplo, vamos salvar o base64 diretamente no banco.
    
    // Atualiza o campo correspondente ou adiciona à galeria
    if (type === "galeria") {
      // Busca o espaço atual para obter a galeria existente
      const espaco = await prisma.espaco.findUnique({
        where: { id: espacoId },
        select: { imagens: true }
      });
      
      if (!espaco) {
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }
      
      // Adiciona a nova imagem à galeria
      const imagens = [...(espaco.imagens || []), imageData];
      
      // Atualiza o espaço
      const espacoAtualizado = await prisma.espaco.update({
        where: { id: espacoId },
        data: { imagens },
        select: { imagens: true }
      });
      
      return NextResponse.json({ 
        success: true, 
        imagens: espacoAtualizado.imagens 
      });
    } else {
      // Atualiza foto principal ou capa
      const espacoAtualizado = await prisma.espaco.update({
        where: { id: espacoId },
        data: { [type]: imageData },
        select: { [type]: true, id: true }
      });
      
      return NextResponse.json({ 
        success: true, 
        [type]: espacoAtualizado[type],
        id: espacoAtualizado.id
      });
    }
  } catch (error) {
    console.error("[UPLOAD_IMAGE]", error);
    return new NextResponse("Erro ao fazer upload da imagem", { status: 500 });
  }
}

// Rota para remover uma imagem da galeria
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const imageIndex = searchParams.get("index");
  const type = searchParams.get("type");

  if (!session?.user?.email) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  if (!type || (type === "galeria" && !imageIndex)) {
    return new NextResponse("Parâmetros incompletos", { status: 400 });
  }

  // Verifica se o tipo é válido
  if (!["fotoPrincipal", "fotoCapa", "galeria"].includes(type)) {
    return new NextResponse("Tipo de imagem inválido", { status: 400 });
  }

  try {
    const espacoId = await getEspacoId(session);

    if (!espacoId) {
      return new NextResponse("Espaço não encontrado", { status: 404 });
    }
    
    if (type === "galeria") {
      // Remover imagem da galeria
      const index = parseInt(imageIndex as string);
      
      // Busca o espaço para obter a galeria atual
      const espaco = await prisma.espaco.findUnique({
        where: { id: espacoId },
        select: { imagens: true }
      });
      
      if (!espaco) {
        return new NextResponse("Espaço não encontrado", { status: 404 });
      }
      
      // Verifica se o índice é válido
      if (index < 0 || index >= espaco.imagens.length) {
        return new NextResponse("Índice de imagem inválido", { status: 400 });
      }
      
      // Remove a imagem da galeria
      const imagens = [...espaco.imagens];
      imagens.splice(index, 1);
      
      // Atualiza o espaço
      const espacoAtualizado = await prisma.espaco.update({
        where: { id: espacoId },
        data: { imagens },
        select: { imagens: true }
      });
      
      return NextResponse.json({ 
        success: true, 
        imagens: espacoAtualizado.imagens 
      });
    } else {
      // Limpar foto principal ou capa (setar como string vazia)
      const espacoAtualizado = await prisma.espaco.update({
        where: { id: espacoId },
        data: { [type]: "" },
        select: { [type]: true }
      });
      
      return NextResponse.json({ 
        success: true, 
        [type]: espacoAtualizado[type] 
      });
    }
  } catch (error) {
    console.error("[DELETE_IMAGE]", error);
    return new NextResponse("Erro ao remover imagem", { status: 500 });
  }
}

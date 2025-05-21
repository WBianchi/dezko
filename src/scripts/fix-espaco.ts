import { prisma } from "@/lib/prisma"
import * as argon2 from "argon2"

async function main() {
  const email = "central@coworking.com"
  const senha = await argon2.hash("123456")

  // Buscar espaço existente
  const espacoExistente = await prisma.espaco.findUnique({
    where: {
      email,
    },
  })

  if (espacoExistente) {
    // Deletar pedidos primeiro
    await prisma.pedido.deleteMany({
      where: {
        espacoId: espacoExistente.id,
      },
    })

    // Depois deletar as outras relações
    await prisma.plano.deleteMany({
      where: {
        espacoId: espacoExistente.id,
      },
    })

    await prisma.agenda.deleteMany({
      where: {
        espacoId: espacoExistente.id,
      },
    })

    await prisma.mensagem.deleteMany({
      where: {
        espacoId: espacoExistente.id,
      },
    })

    await prisma.avaliacao.deleteMany({
      where: {
        espacoId: espacoExistente.id,
      },
    })

    // Agora podemos deletar o espaço
    await prisma.espaco.delete({
      where: {
        id: espacoExistente.id,
      },
    })
  }

  // Deletar usuário existente se houver
  await prisma.usuario.deleteMany({
    where: {
      email,
    },
  })

  // Criar novo usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome: "Coworking Central",
      email,
      senha,
    },
  })

  // Criar novo espaço
  const espaco = await prisma.espaco.create({
    data: {
      nome: "Coworking Central",
      email,
      senha,
      userId: usuario.id,
    },
  })

  console.log("Usuário e espaço recriados com sucesso!")
  console.log("Usuario ID:", usuario.id)
  console.log("Espaço ID:", espaco.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

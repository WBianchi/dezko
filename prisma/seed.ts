'use server'

import { PrismaClient, TipoReserva, Turno, StatusDoPedido, FormaDePagamento } from '@prisma/client'
import * as argon2 from "argon2"

const prisma = new PrismaClient()

async function main() {
  // Criar Admin
  console.log('Criando admin...')
  const hashedPassword = await argon2.hash('123456');
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@dezko.com' },
    update: { senha: hashedPassword },
    create: {
      nome: 'Admin Dezko',
      email: 'admin@dezko.com',
      senha: hashedPassword,
    },
  })

  // Criar configuração do admin
  await prisma.configuracao.create({
    data: {
      id: "1",
      nomeSite: "Dezko",
      descricaoSite: "Plataforma de reserva de espaços",
      emailContato: "contato@dezko.com",
      telefoneContato: "(11) 99999-9999",
      enderecoEmpresa: "Rua Exemplo, 123",
      tipo: "site",
      valor: "{}"
    }
  })

  // Criar configuração do Mercado Pago
  await prisma.configuracao.create({
    data: {
      id: "2",
      nomeSite: "Dezko",
      descricaoSite: "Plataforma de reserva de espaços",
      emailContato: "contato@dezko.com",
      telefoneContato: "(11) 99999-9999",
      enderecoEmpresa: "Rua Exemplo, 123",
      tipo: "mercadopago",
      valor: JSON.stringify({
        accessToken: "APP_USR-6389386881195934-022115-1f3e89f9a7d6a2f6e5e1e2b5e7a1e1e1-358636487",
        publicKey: "TEST-6eb29d8c-d898-4dc4-a0de-7a0f3d5b0e5d"
      })
    }
  })

  // Criar configuração de comissão
  await prisma.configuracao.create({
    data: {
      id: "3",
      nomeSite: "Dezko",
      descricaoSite: "Plataforma de reserva de espaços",
      emailContato: "contato@dezko.com",
      telefoneContato: "(11) 99999-9999",
      enderecoEmpresa: "Rua Exemplo, 123",
      tipo: "comissao",
      valor: JSON.stringify({
        percentual: 10
      })
    }
  })
  
  // Criar configuração de planos
  await prisma.configuracao.create({
    data: {
      id: "4",
      nomeSite: "Dezko",
      descricaoSite: "Plataforma de reserva de espaços",
      emailContato: "contato@dezko.com",
      telefoneContato: "(11) 99999-9999",
      enderecoEmpresa: "Rua Exemplo, 123",
      tipo: "planos",
      valor: JSON.stringify({
        basico: {
          nome: "Plano Básico",
          valor: 49.90,
          descricao: "Ideal para quem está começando",
          limiteAgendas: 2
        },
        premium: {
          nome: "Plano Premium",
          valor: 99.90,
          descricao: "Para espaços em crescimento",
          limiteAgendas: 5
        },
        enterprise: {
          nome: "Plano Enterprise",
          valor: 299.90,
          descricao: "Para grandes estabelecimentos",
          limiteAgendas: 10
        }
      })
    }
  })

  // Criar Usuários
  console.log('Criando usuários...')
  const usuarios = [
    {
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: '123456',
      avatar: 'https://github.com/shadcn.png',
    },
    {
      nome: 'Maria Santos',
      email: 'maria@example.com',
      senha: '123456',
      avatar: 'https://github.com/shadcn.png',
    },
  ]

  for (const usuario of usuarios) {
    const hashedPassword = await argon2.hash(usuario.senha);
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: { senha: hashedPassword },
      create: {
        nome: usuario.nome,
        email: usuario.email,
        senha: hashedPassword,
        avatar: usuario.avatar,
      },
    })
  }

  // Criar Categorias
  console.log('Criando categorias...')
  const categorias = [
    {
      nome: "Coworking",
      slug: "coworking"
    },
    {
      nome: "Produção Multimídia",
      slug: "producao-multimidia"
    }
  ]

  for (const categoria of categorias) {
    await prisma.categoriaEspaco.upsert({
      where: { slug: categoria.slug },
      update: categoria,
      create: categoria
    })
  }

  // Criar Espaços
  console.log('Criando espaços...')
  const espacos = [
    {
      nome: "Coworking Central",
      descricao: "Espaço de coworking no centro da cidade",
      endereco: "Rua do Centro, 123",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01001-000",
      latitude: -23.550520,
      longitude: -46.633308,
      telefone: "(11) 99999-9999",
      email: "contato@coworkingcentral.com",
      website: "https://coworkingcentral.com",
      instagram: "@coworkingcentral",
      facebook: "coworkingcentral",
      whatsapp: "(11) 99999-9999",
      imagens: [
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
        "https://images.unsplash.com/photo-1497366216548-37526070297c",
        "https://images.unsplash.com/photo-1497366754035-5f07c9b06d64"
      ],
      senha: await argon2.hash("123456"),
      adminId: admin.id,
      status: "ativo",
      categorias: {
        connect: [{ slug: "coworking" }]
      },
      agendas: {
        create: [
          {
            titulo: "Mesa Individual",
            tipoReserva: TipoReserva.HORA,
            turno: Turno.MANHA,
            horaInicio: "08:00",
            horaFim: "18:00",
            dataInicio: new Date(),
            dataFim: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            valorHora: 25,
            valorTurno: null,
            valorDia: null
          },
          {
            titulo: "Sala de Reunião",
            tipoReserva: TipoReserva.HORA,
            turno: Turno.TARDE,
            horaInicio: "08:00",
            horaFim: "18:00",
            dataInicio: new Date(),
            dataFim: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            valorHora: 50,
            valorTurno: null,
            valorDia: null
          }
        ]
      }
    },
    {
      nome: "Studio de Fotografia",
      descricao: "Estúdio fotográfico profissional",
      endereco: "Rua das Artes, 456",
      bairro: "Vila Madalena",
      cidade: "São Paulo",
      estado: "SP",
      cep: "05443-000",
      latitude: -23.556680,
      longitude: -46.687540,
      telefone: "(11) 98888-8888",
      email: "contato@studiofoto.com",
      website: "https://studiofoto.com",
      instagram: "@studiofoto",
      facebook: "studiofoto",
      whatsapp: "(11) 98888-8888",
      imagens: [
        "https://images.unsplash.com/photo-1520333789090-1afc82db536a",
        "https://images.unsplash.com/photo-1520333789090-1afc82db536b",
        "https://images.unsplash.com/photo-1520333789090-1afc82db536c"
      ],
      senha: await argon2.hash("123456"),
      adminId: admin.id,
      status: "ativo",
      categorias: {
        connect: [{ slug: "producao-multimidia" }]
      },
      agendas: {
        create: [
          {
            titulo: "Estúdio Completo",
            tipoReserva: TipoReserva.TURNO,
            turno: Turno.MANHA,
            horaInicio: "08:00",
            horaFim: "18:00",
            dataInicio: new Date(),
            dataFim: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            valorHora: null,
            valorTurno: 300,
            valorDia: 800
          }
        ]
      }
    }
  ]

  // Criar espaços e guardar seus IDs
  const espacoIds = [];
  for (const espaco of espacos) {
    const novoEspaco = await prisma.espaco.create({
      data: espaco
    })
    espacoIds.push(novoEspaco.id);
  }

  // Atualizar o status dos espaços para ativo
  await prisma.espaco.updateMany({
    where: {
      id: {
        in: espacoIds
      }
    },
    data: {
      status: "ativo"
    }
  })

  // Criar assinaturas para o primeiro espaço
  console.log('Criando assinaturas...');
  const dataAtual = new Date();
  const dataInicio = new Date(dataAtual);
  dataInicio.setMonth(dataInicio.getMonth() - 1); // Começou há 1 mês
  const dataExpiracao = new Date(dataAtual);
  dataExpiracao.setMonth(dataExpiracao.getMonth() + 1); // Expira em 1 mês

  const assinatura = await prisma.assinatura.create({
    data: {
      espacoId: espacoIds[0],
      status: "ATIVA",
      dataInicio,
      dataExpiracao,
      valor: 99.90,
      nome: "Plano Premium",
      tipo: "premium"
    }
  });

  // Criar renovação para a assinatura
  await prisma.renovacaoAssinatura.create({
    data: {
      assinaturaId: assinatura.id,
      dataPagamento: dataInicio,
      status: "PAGO",
      valor: 99.90,
      gateway: "mercadopago",
      gatewayId: "87654321"
    }
  });

  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

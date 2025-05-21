import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/pt_BR'

// Inicializa o Prisma
const prisma = new PrismaClient()

// URLs de imagens de exemplos para espaços
const imagensExemplo = [
  "https://images.unsplash.com/photo-1518281361980-b26bfd556770",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  "https://images.unsplash.com/photo-1564069114553-7215e1ff1890",
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4",
  "https://images.unsplash.com/photo-1600508774634-4e11d34730e2",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76",
  "https://images.unsplash.com/photo-1577979879426-aea805cfc0ae",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5",
  "https://images.unsplash.com/photo-1601119479271-21ca92049c81"
]

async function main() {
  try {
    console.log('Iniciando a criação de espaços de exemplo...')

    // Buscar todas as categorias e subcategorias
    const categorias = await prisma.categoriaEspaco.findMany()
    if (categorias.length === 0) {
      throw new Error('Nenhuma categoria encontrada. Execute o script adicionar-categorias.ts primeiro.')
    }

    const subcategorias = await prisma.subCategoriaEspaco.findMany()
    
    // Buscar um admin para associar aos espaços
    const admin = await prisma.admin.findFirst()
    if (!admin) {
      throw new Error('Nenhum admin encontrado. Crie pelo menos um admin antes de executar este script.')
    }

    // Criar 5 espaços de exemplo
    for (let i = 0; i < 5; i++) {
      // Seleciona aleatoriamente uma categoria e subcategoria relacionada
      const categoria = categorias[Math.floor(Math.random() * categorias.length)]
      const subcategoriasRelacionadas = subcategorias.filter(sub => sub.categoriaId === categoria.id)
      const subcategoria = subcategoriasRelacionadas.length > 0
        ? subcategoriasRelacionadas[Math.floor(Math.random() * subcategoriasRelacionadas.length)]
        : null
      
      // Gera dados aleatórios para o espaço
      const nomeEspaco = `${faker.company.name()} ${faker.company.buzzNoun()}`
      const emailEspaco = faker.internet.email().toLowerCase()
      const telefone = faker.phone.number('+55 ## #####-####')
      const whatsapp = faker.phone.number('+55 ## #####-####')
      
      // Imagens aleatórias do espaço
      const fotoCapa = imagensExemplo[Math.floor(Math.random() * imagensExemplo.length)]
      const fotoPrincipal = imagensExemplo[Math.floor(Math.random() * imagensExemplo.length)]
      const imagens = Array.from({ length: 4 }, () => imagensExemplo[Math.floor(Math.random() * imagensExemplo.length)])
      
      // Informações de endereço
      const endereco = faker.location.street()
      const numero = faker.number.int({ min: 1, max: 2000 }).toString()
      const complemento = faker.location.secondaryAddress()
      const bairro = faker.location.county()
      const cidade = faker.location.city()
      const estado = faker.location.state()
      const cep = faker.location.zipCode('########')
      const latitude = parseFloat(faker.location.latitude())
      const longitude = parseFloat(faker.location.longitude())
      
      console.log(`Criando espaço: ${nomeEspaco}`)
      
      // Criar o espaço
      const espaco = await prisma.espaco.create({
        data: {
          nome: nomeEspaco,
          email: emailEspaco,
          senha: '$2a$10$1zRIYJpmfmtBnXMOaLv9HOcy7d8.xH6LKrj7U4kxqGMulLbKnzKK2', // senha123
          descricao: faker.lorem.paragraphs(2),
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          latitude,
          longitude,
          telefone,
          whatsapp,
          website: faker.internet.url(),
          instagram: `@${nomeEspaco.toLowerCase().replace(/\s+/g, '')}_oficial`,
          facebook: `${nomeEspaco.toLowerCase().replace(/\s+/g, '')}`,
          capacidade: `${faker.number.int({ min: 10, max: 500 })} pessoas`,
          cnpj: faker.number.int({ min: 10000000000000, max: 99999999999999 }).toString(),
          razaoSocial: `${nomeEspaco} LTDA`,
          status: 'ativo',
          fotoCapa,
          fotoPrincipal,
          imagens,
          adminId: admin.id,
          categorias: {
            connect: { id: categoria.id }
          },
          ...(subcategoria && {
            subcategorias: {
              connect: { id: subcategoria.id }
            }
          })
        }
      })
      
      // Criar horários de funcionamento para o espaço
      const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
      for (const dia of diasSemana) {
        if (dia === 'Domingo' && Math.random() > 0.5) continue // 50% de chance de não funcionar no domingo
        
        await prisma.horarios.create({
          data: {
            espacoId: espaco.id,
            diaSemana: dia,
            horaInicio: dia === 'Sábado' || dia === 'Domingo' ? '09:00' : '08:00',
            horaFim: dia === 'Sábado' || dia === 'Domingo' ? '17:00' : '18:00'
          }
        })
      }
      
      // Criar benefícios para o espaço
      const beneficiosOpcoes = [
        'Wi-Fi Grátis',
        'Ar-condicionado',
        'Estacionamento',
        'Acessibilidade',
        'Café incluso',
        'Material de escritório',
        'TV/Projetor',
        'Som ambiente',
        'Segurança 24h',
        'Limpeza inclusa'
      ]
      
      // Selecionar 5-7 benefícios aleatoriamente
      const numBeneficios = faker.number.int({ min: 5, max: 7 })
      const beneficiosSelecionados = faker.helpers.arrayElements(beneficiosOpcoes, numBeneficios)
      
      for (const beneficio of beneficiosSelecionados) {
        await prisma.beneficios.create({
          data: {
            espacoId: espaco.id,
            nome: beneficio
          }
        })
      }
      
      // Criar adicionais para o espaço
      const adicionaisOpcoes = [
        'Serviço de coffee break',
        'Decoração personalizada',
        'Equipamento de som profissional',
        'Serviço de catering',
        'Fotógrafo profissional',
        'Recepcionista',
        'Tradutor',
        'Segurança adicional',
        'Transfer aeroporto',
        'Equipamentos extras'
      ]
      
      // Selecionar 3-5 adicionais aleatoriamente
      const numAdicionais = faker.number.int({ min: 3, max: 5 })
      const adicionaisSelecionados = faker.helpers.arrayElements(adicionaisOpcoes, numAdicionais)
      
      for (const adicional of adicionaisSelecionados) {
        await prisma.adicionais.create({
          data: {
            espacoId: espaco.id,
            nome: adicional
          }
        })
      }
      
      // Criar planos para o espaço
      const planosTipos = ['básico', 'padrão', 'premium']
      const planosPrecos = [50, 100, 200]
      const planosDuracao = [7, 30, 90]
      const planosLimites = [1, 3, 10]
      
      for (let j = 0; j < 3; j++) {
        await prisma.plano.create({
          data: {
            espacoId: espaco.id,
            nome: `Plano ${planosTipos[j].charAt(0).toUpperCase() + planosTipos[j].slice(1)}`,
            descricao: `Acesso ${planosTipos[j]} ao espaço com ${planosLimites[j]} agendamentos`,
            preco: planosPrecos[j],
            duracao: planosDuracao[j],
            limiteAgendas: planosLimites[j],
            tipo: planosTipos[j]
          }
        })
      }
      
      // Criar agendas para o espaço
      const agendaTipos = ['por hora', 'por turno', 'por dia']
      const agendaTitulos = ['Agenda Regular', 'Pacote Especial', 'Reserva Premium']
      const valoresHora = [50, 80, 120]
      const valoresTurno = [150, 250, 350] 
      const valoresDia = [350, 500, 750]
      
      for (let j = 0; j < 3; j++) {
        await prisma.agenda.create({
          data: {
            espacoId: espaco.id,
            titulo: agendaTitulos[j],
            descricao: `Reserva ${agendaTipos[j]} para ${categoria.nome}`,
            tipoReserva: agendaTipos[j] === 'por hora' 
              ? 'HORA' 
              : agendaTipos[j] === 'por turno' ? 'TURNO' : 'DIA',
            dataInicio: new Date(),
            dataFim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias a partir de hoje
            valorHora: agendaTipos[j] === 'por hora' ? valoresHora[j] : null,
            valorTurno: agendaTipos[j] === 'por turno' ? valoresTurno[j] : null,
            valorDia: agendaTipos[j] === 'por dia' ? valoresDia[j] : null
          }
        })
      }
      
      console.log(`✅ Espaço ${nomeEspaco} criado com sucesso!`)
    }
    
    console.log('✅ Todos os espaços foram criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar espaços:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Script executado com sucesso!'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

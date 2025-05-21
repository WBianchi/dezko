import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Categoria {
  nome: string
  slug: string
  descricao?: string
  icone?: string
  subcategorias: Subcategoria[]
}

interface Subcategoria {
  nome: string
  slug: string
  descricao?: string
  icone?: string
}

// Função para converter qualquer string em um slug válido
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

async function main() {
  try {
    console.log('Iniciando a adição de categorias...')

    // Lista de categorias que serão adicionadas
    const categorias: Categoria[] = [
      {
        nome: 'Automotivo',
        slug: 'automotivo',
        descricao: 'Ideal para quem precisa de instalações equipadas para manutenção e reparo de veículos. Oficinas mecânicas, centros de inspeção e espaços para detalhamento automotivo.',
        icone: 'car',
        subcategorias: [
          {
            nome: 'Oficinas mecânicas',
            slug: 'oficinas-mecanicas',
            descricao: 'Mecânicos, Técnicos de Manutenção Automotiva',
            icone: 'wrench'
          },
          {
            nome: 'Centros de Inspeção',
            slug: 'centros-de-inspecao',
            descricao: 'Inspetores Veiculares, Técnicos de Inspeção Automotiva',
            icone: 'clipboard-check'
          },
          {
            nome: 'Estética e Limpeza Automotiva',
            slug: 'estetica-e-limpeza-automotiva',
            descricao: 'Detalhadores Automotivos, Técnicos de Limpeza e Estética de Veículos',
            icone: 'sparkles'
          },
          {
            nome: 'Pneus e Alinhamentos',
            slug: 'pneus-e-alinhamentos',
            descricao: 'Especialistas em Pneus, Técnicos de Alinhamento e Balanceamento',
            icone: 'italic'
          },
          {
            nome: 'Eletricistas Automotivos',
            slug: 'eletricistas-automotivos',
            descricao: 'Eletricistas Automotivos, Técnicos em Sistemas Elétricos de Veículos',
            icone: 'zap'
          }
        ]
      },
      {
        nome: 'Saúde e Bem-Estar',
        slug: 'saude-e-bem-estar',
        descricao: 'Consultórios, clínicas e salas de terapia. Perfeito para psicólogos, fisioterapeutas, dentistas e outros profissionais de saúde que necessitam de um ambiente tranquilo e profissional.',
        icone: 'heart-pulse',
        subcategorias: [
          {
            nome: 'Consultórios médicos',
            slug: 'consultorios-medicos',
            descricao: 'Médicos, Clínicos Gerais, Especialistas',
            icone: 'stethoscope'
          },
          {
            nome: 'Clínicas de Fisioterapia',
            slug: 'clinicas-de-fisioterapia',
            descricao: 'Fisioterapeutas, Terapeutas Ocupacionais',
            icone: 'activity'
          },
          {
            nome: 'Salas de Terapia',
            slug: 'salas-de-terapia',
            descricao: 'Psicólogos, Terapeutas',
            icone: 'brain'
          },
          {
            nome: 'Consultórios odontológicos',
            slug: 'consultorios-odontologicos',
            descricao: 'Dentistas, Ortodontistas, Periodontistas',
            icone: 'tooth'
          }
        ]
      },
      {
        nome: 'Beleza e Estética',
        slug: 'beleza-e-estetica',
        descricao: 'Salões de beleza, barbearias, estúdios de maquiagem e espaços para manicures e pedicures. Um espaço inspirador para transformar a beleza de seus clientes.',
        icone: 'scissors',
        subcategorias: [
          {
            nome: 'Salão de beleza',
            slug: 'salao-de-beleza',
            descricao: 'Cabeleireiros, Coloristas',
            icone: 'scissors'
          },
          {
            nome: 'Barbearias',
            slug: 'barbearias',
            descricao: 'Barbeiros',
            icone: 'razor'
          },
          {
            nome: 'Estúdios de maquiagem',
            slug: 'estudios-de-maquiagem',
            descricao: 'Maquiadores, Artistas de Maquiagem',
            icone: 'brush'
          },
          {
            nome: 'Manicures e pedicures',
            slug: 'manicures-e-pedicures',
            descricao: 'Manicures, Pedicures',
            icone: 'hand'
          },
          {
            nome: 'Centros de estética',
            slug: 'centros-de-estetica',
            descricao: 'Esteticistas, Dermaticistas',
            icone: 'sparkles'
          }
        ]
      },
      {
        nome: 'Artes e Educação',
        slug: 'artes-e-educacao',
        descricao: 'Salas de aula, centros de treinamento, espaços para workshops, teatros e salas de música. Equipados para oferecer cursos, palestras e treinamentos com todo o conforto e recursos necessários.',
        icone: 'book-open',
        subcategorias: [
          {
            nome: 'Salas de aula',
            slug: 'salas-de-aula',
            descricao: 'Professores, Educadores, Instrutores',
            icone: 'school'
          },
          {
            nome: 'Treinamentos corporativos',
            slug: 'treinamentos-corporativos',
            descricao: 'Consultores de Treinamento, Facilitadores',
            icone: 'presentation'
          },
          {
            nome: 'Estúdios de artes',
            slug: 'estudios-de-artes',
            descricao: 'Artistas Plásticos, Instrutores de Arte',
            icone: 'palette'
          },
          {
            nome: 'Teatros',
            slug: 'teatros',
            descricao: 'Diretores de Teatro, Instrutores de Artes Cênicas',
            icone: 'theater'
          },
          {
            nome: 'Palestras',
            slug: 'palestras',
            descricao: 'Palestrantes, Conferencistas, Moderadores',
            icone: 'mic'
          }
        ]
      },
      {
        nome: 'Tecnologia e Inovação',
        slug: 'tecnologia-e-inovacao',
        descricao: 'Laboratórios de informática, espaços de coworking e hubs de inovação. Perfeito para startups, desenvolvedores e empreendedores tecnológicos.',
        icone: 'cpu',
        subcategorias: [
          {
            nome: 'Laboratórios de informática',
            slug: 'laboratorios-de-informatica',
            descricao: 'Técnicos de Informática, Instrutores de TI',
            icone: 'monitor'
          },
          {
            nome: 'Hubs',
            slug: 'hubs',
            descricao: 'Startups, Empreendedores, Inovadores',
            icone: 'network'
          },
          {
            nome: 'Lan House',
            slug: 'lan-house',
            descricao: 'Técnicos de Suporte, Gamers, Desenvolvedores de Jogos',
            icone: 'gamepad-2'
          }
        ]
      },
      {
        nome: 'Fitness e Esportes',
        slug: 'fitness-e-esportes',
        descricao: 'Estúdios de pilates, academias, espaços para yoga e quadras esportivas. Ambientes dedicados ao bem-estar físico e mental, com equipamentos de alta qualidade.',
        icone: 'dumbbell',
        subcategorias: [
          {
            nome: 'Estúdios de pilates',
            slug: 'estudios-de-pilates',
            descricao: 'Instrutores de Pilates, Fisioterapeutas',
            icone: 'heart'
          },
          {
            nome: 'Academias',
            slug: 'academias',
            descricao: 'Personal Trainers, Instrutores de Fitness',
            icone: 'dumbbell'
          },
          {
            nome: 'Yoga',
            slug: 'yoga',
            descricao: 'Instrutores de Yoga',
            icone: 'flower'
          },
          {
            nome: 'Campos de Futebol',
            slug: 'campos-de-futebol',
            descricao: 'Treinadores, Instrutores de Futebol',
            icone: 'soccer-ball'
          },
          {
            nome: 'Futebol de areia',
            slug: 'futebol-de-areia',
            descricao: 'Treinadores de Futebol de Areia',
            icone: 'beach'
          },
          {
            nome: 'Futebol de salão',
            slug: 'futebol-de-salao',
            descricao: 'Treinadores de Futsal',
            icone: 'soccer-ball'
          },
          {
            nome: 'Futebol Society',
            slug: 'futebol-society',
            descricao: 'Treinadores de Futebol Society',
            icone: 'soccer-ball'
          },
          {
            nome: 'Piscinas',
            slug: 'piscinas',
            descricao: 'Instrutores de Natação, Treinadores Aquáticos',
            icone: 'droplets'
          },
          {
            nome: 'Artes Marcias',
            slug: 'artes-marcias',
            descricao: 'Instrutores de Artes Marciais, Treinadores de Lutas',
            icone: 'sword'
          },
          {
            nome: 'Quadras de Basquetes',
            slug: 'quadras-de-basquetes',
            descricao: 'Treinadores de Basquete',
            icone: 'dot'
          },
          {
            nome: 'Quadras de Tênis',
            slug: 'quadras-de-tenis',
            descricao: 'Treinadores de Tênis',
            icone: 'racquet'
          }
        ]
      },
      {
        nome: 'Gastronomia',
        slug: 'gastronomia',
        descricao: 'Cozinhas comerciais, espaços para workshops culinários e degustações. Ideal para chefs, confeiteiros e comerciantes gastronômicos que desejam um ambiente equipado para suas criações e vendas.',
        icone: 'chef-hat',
        subcategorias: [
          {
            nome: 'Cozinhas comerciais',
            slug: 'cozinhas-comerciais',
            descricao: 'Chefs, Cozinheiros, Confeiteiros, Salgadeiros',
            icone: 'utensils'
          },
          {
            nome: 'Workshops culinários/degustações',
            slug: 'workshops-culinarios-degustacoes',
            descricao: 'Chefs, Instrutores de Culinária, Sommeliers',
            icone: 'cooking-pot'
          },
          {
            nome: 'Delivery',
            slug: 'delivery',
            descricao: 'Donos de Negócios de Alimentação',
            icone: 'package'
          },
          {
            nome: 'Bistrôs e Cafeterias',
            slug: 'bistros-e-cafeterias',
            descricao: 'Baristas, Proprietários de Bistrôs',
            icone: 'coffee'
          }
        ]
      },
      {
        nome: 'Eventos e Conferências',
        slug: 'eventos-e-conferencias',
        descricao: 'Salões de eventos, auditórios e salas de conferência. Perfeito para reuniões, seminários e eventos corporativos, com toda a estrutura necessária para um evento de sucesso.',
        icone: 'calendar',
        subcategorias: [
          {
            nome: 'Salões de Eventos',
            slug: 'saloes-de-eventos',
            descricao: 'Organizadores de Eventos, Planejadores de Casamentos',
            icone: 'party-popper'
          },
          {
            nome: 'Auditórios',
            slug: 'auditorios',
            descricao: 'Palestrantes, Conferencistas',
            icone: 'theater'
          },
          {
            nome: 'Chácaras',
            slug: 'chacaras',
            descricao: 'Organizadores de Eventos',
            icone: 'home'
          },
          {
            nome: 'Sítios',
            slug: 'sitios',
            descricao: 'Organizadores de Eventos ao Ar Livre',
            icone: 'mountain'
          },
          {
            nome: 'Centros de convenções',
            slug: 'centros-de-convencoes',
            descricao: 'Organizadores de Conferências, Gerentes de Eventos',
            icone: 'building-2'
          }
        ]
      },
      {
        nome: 'Produção Multimídia',
        slug: 'producao-multimidia',
        descricao: 'Estúdios fotográficos e espaços para filmagem. Equipados com iluminação profissional e fundo infinito, perfeitos para fotógrafos e videomakers.',
        icone: 'camera',
        subcategorias: [
          {
            nome: 'Estúdios de fotografia',
            slug: 'estudios-de-fotografia',
            descricao: 'Fotógrafos, Instrutores de Fotografia',
            icone: 'camera'
          },
          {
            nome: 'Estúdios de filmagem',
            slug: 'estudios-de-filmagem',
            descricao: 'Videomakers, Diretores de Vídeo',
            icone: 'video'
          },
          {
            nome: 'Estúdios de som e dublagem',
            slug: 'estudios-de-som-e-dublagem',
            descricao: 'Produtores de Áudio, Técnicos de Som, Dubladores, Cantores',
            icone: 'mic'
          }
        ]
      },
      {
        nome: 'Consultoria e Negócios',
        slug: 'consultoria-e-negocios',
        descricao: 'Escritórios, salas de reunião e espaços de coworking. Ambientes profissionais e bem equipados para consultores, advogados e empresários realizarem seus negócios.',
        icone: 'briefcase',
        subcategorias: [
          {
            nome: 'Escritórios',
            slug: 'escritorios',
            descricao: 'Advogados, Consultores, Contadores',
            icone: 'briefcase'
          },
          {
            nome: 'Salas de reunião',
            slug: 'salas-de-reuniao',
            descricao: 'Consultores, Executivos, Gerentes de Projeto',
            icone: 'users'
          },
          {
            nome: 'Coworking',
            slug: 'coworking',
            descricao: 'Freelancers, Empreendedores, Startups',
            icone: 'layout-dashboard'
          }
        ]
      },
      {
        nome: 'Moda e Design',
        slug: 'moda-e-design',
        descricao: 'Ateliês de costura, estúdios de design e espaços para produção de moda. Ideal para estilistas e profissionais da beleza que precisam de um espaço criativo e funcional.',
        icone: 'shirt',
        subcategorias: [
          {
            nome: 'Ateliês de costura',
            slug: 'atelies-de-costura',
            descricao: 'Estilistas, Costureiros',
            icone: 'scissors'
          },
          {
            nome: 'Estúdios de design',
            slug: 'estudios-de-design',
            descricao: 'Designers Gráficos, Designers de Moda',
            icone: 'pencil-ruler'
          },
          {
            nome: 'Fábricas textil',
            slug: 'fabricas-textil',
            descricao: 'Empreendedores de Moda, Produtores Têxteis',
            icone: 'fold-horizontal'
          }
        ]
      },
      {
        nome: 'Logística e Transporte',
        slug: 'logistica-e-transporte',
        descricao: 'Armazéns, centros de distribuição e espaços para logística. Ideais para empresas que precisam de locais estratégicos para armazenamento e movimentação de mercadorias.',
        icone: 'truck',
        subcategorias: [
          {
            nome: 'Armazéns',
            slug: 'armazens',
            descricao: 'Gerentes de Logística, Coordenadores de Armazém',
            icone: 'warehouse'
          },
          {
            nome: 'Centros de Destibuição',
            slug: 'centros-de-destibuicao',
            descricao: 'Gerentes de Distribuição, Coordenadores de Logística',
            icone: 'route'
          },
          {
            nome: 'Portos',
            slug: 'portos',
            descricao: 'Gerentes Portuários, Coordenadores de Transporte',
            icone: 'anchor'
          },
          {
            nome: 'Containers',
            slug: 'containers',
            descricao: 'Gerentes de Logística, Coordenadores de Transporte',
            icone: 'box'
          },
          {
            nome: 'Garagem de Frotas',
            slug: 'garagem-de-frotas',
            descricao: 'Gerentes de Frotas, Coordenadores de Transporte',
            icone: 'car'
          },
          {
            nome: 'Pontos de Entrega e Coleta',
            slug: 'pontos-de-entrega-e-coleta',
            descricao: 'Gerentes de Logística, Coordenadores de Transporte',
            icone: 'package'
          }
        ]
      },
      {
        nome: 'Serviços Gerais',
        slug: 'servicos-gerais',
        descricao: 'Espaços multifuncionais para diferentes tipos de serviços, desde reparos domésticos até consultoria empresarial. Flexibilidade para atender diversas necessidades.',
        icone: 'tool',
        subcategorias: [
          {
            nome: 'Reparos domésticos',
            slug: 'reparos-domesticos',
            descricao: 'Técnicos de Manutenção, Reparadores Domésticos',
            icone: 'hammer'
          },
          {
            nome: 'Limpeza de estofados',
            slug: 'limpeza-de-estofados',
            descricao: 'Técnicos de Limpeza, Especialistas em Higienização',
            icone: 'spray-can'
          },
          {
            nome: 'Oficinas de marcenaria',
            slug: 'oficinas-de-marcenaria',
            descricao: 'Marceneiros, Artesãos de Madeira',
            icone: 'axe'
          },
          {
            nome: 'Oficinas de eletrônica',
            slug: 'oficinas-de-eletronica',
            descricao: 'Técnicos de Eletrônica, Reparadores de Equipamentos',
            icone: 'cpu'
          },
          {
            nome: 'Chaveiros',
            slug: 'chaveiros',
            descricao: 'Chaveiros, Especialistas em Segurança',
            icone: 'key'
          },
          {
            nome: 'Lavanderias',
            slug: 'lavanderias',
            descricao: 'Técnicos de Lavanderia, Gerentes de Lavanderia',
            icone: 'washer'
          }
        ]
      }
    ];

    // Adicionar cada categoria e suas subcategorias
    for (const categoria of categorias) {
      console.log(`Adicionando categoria: ${categoria.nome}`)
      
      // Garantir que o slug seja único
      const slugCategoria = categoria.slug || slugify(categoria.nome)
      
      const categoriaCriada = await prisma.categoriaEspaco.create({
        data: {
          nome: categoria.nome,
          slug: slugCategoria,
          descricao: categoria.descricao,
          icone: categoria.icone
        }
      })
      
      // Adicionar subcategorias
      for (const subcategoria of categoria.subcategorias) {
        console.log(`  - Adicionando subcategoria: ${subcategoria.nome}`)
        
        // Garantir que o slug da subcategoria seja único
        const slugSubcategoria = subcategoria.slug || slugify(subcategoria.nome)
        
        await prisma.$executeRaw`
          INSERT INTO "SubCategoriaEspaco" ("id", "nome", "slug", "descricao", "icone", "categoriaId", "createdAt", "updatedAt")
          VALUES (${`cuid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`}, 
                 ${subcategoria.nome}, 
                 ${slugSubcategoria}, 
                 ${subcategoria.descricao || null}, 
                 ${subcategoria.icone || null}, 
                 ${categoriaCriada.id}, 
                 ${new Date()}, 
                 ${new Date()})
        `
      }
    }

    console.log('✅ Categorias e subcategorias adicionadas com sucesso!')
  } catch (error) {
    console.error('Erro ao adicionar categorias:', error)
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

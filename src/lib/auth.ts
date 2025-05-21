import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import * as argon2 from "argon2"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        console.log("Authorize chamado com:", credentials)

        if (!credentials?.email || !credentials?.senha || !credentials?.role) {
          console.log("Credenciais inválidas:", { email: !!credentials?.email, senha: !!credentials?.senha, role: credentials?.role })
          throw new Error("Credenciais inválidas")
        }

        // Verifica se é admin
        if (credentials.role === "admin") {
          console.log("Tentando autenticar como admin")
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          })

          if (!admin) {
            console.log("Admin não encontrado:", credentials.email)
            return null
          }

          try {
            const senhaCorreta = await argon2.verify(admin.senha, credentials.senha)
            if (!senhaCorreta) {
              console.log("Senha incorreta para admin:", credentials.email)
              return null
            }

            return {
              id: admin.id,
              email: admin.email,
              name: admin.nome,
              role: "admin"
            }
          } catch (error) {
            console.error("Erro ao verificar senha do admin:", error)
            return null
          }
        } 
        // Verifica se é espaço
        else if (credentials.role === "espaco") {
          console.log("Tentando autenticar espaço:", credentials.email)
          
          try {
            // Buscar o espaço específico
            const espacos = await prisma.espaco.findMany({
              where: { 
                email: credentials.email
              },
              take: 1
            })

            console.log("Espaços encontrados:", espacos)

            if (!espacos.length) {
              console.log("Espaço não encontrado:", credentials.email)
              return null
            }

            const espaco = espacos[0]
            console.log("Usando espaço:", espaco)

            const senhaCorreta = await argon2.verify(espaco.senha, credentials.senha)
            console.log("Senha está correta:", senhaCorreta)

            if (!senhaCorreta) {
              console.log("Senha incorreta para o espaço:", credentials.email)
              return null
            }

            const espacoData = {
              id: espaco.id,
              email: espaco.email,
              name: espaco.nome,
              role: "espaco",
              espacoId: espaco.id // Adicionando o espacoId no objeto da sessão
            }

            console.log("Retornando dados do espaço:", espacoData)
            return espacoData
          } catch (error) {
            console.error("Erro ao autenticar espaço:", error)
            return null
          }
        } 
        // Verifica se é usuário
        else if (credentials.role === "usuario") {
          console.log("Tentando autenticar como usuário")
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email }
          })

          if (!usuario) {
            console.log("Usuário não encontrado:", credentials.email)
            return null
          }

          try {
            const senhaCorreta = await argon2.verify(usuario.senha, credentials.senha)
            if (!senhaCorreta) {
              console.log("Senha incorreta para usuário:", credentials.email)
              return null
            }

            return {
              id: usuario.id,
              email: usuario.email,
              name: usuario.nome,
              role: "usuario"
            }
          } catch (error) {
            console.error("Erro ao verificar senha do usuário:", error)
            return null
          }
        }

        console.log("Role inválida:", credentials.role)
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - Token:", token)
      console.log("JWT Callback - User:", user)

      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        
        // Adiciona o espacoId ao token se for um usuário do tipo espaço
        if (user.role === "espaco" && 'espacoId' in user) {
          token.espacoId = user.espacoId
        }
      }

      console.log("JWT Callback - Token Final:", token)
      return token
    },

    async session({ session, token }) {
      console.log("Session Callback - Session:", session)
      console.log("Session Callback - Token:", token)

      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        
        // Passa o espacoId do token para a sessão
        if ('espacoId' in token) {
          session.user.espacoId = token.espacoId
        }
      }

      console.log("Session Callback - Session Final:", session)
      return session
    },
    async redirect({ url, baseUrl }) {
      // Se a URL começar com o baseUrl, permitir o redirecionamento
      if (url.startsWith(baseUrl)) return url
      // Se for uma URL relativa, adicionar o baseUrl
      else if (url.startsWith("/")) return `${baseUrl}${url}`
      // Caso contrário, redirecionar para o baseUrl
      return baseUrl
    }
  }
}

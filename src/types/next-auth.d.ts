import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  /**
   * Estende o objeto User para incluir o papel do usuário
   */
  interface User {
    id: string
    role: Role
  }

  /**
   * Estende as propriedades da sessão para incluir o papel do usuário e ID
   */
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }
}

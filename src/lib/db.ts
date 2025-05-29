// Reexport prisma client para manter compatibilidade com importações existentes
import { prisma } from './prisma'

export const db = prisma

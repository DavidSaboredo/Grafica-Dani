import { PrismaClient } from '@prisma/client'

// Una sola instancia en desarrollo (el recargado en caliente crearía conexiones nuevas)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

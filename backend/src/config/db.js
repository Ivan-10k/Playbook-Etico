import { PrismaClient } from '@prisma/client';

// Inicializamos la conexión pasándole un objeto de configuración (Opciones)
const prisma = new PrismaClient({
  // Activamos los logs para ver las consultas SQL en la terminal
  log: ['query', 'error', 'warn'],
});

export default prisma;
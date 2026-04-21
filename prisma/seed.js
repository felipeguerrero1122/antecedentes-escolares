import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@colegio.cl";
  const password = process.env.ADMIN_PASSWORD || "Admin123456";
  const nombre = process.env.ADMIN_NAME || "Administrador Principal";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {
      nombre,
      passwordHash,
      activo: true,
    },
    create: {
      email,
      nombre,
      passwordHash,
      activo: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

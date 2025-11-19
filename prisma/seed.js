const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const senha = process.env.ADMIN_PASSWORD || '123456';
  const hash = await bcrypt.hash(senha, 10);
  const existe = await prisma.usuario.findUnique({ where: { login: 'admin' } });
  if (!existe) {
    await prisma.usuario.create({
      data: { nome: 'Administrador', login: 'admin', senha: hash, role: 'admin' }
    });
    console.log('Admin criado (login: admin)');
  } else console.log('Admin já existe');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());

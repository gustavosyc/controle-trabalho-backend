import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pergunta(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
}

async function criarUsuario() {
  console.log('\n🎯 === CADASTRO DE NOVO USUÁRIO ===\n');

  try {
    // Coletar informações
    const nome = await pergunta('📝 Nome completo: ');
    if (!nome.trim()) {
      console.log('❌ Nome é obrigatório!');
      process.exit(1);
    }

    const login = await pergunta('👤 Login: ');
    if (!login.trim()) {
      console.log('❌ Login é obrigatório!');
      process.exit(1);
    }

    // Verificar se login já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { login }
    });

    if (usuarioExistente) {
      console.log('❌ Erro: Login já está em uso!');
      process.exit(1);
    }

    const senha = await pergunta('🔒 Senha: ');
    if (!senha.trim() || senha.length < 6) {
      console.log('❌ Senha deve ter no mínimo 6 caracteres!');
      process.exit(1);
    }

    const cargo = await pergunta('💼 Cargo (opcional): ');

    const roleInput = await pergunta('👑 Tipo (1=Usuário, 2=Admin) [1]: ');
    const role = roleInput === '2' ? 'admin' : 'usuario';

    // Confirmar dados
    console.log('\n📋 === DADOS DO USUÁRIO ===');
    console.log(`Nome: ${nome}`);
    console.log(`Login: ${login}`);
    console.log(`Cargo: ${cargo || '(não informado)'}`);
    console.log(`Tipo: ${role === 'admin' ? '👑 Administrador' : '👤 Usuário'}`);
    console.log('');

    const confirmar = await pergunta('✅ Confirmar cadastro? (s/n): ');
    
    if (confirmar.toLowerCase() !== 's') {
      console.log('❌ Cadastro cancelado!');
      process.exit(0);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        login,
        senha: senhaHash,
        cargo: cargo || null,
        role
      }
    });

    console.log('\n✅ Usuário criado com sucesso!');
    console.log(`ID: ${novoUsuario.id}`);
    console.log(`Nome: ${novoUsuario.nome}`);
    console.log(`Login: ${novoUsuario.login}`);
    console.log(`Tipo: ${novoUsuario.role}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

criarUsuario();

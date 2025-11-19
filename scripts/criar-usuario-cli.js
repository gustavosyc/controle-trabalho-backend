"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function criarUsuario() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('\n❌ Uso incorreto!');
        console.log('\n📖 Como usar:');
        console.log('  npm run criar-usuario <nome> <login> <senha> [cargo] [tipo]\n');
        console.log('Exemplos:');
        console.log('  npm run criar-usuario "Maria Silva" maria.silva senha123');
        console.log('  npm run criar-usuario "João Santos" joao.santos senha456 Desenvolvedor');
        console.log('  npm run criar-usuario "Admin Novo" admin2 senha789 "Gerente" admin\n');
        process.exit(1);
    }
    const [nome, login, senha, cargo = '', roleInput = 'usuario'] = args;
    const role = roleInput === 'admin' ? 'admin' : 'usuario';
    try {
        console.log('\n🎯 === CADASTRO DE NOVO USUÁRIO ===\n');
        // Validações
        if (!nome.trim()) {
            console.log('❌ Nome é obrigatório!');
            process.exit(1);
        }
        if (!login.trim()) {
            console.log('❌ Login é obrigatório!');
            process.exit(1);
        }
        if (!senha.trim() || senha.length < 6) {
            console.log('❌ Senha deve ter no mínimo 6 caracteres!');
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
        // Mostrar dados
        console.log('📋 Dados do usuário:');
        console.log(`   Nome: ${nome}`);
        console.log(`   Login: ${login}`);
        console.log(`   Cargo: ${cargo || '(não informado)'}`);
        console.log(`   Tipo: ${role === 'admin' ? '👑 Administrador' : '👤 Usuário'}`);
        console.log('');
        // Hash da senha
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
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
        console.log('✅ Usuário criado com sucesso!');
        console.log(`   ID: ${novoUsuario.id}`);
        console.log(`   Nome: ${novoUsuario.nome}`);
        console.log(`   Login: ${novoUsuario.login}`);
        console.log(`   Tipo: ${novoUsuario.role}`);
        console.log('');
    }
    catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
criarUsuario();

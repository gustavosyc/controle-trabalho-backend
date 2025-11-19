"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const readline = __importStar(require("readline"));
const prisma = new client_1.PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function pergunta(texto) {
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
        console.log('\n✅ Usuário criado com sucesso!');
        console.log(`ID: ${novoUsuario.id}`);
        console.log(`Nome: ${novoUsuario.nome}`);
        console.log(`Login: ${novoUsuario.login}`);
        console.log(`Tipo: ${novoUsuario.role}`);
        console.log('');
    }
    catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        rl.close();
    }
}
criarUsuario();

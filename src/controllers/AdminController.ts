import { Request, Response } from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';

export const AdminController = {
  async relatorioUsuarios(req: Request, res: Response) {
    try {
      const role = (req as any).usuario.role;
      if (role !== 'admin') return res.status(403).json({ erro: 'Acesso restrito ao administrador' });

      const usuarios = await prisma.usuario.findMany({
        include: { jornadas: true, producoes: true, ferias: true, folhas: true }
      });
      res.json(usuarios);
    } catch {
      res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
  },

  async criarUsuario(req: Request, res: Response) {
    try {
      const role = (req as any).usuario.role;
      if (role !== 'admin') return res.status(403).json({ erro: 'Acesso restrito ao administrador' });

      const { login, senha, nome, cargo, role: userRole } = req.body;

      // Validações
      if (!login || !senha || !nome) {
        return res.status(400).json({ erro: 'Login, senha e nome são obrigatórios' });
      }

      // Verificar se o login já existe
      const usuarioExistente = await prisma.usuario.findUnique({ where: { login } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Login já está em uso' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário
      const novoUsuario = await prisma.usuario.create({
        data: {
          login,
          senha: senhaHash,
          nome,
          cargo: cargo || null,
          role: userRole || 'usuario'
        }
      });

      // Remover senha do retorno
      const { senha: _, ...usuarioSemSenha } = novoUsuario;

      res.status(201).json({ 
        mensagem: 'Usuário criado com sucesso',
        usuario: usuarioSemSenha 
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
  }
};

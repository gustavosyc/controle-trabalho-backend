import { Request, Response } from 'express';
import { prisma } from '../app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const AuthController = {
  async registrar(req: Request, res: Response) {
    const { nome, login, senha, cargo } = req.body;
    try {
      const existente = await prisma.usuario.findUnique({ where: { login } });
      if (existente) return res.status(400).json({ erro: 'Login já existe' });

      const senhaHash = await bcrypt.hash(senha, 10);
      const novo = await prisma.usuario.create({
        data: { nome, login, senha: senhaHash, cargo },
      });
      return res.status(201).json({ id: novo.id, nome: novo.nome, login: novo.login });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao registrar' });
    }
  },

  async login(req: Request, res: Response) {
    const { login, senha } = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({ where: { login } });
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

      const valido = await bcrypt.compare(senha, usuario.senha);
      if (!valido) return res.status(401).json({ erro: 'Senha incorreta' });

      const token = jwt.sign({ id: usuario.id, role: usuario.role }, process.env.JWT_SECRET as string, { expiresIn: '8h' });
      return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role } });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao autenticar' });
    }
  }
};

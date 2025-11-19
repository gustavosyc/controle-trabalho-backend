import { Request, Response } from 'express';
import { prisma } from '../app';

export const FolhaController = {
  async solicitar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const { mes, ano } = req.body;
      const folha = await prisma.folha.create({ data: { mes, ano: Number(ano), usuarioId } });
      res.status(201).json(folha);
    } catch {
      res.status(500).json({ erro: 'Erro ao solicitar folha' });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const folhas = await prisma.folha.findMany({ where: { usuarioId }, orderBy: { id: 'desc' } });
      res.json(folhas);
    } catch {
      res.status(500).json({ erro: 'Erro ao listar folhas' });
    }
  }
};

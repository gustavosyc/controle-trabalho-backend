import { Request, Response } from 'express';
import { prisma } from '../app';

export const FeriasController = {
  async solicitar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const { inicio, fim } = req.body;
      const ferias = await prisma.ferias.create({ data: { inicio: new Date(inicio), fim: new Date(fim), usuarioId } });
      res.status(201).json(ferias);
    } catch {
      res.status(500).json({ erro: 'Erro ao registrar férias' });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const ferias = await prisma.ferias.findMany({ where: { usuarioId }, orderBy: { inicio: 'desc' } });
      res.json(ferias);
    } catch {
      res.status(500).json({ erro: 'Erro ao listar férias' });
    }
  }
};

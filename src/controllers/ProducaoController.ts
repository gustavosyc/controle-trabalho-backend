import { Request, Response } from 'express';
import { prisma } from '../app';

export const ProducaoController = {
  async registrar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const { data, tipo, quantidade, observacao } = req.body;
      const producao = await prisma.producao.create({ data: { data: new Date(data), tipo, quantidade: Number(quantidade), observacao, usuarioId } });
      res.status(201).json(producao);
    } catch {
      res.status(500).json({ erro: 'Erro ao registrar produção' });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const producoes = await prisma.producao.findMany({ where: { usuarioId }, orderBy: { data: 'desc' } });
      res.json(producoes);
    } catch {
      res.status(500).json({ erro: 'Erro ao listar produções' });
    }
  }
};

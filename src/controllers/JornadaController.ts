import { Request, Response } from 'express';
import { prisma } from '../app';

export const JornadaController = {
  async registrar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const { data, entrada, saida } = req.body;
      const horasTotais = (new Date(saida).getTime() - new Date(entrada).getTime()) / 3600000;
      const jornada = await prisma.jornada.create({ data: { data: new Date(data), entrada: new Date(entrada), saida: new Date(saida), horasTotais, usuarioId } });
      res.status(201).json(jornada);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao registrar jornada' });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario.id;
      const jornadas = await prisma.jornada.findMany({ where: { usuarioId }, orderBy: { data: 'desc' } });
      res.json(jornadas);
    } catch {
      res.status(500).json({ erro: 'Erro ao listar jornadas' });
    }
  }
};

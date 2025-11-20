import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AprovacoesController {
  // Listar jornadas pendentes
  async listarPendentes(req: Request, res: Response) {
    try {
      const jornadas = await prisma.jornada.findMany({
        where: {
          status: 'pendente',
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
        },
        orderBy: {
          data: 'desc',
        },
      });

      res.json(jornadas);
    } catch (error) {
      console.error('Erro ao listar jornadas pendentes:', error);
      res.status(500).json({ error: 'Erro ao listar jornadas pendentes' });
    }
  }

  // Aprovar jornada
  async aprovar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aprovadoPor, observacao } = req.body;

      if (!aprovadoPor) {
        return res.status(400).json({ error: 'ID do aprovador é obrigatório' });
      }

      const jornada = await prisma.jornada.update({
        where: { id: parseInt(id) },
        data: {
          status: 'aprovado',
          aprovadoPor: parseInt(aprovadoPor),
          dataAprovacao: new Date(),
          observacao: observacao || null,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
          aprovador: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      res.json(jornada);
    } catch (error) {
      console.error('Erro ao aprovar jornada:', error);
      res.status(500).json({ error: 'Erro ao aprovar jornada' });
    }
  }

  // Rejeitar jornada
  async rejeitar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { aprovadoPor, observacao } = req.body;

      if (!aprovadoPor) {
        return res.status(400).json({ error: 'ID do aprovador é obrigatório' });
      }

      if (!observacao) {
        return res.status(400).json({ error: 'Observação é obrigatória para rejeição' });
      }

      const jornada = await prisma.jornada.update({
        where: { id: parseInt(id) },
        data: {
          status: 'rejeitado',
          aprovadoPor: parseInt(aprovadoPor),
          dataAprovacao: new Date(),
          observacao,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
          aprovador: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      res.json(jornada);
    } catch (error) {
      console.error('Erro ao rejeitar jornada:', error);
      res.status(500).json({ error: 'Erro ao rejeitar jornada' });
    }
  }

  // Histórico de aprovações
  async historico(req: Request, res: Response) {
    try {
      const { usuarioId } = req.query;

      const whereClause: any = {
        status: {
          in: ['aprovado', 'rejeitado'],
        },
      };

      if (usuarioId) {
        whereClause.usuarioId = parseInt(usuarioId as string);
      }

      const jornadas = await prisma.jornada.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
          aprovador: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: {
          dataAprovacao: 'desc',
        },
        take: 50, // Últimas 50
      });

      res.json(jornadas);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }
}

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MetasController {
  // Listar metas
  async listar(req: Request, res: Response) {
    try {
      const { usuarioId, mes } = req.query;

      const whereClause: any = {};
      
      if (usuarioId) {
        whereClause.usuarioId = parseInt(usuarioId as string);
      }
      
      if (mes) {
        whereClause.mes = mes as string;
      }

      const metas = await prisma.meta.findMany({
        where: whereClause,
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
          createdAt: 'desc',
        },
      });

      res.json(metas);
    } catch (error) {
      console.error('Erro ao listar metas:', error);
      res.status(500).json({ error: 'Erro ao listar metas' });
    }
  }

  // Criar meta
  async criar(req: Request, res: Response) {
    try {
      const { usuarioId, tipo, descricao, valor, mes } = req.body;

      if (!usuarioId || !tipo || !descricao || !valor || !mes) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const meta = await prisma.meta.create({
        data: {
          usuarioId: parseInt(usuarioId),
          tipo,
          descricao,
          valor: parseFloat(valor),
          mes,
          valorAtual: 0,
          status: 'ativa',
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
      });

      res.status(201).json(meta);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      res.status(500).json({ error: 'Erro ao criar meta' });
    }
  }

  // Atualizar meta
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { descricao, valor, valorAtual, status } = req.body;

      const updateData: any = {};
      
      if (descricao !== undefined) updateData.descricao = descricao;
      if (valor !== undefined) updateData.valor = parseFloat(valor);
      if (valorAtual !== undefined) updateData.valorAtual = parseFloat(valorAtual);
      if (status !== undefined) updateData.status = status;

      const meta = await prisma.meta.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
        },
      });

      res.json(meta);
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ error: 'Erro ao atualizar meta' });
    }
  }

  // Deletar meta
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.meta.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: 'Meta deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      res.status(500).json({ error: 'Erro ao deletar meta' });
    }
  }

  // Atualizar progresso da meta automaticamente
  async atualizarProgresso(req: Request, res: Response) {
    try {
      const { usuarioId, mes } = req.body;

      // Buscar metas ativas do usuário no mês
      const metas = await prisma.meta.findMany({
        where: {
          usuarioId: parseInt(usuarioId),
          mes,
          status: 'ativa',
        },
      });

      for (const meta of metas) {
        let valorAtual = 0;

        // Calcular progresso baseado no tipo
        if (meta.tipo === 'horas') {
          const jornadas = await prisma.jornada.findMany({
            where: {
              usuarioId: parseInt(usuarioId),
              data: {
                gte: new Date(`${mes}-01`),
                lte: new Date(`${mes}-31`),
              },
              status: 'aprovado',
            },
          });
          valorAtual = jornadas.reduce((sum, j) => sum + j.horasTotais, 0);
        } else if (meta.tipo === 'producao') {
          const producoes = await prisma.producao.findMany({
            where: {
              usuarioId: parseInt(usuarioId),
              data: {
                gte: new Date(`${mes}-01`),
                lte: new Date(`${mes}-31`),
              },
            },
          });
          valorAtual = producoes.reduce((sum, p) => sum + p.quantidade, 0);
        }

        // Atualizar meta
        await prisma.meta.update({
          where: { id: meta.id },
          data: {
            valorAtual,
            status: valorAtual >= meta.valor ? 'concluida' : 'ativa',
          },
        });
      }

      res.json({ message: 'Progresso atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      res.status(500).json({ error: 'Erro ao atualizar progresso' });
    }
  }
}

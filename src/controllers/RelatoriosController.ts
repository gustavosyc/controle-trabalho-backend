import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export class RelatoriosController {
  // Relatório de Horas Trabalhadas
  async relatorioHoras(req: Request, res: Response) {
    try {
      const { usuarioId, dataInicio, dataFim } = req.query;

      const whereClause: any = {
        data: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string),
        },
        status: 'aprovado', // Apenas jornadas aprovadas
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
        },
      });

      // Agrupar por usuário
      const usuariosMap = new Map();

      jornadas.forEach((jornada) => {
        const userId = jornada.usuario.id;
        if (!usuariosMap.has(userId)) {
          usuariosMap.set(userId, {
            id: userId,
            nome: jornada.usuario.nome,
            cargo: jornada.usuario.cargo,
            totalHoras: 0,
            diasTrabalhados: 0,
            jornadas: [],
          });
        }

        const userData = usuariosMap.get(userId);
        userData.totalHoras += jornada.horasTotais;
        userData.diasTrabalhados += 1;
        userData.jornadas.push({
          data: jornada.data,
          entrada: jornada.entrada,
          saida: jornada.saida,
          horas: jornada.horasTotais,
        });
      });

      const usuarios = Array.from(usuariosMap.values()).map((user) => ({
        ...user,
        mediaHorasDia: user.diasTrabalhados > 0 ? user.totalHoras / user.diasTrabalhados : 0,
      }));

      const totalHoras = usuarios.reduce((sum, user) => sum + user.totalHoras, 0);

      res.json({
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
        },
        totalHoras,
        usuarios,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de horas:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de horas' });
    }
  }

  // Relatório de Produção
  async relatorioProducao(req: Request, res: Response) {
    try {
      const { usuarioId, dataInicio, dataFim } = req.query;

      const whereClause: any = {
        data: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string),
        },
      };

      if (usuarioId) {
        whereClause.usuarioId = parseInt(usuarioId as string);
      }

      const producoes = await prisma.producao.findMany({
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
      });

      // Agrupar por usuário
      const usuariosMap = new Map();

      producoes.forEach((producao) => {
        const userId = producao.usuario.id;
        if (!usuariosMap.has(userId)) {
          usuariosMap.set(userId, {
            id: userId,
            nome: producao.usuario.nome,
            cargo: producao.usuario.cargo,
            totalProducao: 0,
            producoes: [],
          });
        }

        const userData = usuariosMap.get(userId);
        userData.totalProducao += producao.quantidade;
        userData.producoes.push({
          data: producao.data,
          tipo: producao.tipo,
          quantidade: producao.quantidade,
          observacao: producao.observacao,
        });
      });

      const usuarios = Array.from(usuariosMap.values());
      const totalProducao = usuarios.reduce((sum, user) => sum + user.totalProducao, 0);

      res.json({
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
        },
        totalProducao,
        usuarios,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de produção:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de produção' });
    }
  }

  // Relatório Consolidado
  async relatorioConsolidado(req: Request, res: Response) {
    try {
      const { usuarioId, dataInicio, dataFim } = req.query;

      const whereClause: any = {};
      if (usuarioId) {
        whereClause.id = parseInt(usuarioId as string);
      }

      const usuarios = await prisma.usuario.findMany({
        where: whereClause,
        include: {
          jornadas: {
            where: {
              data: {
                gte: new Date(dataInicio as string),
                lte: new Date(dataFim as string),
              },
              status: 'aprovado',
            },
          },
          producoes: {
            where: {
              data: {
                gte: new Date(dataInicio as string),
                lte: new Date(dataFim as string),
              },
            },
          },
          ferias: {
            where: {
              inicio: {
                gte: new Date(dataInicio as string),
                lte: new Date(dataFim as string),
              },
            },
          },
        },
      });

      const relatorio = usuarios.map((usuario) => {
        const totalHoras = usuario.jornadas.reduce((sum, j) => sum + j.horasTotais, 0);
        const totalProducao = usuario.producoes.reduce((sum, p) => sum + p.quantidade, 0);
        const diasFerias = usuario.ferias.reduce((sum, f) => {
          const dias = Math.ceil((f.fim.getTime() - f.inicio.getTime()) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0);

        return {
          id: usuario.id,
          nome: usuario.nome,
          cargo: usuario.cargo,
          horas: totalHoras,
          diasTrabalhados: usuario.jornadas.length,
          producao: totalProducao,
          ferias: diasFerias,
        };
      });

      res.json({
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
        },
        usuarios: relatorio,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório consolidado:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório consolidado' });
    }
  }

  // Estatísticas do Dashboard
  async estatisticas(req: Request, res: Response) {
    try {
      const { usuarioId } = req.query;
      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);

      const whereClause: any = {};
      if (usuarioId) {
        whereClause.usuarioId = parseInt(usuarioId as string);
      }

      // Horas do mês
      const jornadas = await prisma.jornada.findMany({
        where: {
          ...whereClause,
          data: {
            gte: inicioMes,
            lte: fimMes,
          },
          status: 'aprovado',
        },
      });

      const horasMes = jornadas.reduce((sum, j) => sum + j.horasTotais, 0);

      // Produção do mês
      const producoes = await prisma.producao.findMany({
        where: {
          ...whereClause,
          data: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      });

      const producaoMes = producoes.reduce((sum, p) => sum + p.quantidade, 0);

      // Férias disponíveis
      const usuario = usuarioId
        ? await prisma.usuario.findUnique({
            where: { id: parseInt(usuarioId as string) },
            include: { ferias: true },
          })
        : null;

      const diasFeriasUsados = usuario
        ? usuario.ferias.reduce((sum, f) => {
            const dias = Math.ceil((f.fim.getTime() - f.inicio.getTime()) / (1000 * 60 * 60 * 24));
            return sum + dias;
          }, 0)
        : 0;

      const diasFeriasDisponiveis = 30 - diasFeriasUsados;

      res.json({
        horasMes: Math.round(horasMes),
        producaoMes,
        diasFeriasDisponiveis,
        mesAtual: format(hoje, 'MMMM yyyy'),
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

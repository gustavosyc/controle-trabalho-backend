import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BancoHorasController {
  // Ver saldo
  async verSaldo(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const { mes } = req.query;

      const whereClause: any = {
        usuarioId: parseInt(usuarioId),
      };

      if (mes) {
        whereClause.mes = mes as string;
      }

      const registros = await prisma.bancoHoras.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const saldoTotal = registros.reduce((sum, r) => sum + r.saldo, 0);

      res.json({
        saldoTotal,
        registros,
      });
    } catch (error) {
      console.error('Erro ao ver saldo:', error);
      res.status(500).json({ error: 'Erro ao ver saldo' });
    }
  }

  // Compensar horas
  async compensar(req: Request, res: Response) {
    try {
      const { usuarioId, horas, mes, descricao, tipo } = req.body;

      if (!usuarioId || !horas || !mes || !tipo) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const horasNum = parseFloat(horas);
      
      const registro = await prisma.bancoHoras.create({
        data: {
          usuarioId: parseInt(usuarioId),
          saldo: tipo === 'entrada' ? horasNum : -horasNum,
          mes,
          entrada: tipo === 'entrada' ? horasNum : 0,
          saida: tipo === 'saida' ? horasNum : 0,
          descricao: descricao || null,
        },
      });

      res.status(201).json(registro);
    } catch (error) {
      console.error('Erro ao compensar horas:', error);
      res.status(500).json({ error: 'Erro ao compensar horas' });
    }
  }

  // Histórico
  async historico(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;

      const registros = await prisma.bancoHoras.findMany({
        where: {
          usuarioId: parseInt(usuarioId),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(registros);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }

  // Calcular banco de horas automaticamente
  async calcularAutomatico(req: Request, res: Response) {
    try {
      const { usuarioId, mes } = req.body;

      // Buscar jornadas aprovadas do mês
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

      // Calcular total de horas trabalhadas
      const horasTrabalhadas = jornadas.reduce((sum, j) => sum + j.horasTotais, 0);
      
      // Calcular horas esperadas (8h por dia útil)
      const diasUteis = jornadas.length;
      const horasEsperadas = diasUteis * 8;
      
      // Calcular saldo
      const saldo = horasTrabalhadas - horasEsperadas;

      // Verificar se já existe registro para o mês
      const registroExistente = await prisma.bancoHoras.findFirst({
        where: {
          usuarioId: parseInt(usuarioId),
          mes,
        },
      });

      if (registroExistente) {
        // Atualizar registro existente
        await prisma.bancoHoras.update({
          where: { id: registroExistente.id },
          data: {
            saldo,
            entrada: saldo > 0 ? saldo : 0,
            saida: saldo < 0 ? Math.abs(saldo) : 0,
            descricao: 'Cálculo automático',
          },
        });
      } else {
        // Criar novo registro
        await prisma.bancoHoras.create({
          data: {
            usuarioId: parseInt(usuarioId),
            saldo,
            mes,
            entrada: saldo > 0 ? saldo : 0,
            saida: saldo < 0 ? Math.abs(saldo) : 0,
            descricao: 'Cálculo automático',
          },
        });
      }

      res.json({
        horasTrabalhadas,
        horasEsperadas,
        saldo,
        message: 'Banco de horas calculado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao calcular banco de horas:', error);
      res.status(500).json({ error: 'Erro ao calcular banco de horas' });
    }
  }
}

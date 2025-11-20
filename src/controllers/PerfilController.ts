import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PerfilController {
  // Ver perfil completo
  async verPerfil(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) },
        include: {
          jornadas: {
            orderBy: { data: 'desc' },
            take: 10,
          },
          producoes: {
            orderBy: { data: 'desc' },
            take: 10,
          },
          ferias: {
            orderBy: { inicio: 'desc' },
          },
          metas: {
            orderBy: { createdAt: 'desc' },
          },
          bancoHoras: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Remover senha do retorno
      const { senha, ...usuarioSemSenha } = usuario;

      res.json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro ao ver perfil:', error);
      res.status(500).json({ error: 'Erro ao ver perfil' });
    }
  }

  // Atualizar perfil
  async atualizarPerfil(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nome,
        cargo,
        cpf,
        rg,
        dataNascimento,
        telefone,
        endereco,
        departamento,
        dataAdmissao,
        salario,
      } = req.body;

      const updateData: any = {};

      if (nome) updateData.nome = nome;
      if (cargo) updateData.cargo = cargo;
      if (cpf) updateData.cpf = cpf;
      if (rg) updateData.rg = rg;
      if (dataNascimento) updateData.dataNascimento = new Date(dataNascimento);
      if (telefone) updateData.telefone = telefone;
      if (endereco) updateData.endereco = endereco;
      if (departamento) updateData.departamento = departamento;
      if (dataAdmissao) updateData.dataAdmissao = new Date(dataAdmissao);
      if (salario) updateData.salario = parseFloat(salario);

      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      // Remover senha do retorno
      const { senha, ...usuarioSemSenha } = usuario;

      res.json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  // Estatísticas do perfil
  async estatisticas(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Total de horas trabalhadas
      const jornadas = await prisma.jornada.findMany({
        where: {
          usuarioId: parseInt(id),
          status: 'aprovado',
        },
      });
      const totalHoras = jornadas.reduce((sum, j) => sum + j.horasTotais, 0);

      // Total de produção
      const producoes = await prisma.producao.findMany({
        where: { usuarioId: parseInt(id) },
      });
      const totalProducao = producoes.reduce((sum, p) => sum + p.quantidade, 0);

      // Dias de férias usados
      const ferias = await prisma.ferias.findMany({
        where: { usuarioId: parseInt(id) },
      });
      const diasFerias = ferias.reduce((sum, f) => {
        const dias = Math.ceil((f.fim.getTime() - f.inicio.getTime()) / (1000 * 60 * 60 * 24));
        return sum + dias;
      }, 0);

      // Banco de horas
      const bancoHoras = await prisma.bancoHoras.findMany({
        where: { usuarioId: parseInt(id) },
      });
      const saldoBancoHoras = bancoHoras.reduce((sum, b) => sum + b.saldo, 0);

      // Metas ativas
      const metasAtivas = await prisma.meta.count({
        where: {
          usuarioId: parseInt(id),
          status: 'ativa',
        },
      });

      res.json({
        totalHoras: Math.round(totalHoras),
        totalProducao,
        diasFerias,
        saldoBancoHoras: Math.round(saldoBancoHoras * 10) / 10,
        metasAtivas,
        diasTrabalhados: jornadas.length,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

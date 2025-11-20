import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function popularDados() {
  console.log('🎯 Populando dados de teste...\n');

  try {
    // Buscar usuários existentes
    const usuarios = await prisma.usuario.findMany();
    
    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie usuários primeiro!');
      return;
    }

    console.log(`✅ Encontrados ${usuarios.length} usuários\n`);

    // Criar jornadas de teste (últimos 30 dias)
    const hoje = new Date();
    const diasPassados = 30;

    for (const usuario of usuarios) {
      console.log(`📊 Criando dados para: ${usuario.nome}`);
      
      for (let i = 0; i < diasPassados; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        
        // Pular finais de semana
        if (data.getDay() === 0 || data.getDay() === 6) continue;

        // Criar jornada
        const entrada = new Date(data);
        entrada.setHours(8, 0, 0, 0);
        
        const saida = new Date(data);
        saida.setHours(17, 0, 0, 0);
        
        const horasTotais = 8 + (Math.random() * 2 - 1); // 7-9 horas

        await prisma.jornada.create({
          data: {
            usuarioId: usuario.id,
            data,
            entrada,
            saida,
            horasTotais,
            status: 'aprovado',
          },
        });

        // Criar produção
        const quantidade = Math.floor(Math.random() * 20) + 5; // 5-25
        
        await prisma.producao.create({
          data: {
            usuarioId: usuario.id,
            data,
            tipo: 'Tarefas',
            quantidade,
            observacao: 'Produção do dia',
          },
        });
      }
      
      console.log(`  ✅ ${diasPassados} jornadas criadas`);
      console.log(`  ✅ ${diasPassados} produções criadas\n`);
    }

    console.log('🎉 Dados de teste criados com sucesso!');
    console.log('\n📊 Agora você pode acessar a página de Relatórios e ver os dados!');

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

popularDados();

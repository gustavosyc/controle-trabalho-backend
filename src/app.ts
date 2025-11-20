import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import jornadaRoutes from './routes/jornada';
import producaoRoutes from './routes/producao';
import feriasRoutes from './routes/ferias';
import folhaRoutes from './routes/folha';
import adminRoutes from './routes/admin';
import relatoriosRoutes from './routes/relatorios';

dotenv.config();
export const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API Controle de Trabalho está rodando 🚀'));

app.use('/auth', authRoutes);
app.use('/jornada', jornadaRoutes);
app.use('/producao', producaoRoutes);
app.use('/ferias', feriasRoutes);
app.use('/folha', folhaRoutes);
app.use('/admin', adminRoutes);
app.use('/relatorios', relatoriosRoutes);

export default app;

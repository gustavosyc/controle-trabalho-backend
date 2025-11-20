import { Router } from 'express';
import { RelatoriosController } from '../controllers/RelatoriosController';

const router = Router();
const relatoriosController = new RelatoriosController();

// Rotas de relatórios
router.get('/horas', (req, res) => relatoriosController.relatorioHoras(req, res));
router.get('/producao', (req, res) => relatoriosController.relatorioProducao(req, res));
router.get('/consolidado', (req, res) => relatoriosController.relatorioConsolidado(req, res));
router.get('/estatisticas', (req, res) => relatoriosController.estatisticas(req, res));

export default router;

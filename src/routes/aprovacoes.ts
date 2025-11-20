import { Router } from 'express';
import { AprovacoesController } from '../controllers/AprovacoesController';

const router = Router();
const aprovacoesController = new AprovacoesController();

router.get('/pendentes', (req, res) => aprovacoesController.listarPendentes(req, res));
router.put('/:id/aprovar', (req, res) => aprovacoesController.aprovar(req, res));
router.put('/:id/rejeitar', (req, res) => aprovacoesController.rejeitar(req, res));
router.get('/historico', (req, res) => aprovacoesController.historico(req, res));

export default router;

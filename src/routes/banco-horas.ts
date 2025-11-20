import { Router } from 'express';
import { BancoHorasController } from '../controllers/BancoHorasController';

const router = Router();
const bancoHorasController = new BancoHorasController();

router.get('/:usuarioId/saldo', (req, res) => bancoHorasController.verSaldo(req, res));
router.post('/compensar', (req, res) => bancoHorasController.compensar(req, res));
router.get('/:usuarioId/historico', (req, res) => bancoHorasController.historico(req, res));
router.post('/calcular-automatico', (req, res) => bancoHorasController.calcularAutomatico(req, res));

export default router;

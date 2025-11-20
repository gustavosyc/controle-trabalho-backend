import { Router } from 'express';
import { PerfilController } from '../controllers/PerfilController';

const router = Router();
const perfilController = new PerfilController();

router.get('/:id', (req, res) => perfilController.verPerfil(req, res));
router.put('/:id', (req, res) => perfilController.atualizarPerfil(req, res));
router.get('/:id/estatisticas', (req, res) => perfilController.estatisticas(req, res));

export default router;

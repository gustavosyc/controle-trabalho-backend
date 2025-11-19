import { Router } from 'express';
import { FeriasController } from '../controllers/FeriasController';
import { autenticarJWT } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', autenticarJWT, FeriasController.solicitar);
router.get('/', autenticarJWT, FeriasController.listar);

export default router;

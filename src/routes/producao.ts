import { Router } from 'express';
import { ProducaoController } from '../controllers/ProducaoController';
import { autenticarJWT } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', autenticarJWT, ProducaoController.registrar);
router.get('/', autenticarJWT, ProducaoController.listar);

export default router;

import { Router } from 'express';
import { FolhaController } from '../controllers/FolhaController';
import { autenticarJWT } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', autenticarJWT, FolhaController.solicitar);
router.get('/', autenticarJWT, FolhaController.listar);

export default router;

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { autenticarJWT } from '../middlewares/authMiddleware';

const router = Router();
router.get('/usuarios', autenticarJWT, AdminController.relatorioUsuarios);
router.post('/usuarios', autenticarJWT, AdminController.criarUsuario);

export default router;

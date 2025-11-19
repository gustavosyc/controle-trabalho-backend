import { Router } from 'express';
import { JornadaController } from '../controllers/JornadaController';
import { autenticarJWT } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', autenticarJWT, JornadaController.registrar);
router.get('/', autenticarJWT, JornadaController.listar);

export default router;

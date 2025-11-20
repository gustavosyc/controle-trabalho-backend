import { Router } from 'express';
import { MetasController } from '../controllers/MetasController';

const router = Router();
const metasController = new MetasController();

router.get('/', (req, res) => metasController.listar(req, res));
router.post('/', (req, res) => metasController.criar(req, res));
router.put('/:id', (req, res) => metasController.atualizar(req, res));
router.delete('/:id', (req, res) => metasController.deletar(req, res));
router.post('/atualizar-progresso', (req, res) => metasController.atualizarProgresso(req, res));

export default router;

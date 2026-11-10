import { Router } from 'express';
import { createVenda, listVendas, getVendaById } from '../controllers/vendaController';

const router = Router();

router.post('/', createVenda);
router.get('/', listVendas);
router.get('/:id', getVendaById);

export default router;


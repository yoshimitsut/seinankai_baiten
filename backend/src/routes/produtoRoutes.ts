import { Router } from 'express';
import {
  listProdutos,
  getProdutoByCodigo,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
} from '../controllers/produtoController';

const router = Router();

router.get('/', listProdutos);
router.get('/codigo/:codigo', getProdutoByCodigo);
router.get('/:id', getProdutoById);
router.post('/', createProduto);
router.put('/:id', updateProduto);
router.delete('/:id', deleteProduto);

export default router;


import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct} from "../controllers/productController.js"
import { requireRole } from '../middleware/auth-middleware.js';
//import { validateProduct } from '../validators/productValidator.js';

const router = express.Router();

router.post('/', requireRole, createProduct);
router.get('/', getProducts);

router.get('/:id', getProductById);
router.put('/:id', requireRole, updateProduct);
router.delete('/:id', requireRole, deleteProduct);

export default router;
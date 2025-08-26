// routes/cartRoutes.js
import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  updateCartItem,
  clearCart,
  bulkAddToCart
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authUser.js';


const router = express.Router();

// Protected routes (require authentication)
router.post('/:id', protect, addToCart);
router.delete('/:id', protect, removeFromCart);
router.get('/:id', protect, getCart);
router.put('/:id', protect, updateCartItem);
router.delete('/:id/clear', protect, clearCart);
router.post('/:id/bulk', protect, bulkAddToCart);

export default router;
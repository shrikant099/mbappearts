import express from 'express';
import { addProductToWishlist, clearWishlist, getWishlistItems, removeProductFromWishlist } from '../controllers/wishListController.js';
import { protect } from '../middlewares/authUser';

const router = express.Router();


router.post('/wishlist', protect, addProductToWishlist);
router.delete('/wishlist/:productId', protect, removeProductFromWishlist);
router.get('/wishlist', protect, getWishlistItems)
router.delete('/wishlist', protect, clearWishlist);

export default router;
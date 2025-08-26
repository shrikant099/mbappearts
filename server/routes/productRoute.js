
// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  addProductReview,
  getProductStats,
  searchProducts
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/authUser.js';
// Assuming you have auth middleware

const router = express.Router();

// Public routes
router.get('/',  getAllProducts);
router.get('/search', searchProducts);
router.get('/featured',  getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale',  getProductsOnSale);
router.get('/stats',  getProductStats);
router.get('/:id',  getProductById);

// Protected routes (require authentication)
router.post('/:id/reviews', protect, addProductReview);

// Admin routes (require admin privileges)
router.post('/add', protect, restrictTo('admin'), createProduct);            // POST /api/products/add
router.put('/update/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;





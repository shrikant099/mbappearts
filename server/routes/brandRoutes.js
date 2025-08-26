// routes/brandRoutes.js
import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  getFeaturedBrands,
  getBrandsWithProducts,
  makeBrandDeactivated,
  makeBrandActivated
} from '../controllers/brandController.js';

import { protect, restrictTo } from '../middlewares/authUser.js';



const router = express.Router();

// Public routes
router.get('/', protect, getAllBrands);
router.get('/featured', protect, getFeaturedBrands);
router.get('/with-products', protect, getBrandsWithProducts);
router.get('/:id', protect, getBrandById);

// Admin routes
router.post('/', protect, restrictTo('admin'), createBrand);
router.put('/:id', protect, restrictTo('admin'), updateBrand);
router.delete('/:id', protect, restrictTo('admin'), deleteBrand);

// router.put('/deactivate/:brandId', protect, restrictTo('admin'), makeBrandDeactivated);
// router.put('/activate/:brandId', protect, restrictTo('admin'), makeBrandActivated);

export default router;
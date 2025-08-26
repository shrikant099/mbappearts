import express from 'express';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';
import { protect } from '../middlewares/authUser.js';


const router = express.Router();

router.post('/', protect, createAddress);
router.get('/user/:userId', protect, getUserAddresses);
router.put('/:id', protect, updateAddress);//addressId
router.delete('/:id', protect, deleteAddress);//addressId
router.patch('/:id/set-default/:userId', protect, setDefaultAddress);

export default router;
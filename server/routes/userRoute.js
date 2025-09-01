import express from 'express';
import { activateSingleUser, deactivateSingleUser, forgotPassword, getAdminDashboardStats, getMe, getProfile, getUserNoPagination, getUsers, isAuth, login, logout, register, resetPassword, sendOTPToPhone, updatePicture, updateProfile } from '../controllers/userController.js';
import { addProductToWishlist, clearWishlist, getWishlistItems, removeProductFromWishlist } from '../controllers/wishListController.js';
import { protect, restrictTo } from '../middlewares/authUser.js';
import { sendEmail } from '../controllers/contact.js';
import { sendContactEmail } from '../utils/sendEmail.js';


const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.put('/update/:id', protect, updateProfile)
userRouter.patch('/updatePicture/:id', protect, updatePicture)
userRouter.get('/is-auth', protect, isAuth)
userRouter.get('/logout', protect, logout)
userRouter.get('/profile/:id', protect, getProfile)
userRouter.post('/forgot-password', forgotPassword)
userRouter.get('/admin-dashboard', protect, getAdminDashboardStats)
userRouter.get('/getuser', protect, getUsers)
userRouter.get('/getUserNoPagination', protect, getUserNoPagination)
userRouter.get('/me', protect, getMe);
userRouter.put('/deactivate/:userId', protect, restrictTo('admin'), deactivateSingleUser);
userRouter.put('/activate/:userId', protect, restrictTo('admin'), activateSingleUser);

//mail sender route

userRouter.post('/reset-password', resetPassword);


//wishlist routes
userRouter.post('/wishlist', protect, addProductToWishlist);
userRouter.delete('/wishlist/:productId', protect, removeProductFromWishlist);
userRouter.get('/wishlist', protect, getWishlistItems);
userRouter.delete('/wishlist', protect, clearWishlist);

//contact


userRouter.post('/send-email', async (req, res) => {
  try {
   
    await sendContactEmail(req.body);   // ✅ Use only the body here
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending contact email:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});



export default userRouter
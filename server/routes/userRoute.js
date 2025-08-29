import express from 'express';
import { activateSingleUser, deactivateSingleUser, forgotPassword, getAdminDashboardStats, getMe, getProfile, getUserNoPagination, getUsers, isAuth, login, logout, register, resetPassword, sendOTPToPhone, updatePicture, updateProfile } from '../controllers/userController.js';

import { protect, restrictTo } from '../middlewares/authUser.js';
import { sendEmail } from '../controllers/contact.js';


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
// userRouter.put('/deactivate/:userId', protect, restrictTo('admin'), deactivateSingleUser);
// userRouter.put('/activate/:userId', protect, restrictTo('admin'), activateSingleUser);

//mail sender route

userRouter.post('/send-email', sendEmail);
userRouter.post('/reset-password', resetPassword);


export default userRouter
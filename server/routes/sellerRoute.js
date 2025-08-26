import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js';


const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth',  isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

export default sellerRouter;
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import User from './models/User.js';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import categoryRouter from "./routes/CategoryRoute.js"
import fileUpload from "express-fileupload";
import brandRouter from './routes/brandRoutes.js';
import paymentRouter from './routes/paymentRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import chatbotRoute from './routes/chatbotRoute.js';
const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173','https://ukf-e-commerce.vercel.app']

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
	})
);

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));


app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/category', categoryRouter)
app.use('/api/brand', brandRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/review', reviewRouter);
app.use('/api/chat', chatbotRoute);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})
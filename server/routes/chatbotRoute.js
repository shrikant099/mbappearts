// routes/chatbotRoute.js
import express from 'express';
import { handleChat } from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chat
router.post('/chat', handleChat);

export default router;


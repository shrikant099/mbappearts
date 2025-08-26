// controllers/chatbotController.js
import axios from 'axios';
import Product from '../models/Product.js'; // Adjust path as per your project
import dotenv from 'dotenv';
dotenv.config();

export const handleChat = async (req, res) => {
  const { message } = req.body;

  try {
    // Fetch top 5 products as context
    const topProducts = await Product.find().limit(5);
    const productInfo = topProducts.map(p => `${p.title} - ₹${p.price}`).join(', ');

    const systemPrompt = `You are a helpful chatbot for an eCommerce clothing website. You must use the following product info to answer user queries: ${productInfo}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );


    
    const botReply = response.data.choices[0].message.content;
    res.json({ reply: botReply });

  } catch (error) {
    console.error('Chatbot Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong with the chatbot' });
  }
};

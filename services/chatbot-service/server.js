const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const db = require('../../shared/config/database');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Chat with AI
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  
  try {
    // Log user message
    await db.execute(
      'INSERT INTO chat_logs (user_id, message, sender) VALUES (?, ?, ?)',
      [req.user.sub, message, 'user']
    );

    // Simple AI response simulation
    const responses = [
      "I can help you find books! What genre are you interested in?",
      "Would you like recommendations based on your previous purchases?",
      "I can assist with order tracking and account questions.",
      "Let me help you find the perfect book for your needs!"
    ];
    
    const aiResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Log AI response
    await db.execute(
      'INSERT INTO chat_logs (user_id, message, sender) VALUES (?, ?, ?)',
      [req.user.sub, aiResponse, 'ai']
    );

    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: 'Chat service unavailable' });
  }
});

// Get chat history
app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM chat_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 50',
      [req.user.sub]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// WebSocket connection for real-time chat
io.on('connection', (socket) => {
  console.log('User connected to chat');
  
  socket.on('chat_message', async (data) => {
    // Process message and emit response
    const response = "Thanks for your message! How can I help you today?";
    socket.emit('ai_response', { message: response });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from chat');
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'chatbot-service' });
});

server.listen(PORT, () => {
  console.log(`Chatbot Service running on port ${PORT}`);
});

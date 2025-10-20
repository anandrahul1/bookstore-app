const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('../../shared/config/database');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Process payment
app.post('/api/payments', authenticateToken, async (req, res) => {
  const { orderId, paymentMethod, amount } = req.body;
  
  try {
    // Verify order belongs to user
    const [orderRows] = await db.execute(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [orderId, req.user.sub]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Simulate payment processing
    const paymentId = `pay_${Date.now()}`;
    const status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate

    // Record payment
    await db.execute(
      'INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, req.user.sub, amount, paymentMethod, status, paymentId]
    );

    // Update order status
    if (status === 'completed') {
      await db.execute(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['paid', orderId]
      );
    }

    res.json({ 
      paymentId, 
      status, 
      message: status === 'completed' ? 'Payment successful' : 'Payment failed' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get payment history
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.sub]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service' });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

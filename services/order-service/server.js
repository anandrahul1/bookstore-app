const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const db = require('../../shared/config/database');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.execute(`
      SELECT ci.*, b.price 
      FROM cart_items ci 
      JOIN books b ON ci.book_id = b.book_id 
      WHERE ci.user_id = ?
    `, [req.user.sub]);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.sub, total, 'pending']
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cartItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.sub]);

    await connection.commit();
    res.json({ orderId, total, message: 'Order created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.sub]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const [orderRows] = await db.execute(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
      [req.params.id, req.user.sub]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [itemRows] = await db.execute(`
      SELECT oi.*, b.title, b.author 
      FROM order_items oi 
      JOIN books b ON oi.book_id = b.book_id 
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ order: orderRows[0], items: itemRows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'order-service' });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

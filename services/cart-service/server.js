const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('../../shared/config/database');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ci.*, b.title, b.price, b.author 
      FROM cart_items ci 
      JOIN books b ON ci.book_id = b.book_id 
      WHERE ci.user_id = ?
    `, [req.user.sub]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { book_id, quantity } = req.body;
  try {
    await db.execute(`
      INSERT INTO cart_items (user_id, book_id, quantity) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `, [req.user.sub, book_id, quantity, quantity]);
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item
app.put('/api/cart/:bookId', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?',
      [quantity, req.user.sub, req.params.bookId]
    );
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/:bookId', authenticateToken, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND book_id = ?',
      [req.user.sub, req.params.bookId]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'cart-service' });
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});

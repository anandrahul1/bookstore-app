const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('../../shared/config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Get all books with pagination and filtering
app.get('/api/books', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, author } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM books WHERE is_active = 1';
    const params = [];
    
    // Add category filter
    if (category) {
      query += ' AND category_id = ?';
      params.push(category);
    }
    
    // Add author filter  
    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE is_active = 1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category_id = ?';
      countParams.push(category);
    }
    
    if (author) {
      countQuery += ' AND author LIKE ?';
      countParams.push(`%${author}%`);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      books: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM books WHERE book_id = ? AND is_active = 1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Search books
app.get('/api/books/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    const [rows] = await db.execute(
      'SELECT * FROM books WHERE (title LIKE ? OR author LIKE ?) AND is_active = 1',
      [searchQuery, searchQuery]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// NEW API: Get books by category with enhanced filtering
app.get('/api/books/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { sortBy = 'title', order = 'ASC', inStock = false } = req.query;
    
    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      JOIN categories c ON b.category_id = c.category_id 
      WHERE b.is_active = 1 AND b.category_id = ?
    `;
    const params = [categoryId];
    
    // Filter by stock availability
    if (inStock === 'true') {
      query += ' AND b.stock_quantity > 0';
    }
    
    // Add sorting
    const validSortFields = ['title', 'author', 'price', 'created_at'];
    const validOrder = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validOrder.includes(order.toUpperCase())) {
      query += ` ORDER BY b.${sortBy} ${order.toUpperCase()}`;
    }
    
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books by category' });
  }
});

// NEW API: Get book recommendations based on user preferences
app.get('/api/books/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    
    // Get user's purchase history to recommend similar books
    const [userBooks] = await db.execute(`
      SELECT DISTINCT b.category_id, b.author 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN books b ON oi.book_id = b.book_id
      WHERE o.user_id = ? AND o.status = 'delivered'
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [userId]);
    
    if (userBooks.length === 0) {
      // No purchase history, return popular books
      const [popularBooks] = await db.execute(`
        SELECT b.*, COUNT(oi.book_id) as order_count
        FROM books b
        LEFT JOIN order_items oi ON b.book_id = oi.book_id
        WHERE b.is_active = 1 AND b.stock_quantity > 0
        GROUP BY b.book_id
        ORDER BY order_count DESC, b.created_at DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      return res.json(popularBooks);
    }
    
    // Get category and author based recommendations
    const categories = [...new Set(userBooks.map(book => book.category_id))];
    const authors = [...new Set(userBooks.map(book => book.author))];
    
    const [recommendations] = await db.execute(`
      SELECT DISTINCT b.*, 
        CASE 
          WHEN b.category_id IN (${categories.map(() => '?').join(',')}) THEN 2
          WHEN b.author IN (${authors.map(() => '?').join(',')}) THEN 1
          ELSE 0
        END as relevance_score
      FROM books b
      WHERE b.is_active = 1 
        AND b.stock_quantity > 0
        AND b.book_id NOT IN (
          SELECT DISTINCT oi.book_id 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.order_id 
          WHERE o.user_id = ?
        )
        AND (b.category_id IN (${categories.map(() => '?').join(',')}) 
             OR b.author IN (${authors.map(() => '?').join(',')}))
      ORDER BY relevance_score DESC, b.created_at DESC
      LIMIT ?
    `, [...categories, ...authors, userId, ...categories, ...authors, parseInt(limit)]);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'catalog-service', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Catalog Service running on port ${PORT}`);
});

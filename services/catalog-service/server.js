const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('../../shared/config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM books WHERE is_active = 1');
    res.json(rows);
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'catalog-service' });
});

app.listen(PORT, () => {
  console.log(`Catalog Service running on port ${PORT}`);
});

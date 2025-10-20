// Manual test file with secure, well-written code

const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

// GOOD: Using environment variables
const dbPassword = process.env.DB_PASSWORD;
const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;

// GOOD: Parameterized queries prevent SQL injection
app.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    // Input validation
    if (!searchTerm || searchTerm.length > 100) {
      return res.status(400).json({ error: 'Invalid search term' });
    }
    
    // Parameterized query
    const query = 'SELECT * FROM books WHERE title LIKE ?';
    const results = await db.execute(query, [`%${searchTerm}%`]);
    
    res.json(results);
  } catch (error) {
    logger.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GOOD: Input validation and sanitization
app.post('/user', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate inputs
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userData = { email, password: hashedPassword, name };
    await saveUser(userData);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('User creation failed:', error);
    res.status(500).json({ error: 'User creation failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

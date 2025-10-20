// This file contains good code that should pass Amazon Q review

const express = require('express');
const db = require('./shared/config/database');
const logger = require('./shared/utils/logger'); // Assuming you have a logger

const app = express();

// GOOD: Using environment variable for sensitive data
const dbPassword = process.env.DB_PASSWORD;

// GOOD: Parameterized query to prevent SQL injection
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    // GOOD: Proper error handling with try/catch
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    // GOOD: Strict equality
    if (rows.length === 0) {
      // GOOD: Proper logging instead of console.log
      logger.info(`User not found for ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Database query failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GOOD: Using const instead of var
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

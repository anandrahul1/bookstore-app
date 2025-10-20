// Test file with real security vulnerabilities for Amazon Q Developer

const express = require('express');
const mysql = require('mysql2');
const app = express();

// SECURITY ISSUE: Hardcoded database credentials
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'mySecretPassword123',  // This should trigger Amazon Q
  database: 'bookstore'
};

const connection = mysql.createConnection(dbConfig);

// SECURITY ISSUE: SQL Injection vulnerability
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;  // Vulnerable to SQL injection
  
  connection.query(query, (error, results) => {
    if (error) {
      console.log('Database error:', error);  // Logging sensitive info
      return res.status(500).send('Internal error');
    }
    res.json(results);
  });
});

// SECURITY ISSUE: Hardcoded API key
const API_KEY = "sk-1234567890abcdef";  // This should be in environment variables

// QUALITY ISSUE: No input validation
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // No validation, no sanitization
  const loginQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  connection.query(loginQuery, (error, results) => {
    if (results.length > 0) {
      res.json({ success: true, token: API_KEY });
    } else {
      res.status(401).json({ success: false });
    }
  });
});

// QUALITY ISSUE: Missing error handling
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

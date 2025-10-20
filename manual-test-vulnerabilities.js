// Manual test file with intentional security vulnerabilities

const express = require('express');
const app = express();

// CRITICAL: Hardcoded AWS credentials
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// CRITICAL: Database password in plain text
const dbPassword = "SuperSecret123!";

// HIGH: SQL Injection vulnerability
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  const query = `SELECT * FROM books WHERE title LIKE '%${searchTerm}%'`;
  // This is vulnerable to SQL injection
  db.query(query, (err, results) => {
    res.json(results);
  });
});

// MEDIUM: No input validation
app.post('/user', (req, res) => {
  const userData = req.body;
  // No validation - accepts any input
  saveUser(userData);
  res.json({success: true});
});

// LOW: Console.log in production
console.log("Starting server with password:", dbPassword);

app.listen(3000);

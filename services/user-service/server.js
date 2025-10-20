const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('../../shared/config/database');
const { authenticateToken } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, email, first_name, last_name, phone, address, created_at FROM users WHERE cognito_id = ?',
      [req.user.sub]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { first_name, last_name, phone, address } = req.body;
  
  try {
    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE cognito_id = ?',
      [first_name, last_name, phone, address, req.user.sub]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create user profile (called after Cognito registration)
app.post('/api/profile', authenticateToken, async (req, res) => {
  const { email, first_name, last_name, phone, address } = req.body;
  
  try {
    await db.execute(
      'INSERT INTO users (cognito_id, email, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.sub, email, first_name, last_name, phone, address]
    );
    
    res.json({ message: 'Profile created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

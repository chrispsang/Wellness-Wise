const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
      const existingUser = await pool.query(
          'SELECT * FROM users WHERE username = $1 OR email = $2',
          [username, email]
      );

      if (existingUser.rows.length > 0) {
          return res.status(409).json({ message: 'An account with this username or email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
          'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
          [username, hashedPassword, email]
      );
      res.json(newUser.rows[0]);
  } catch (err) {
      res.status(500).send(err.message);
  }
};


const login = async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

      if (user.rows.length === 0) {
          return res.status(404).json({ message: 'Username not found. Please register first.' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
          { id: user.rows[0].id, username: user.rows[0].username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' }
      );
      res.json({ message: 'Login successful', accessToken, userId: user.rows[0].id });
  } catch (err) {
      res.status(500).send(err.message);
  }
};

module.exports = {
    register,
    login
};

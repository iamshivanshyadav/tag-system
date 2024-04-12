// auth.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import authenticateUser from '../middlewares/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user' // Set role to 'user' if not provided
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role },process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;

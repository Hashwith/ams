const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path to your User model
const bcrypt = require('bcrypt');
const router = express.Router();

// Secret key for JWT (use environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET;

// Login route
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
              id: user._id,
              name: user.username,
              predictions: user.predictionsToday||0 , // Default to 0 if undefined
            },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expiration time
          );
        // Send the token and user details to the client
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

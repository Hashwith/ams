const express = require('express');
const User = require('../models/User'); // Adjust the path to your User model
const bcrypt = require('bcrypt');
const router = express.Router();

// Registration route
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const saltRounds = 10; // Number of rounds for generating the salt
        const hash = await bcrypt.hash(password, saltRounds);

        // Create and save the new user
        const newUser = new User({ username, email, password: hash });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

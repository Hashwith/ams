const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Assuming auth middleware validates x-auth-token

// POST /api/assign-asset
router.post('/assign-asset', auth, async (req, res) => {
  try {
    const { userId, assetCode, assetName, assetModel } = req.body;

    // Validate required fields
    if (!userId || !assetCode) {
      return res.status(400).json({ msg: 'userId and assetCode are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if asset is already assigned (optional business logic)
    if (user.assignedAsset) {
      return res.status(400).json({ msg: 'User already has an assigned asset' });
    }

    // Update user with asset details
    user.assignedAsset = assetCode;
    user.assetName = assetName;
    user.assetModel = assetModel;
    await user.save();

    res.json({ msg: 'Asset assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Login attempt for:', username, 'with password:', password); // Debug log
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username); // Debug user not found
      return res.status(400).json({ message: 'User not found' });
    }
    console.log('Found user:', user.username, 'with password:', user.password); // Log stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', username); // Debug password mismatch
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });
    res.json({
      token,
      userType: user.role,
      departmentid: user.departmentid,
      username: user.username,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
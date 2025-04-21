const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose'); // Add this line

// POST /api/assign-asset
router.post('/assign-asset', auth, async (req, res) => {
  try {
    const { userId, assetCode, assetName, assetModel } = req.body;

    // Validate required fields
    if (!userId || !assetCode) {
      return res.status(400).json({ msg: 'userId and assetCode are required' });
    }

    // Validate userId format (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid userId format' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user already has an assigned asset
    if (user.assignedAsset) {
      return res.status(400).json({ msg: 'User already has an assigned asset' });
    }

    // Update user
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

module.exports = router;
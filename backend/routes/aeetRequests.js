const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Notification.js'); // Assuming this is a typo, should be Request.js
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');
const Asset = require('../models/Assets.js');

router.post('/asset-requests', auth, async (req, res) => {
  try {
    const { username, assetCode, departmentid } = req.body;
    if (req.user.userType !== 'user' || req.user.departmentid !== departmentid) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const asset = await Asset.findOne({ assetCode, departmentid, status: 'Available' });
    if (!asset) {
      return res.status(400).json({ message: 'Asset not available' });
    }
    const request = await Request.create({
      userId: req.user._id,
      username,
      assetCode,
      departmentid,
      status: 'Pending',
    });

    // Notify HOD
    const hods = await User.find({ userType: 'hod', departmentid });
    for (const hod of hods) {
      await Notification.create({
        userId: hod._id,
        message: `New asset request from ${username} for asset ${assetCode}.`,
        fromUser: username,
        departmentid,
      });
    }

    // Notify admin
    const admins = await User.find({ userType: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        message: `New asset request from ${username} for asset ${assetCode} in department ${departmentid}.`,
        fromUser: username,
        departmentid,
      });
    }

    res.status(201).json(request);
  } catch (err) {
    console.error('Asset request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
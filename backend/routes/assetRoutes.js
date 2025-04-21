const express = require('express');
const QRCode = require('qrcode');
const Asset = require('/models/Asset');

const router = express.Router();
const auth = require('../middleware/auth');
const Asset = require('../models/Assets.js');

router.get('/available-assets', auth, async (req, res) => {
  try {
    const { departmentid } = req.query;
    if (!departmentid) {
      return res.status(400).json({ message: 'Department ID is required' });
    }
    if (req.user.userType === 'user' && req.user.departmentid !== departmentid) {
      return res.status(403).json({ message: 'Access denied: Invalid department' });
    }
    const assets = await Asset.find({ departmentid, status: 'Available' });
    res.json(assets);
  } catch (err) {
    console.error('Available assets error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing routes (e.g., /user-assets) can remain unchanged unless they need adjustment
router.get('/user-assets', auth, async (req, res) => {
  try {
    const userAssets = await Asset.find({ assignedTo: req.user._id, status: 'Assigned' });
    res.json(userAssets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Add Asset & Generate QR Code
router.post('/add-asset', async (req, res) => {
    try {
        const { name, category, serialNumber } = req.body;

        // Generate QR Code with asset details
        const qrCodeData = `Asset Name: ${name}\nSerial: ${serialNumber}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        // Save Asset with QR Code in Database
        const newAsset = new Asset({ name, category, serialNumber, qrCode: qrCodeImage });
        await newAsset.save();

        res.status(201).json({ message: "Asset Added Successfully", asset: newAsset });
    } catch (error) {
        res.status(500).json({ error: "Error saving asset", details: error.message });
    }
});

module.exports = router;

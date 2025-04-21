const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  assetCode: { type: String, required: true },
  departmentid: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'HOD Approved', 'HOD Rejected', 'Admin Approved', 'Admin Rejected'] },
  rejectionComments: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);
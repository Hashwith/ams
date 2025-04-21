const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assetCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Available', 'Assigned', 'Under Maintenance'], default: 'Available' },
  departmentid: { type: String, required: true },
  qrCode: { type: String },
  type: String,
  brand: String,
  model: String,
  dateOfBuying: Date,
  assignedTo: { type: String }, // User ID if assigned
});

module.exports = mongoose.model('Asset', assetSchema);
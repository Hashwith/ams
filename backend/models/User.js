const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'hod'], default: 'user' },
  departmentid: { type: String },
  departmentname: { type: String },
  email: { type: String, unique: true },
  assignedAsset: { type: String },
});

module.exports = mongoose.model('User', userSchema);
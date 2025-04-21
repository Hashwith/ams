const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    fromUser: { type: String, required: true },
    departmentid: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  module.exports = mongoose.model('Notification', notificationSchema);
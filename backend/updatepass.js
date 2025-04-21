const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ams', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'hod', 'admin'], default: 'user' },
  departmentid: String,
  departmentname: String,
  assignedAsset: { type: String, default: null }
}));

async function hashPasswords() {
  try {
    const users = await User.find();
    for (const user of users) {
      // Check if the password is already hashed (starts with $2a$)
      if (!user.password.startsWith('$2a$')) {
        const plainPassword = user.password; // Use existing password as plaintext
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
        console.log(`Hashed password for ${user.username}: ${hashedPassword}`);
      } else {
        console.log(`Password for ${user.username} is already hashed, skipping.`);
      }
    }
    console.log('All passwords hashed successfully.');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

hashPasswords();
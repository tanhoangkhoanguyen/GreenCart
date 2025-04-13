import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,  // This ensures it can't be null
    unique: true     // This ensures it's unique
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
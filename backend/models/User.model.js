import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin'
    },
    terminalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Terminal',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error('No password hash found');
      return false;
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
export default User;
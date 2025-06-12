import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student','parent'],
    required: true,
  },
  regNumber: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    unique: true,
    sparse: true
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Add a field to link students to their parent
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber:{
    type:String,
    required:true,
  },
  password: {
    type: String,
    required: true,
  },
  photoUrl: { 
    type: String 
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: function() {
      return this.role === 'teacher' || this.role === 'student';
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = (models && models.User) || model('User', userSchema);

export default User;

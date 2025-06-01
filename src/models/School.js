import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const schoolSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  dean: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
schoolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const School = models.School || model('School', schoolSchema);

export default School;

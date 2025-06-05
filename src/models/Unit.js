import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const unitSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  capacity: {
    type: Number,
    default: null, // null means unlimited
    min: 0
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  description: {
    type: String
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound unique index on code and course to prevent duplicate unit codes within a course
unitSchema.index({ code: 1, course: 1 }, { unique: true });

// Virtual for enrolled count
unitSchema.virtual('enrolledCount', {
  ref: 'UnitRegistration',
  localField: '_id',
  foreignField: 'unit',
  count: true,
  match: { status: 'active' }
});

// Virtual for available slots
unitSchema.virtual('availableSlots').get(function() {
  if (!this.capacity) return null; // Unlimited
  return Math.max(0, this.capacity - (this.enrolledCount || 0));
});

const Unit = (models && models.Unit) || model('Unit', unitSchema);

export default Unit;

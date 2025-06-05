import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const timetableSchema = new Schema({
  semester: { 
    type: Schema.Types.ObjectId, 
    ref: 'Semester', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  effectiveFrom: {
    type: Date,
    required: true
  },
  effectiveTo: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date,
    default: null
  },
  metadata: {
    totalWeeks: {
      type: Number,
      default: 14
    },
    hoursPerWeek: {
      type: Number,
      default: 40
    }
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
timetableSchema.index({ semester: 1, course: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Validation to ensure effectiveTo is after effectiveFrom
timetableSchema.pre('save', function(next) {
  if (this.effectiveTo <= this.effectiveFrom) {
    next(new Error('Effective end date must be after start date'));
  } else {
    next();
  }
});

// Method to publish timetable
timetableSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to archive timetable
timetableSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Virtual to check if timetable is active
timetableSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         now >= this.effectiveFrom && 
         now <= this.effectiveTo;
});

const Timetable = (models && models.Timetable) || model('Timetable', timetableSchema);

export default Timetable;

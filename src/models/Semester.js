import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a semester name'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  registrationStartDate: {
    type: Date,
    required: [true, 'Please provide a registration start date'],
  },
  registrationEndDate: {
    type: Date,
    required: [true, 'Please provide a registration end date'],
  },
  maxUnitsPerStudent: {
    type: Number,
    default: 8,
    min: 1
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  units: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if registration is open
semesterSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return now >= this.registrationStartDate && now <= this.registrationEndDate;
});

// Virtual for registration days remaining
semesterSchema.virtual('registrationDaysRemaining').get(function() {
  const now = new Date();
  if (now > this.registrationEndDate) return 0;
  if (now < this.registrationStartDate) return -1; // Not started yet
  
  const diffTime = Math.abs(this.registrationEndDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for checking if semester is active
semesterSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Update the updatedAt timestamp before saving
semesterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure end date is after start date
semesterSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  
  // Validate registration dates
  if (this.registrationStartDate && this.registrationEndDate) {
    if (this.registrationEndDate <= this.registrationStartDate) {
      this.invalidate('registrationEndDate', 'Registration end date must be after registration start date');
    }
    
    // Registration should be within semester dates
    if (this.registrationStartDate < this.startDate) {
      this.invalidate('registrationStartDate', 'Registration cannot start before semester starts');
    }
    
    if (this.registrationEndDate > this.endDate) {
      this.invalidate('registrationEndDate', 'Registration cannot end after semester ends');
    }
  }
  
  next();
});

const Semester = (models && models.Semester) || model('Semester', semesterSchema);

export default Semester;

import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const unitRegistrationSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit', 
    required: true 
  },
  semester: { 
    type: Schema.Types.ObjectId, 
    ref: 'Semester', 
    required: true 
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  }
}, { 
  timestamps: true 
});

// Compound unique index to prevent duplicate registrations
unitRegistrationSchema.index({ student: 1, unit: 1, semester: 1 }, { unique: true });

const UnitRegistration = (models && models.UnitRegistration) || model('UnitRegistration', unitRegistrationSchema);

export default UnitRegistration;

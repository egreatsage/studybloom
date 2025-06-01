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
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

// Create a compound unique index on code and course to prevent duplicate unit codes within a course
unitSchema.index({ code: 1, course: 1 }, { unique: true });

const Unit = models.Unit || model('Unit', unitSchema);

export default Unit;
